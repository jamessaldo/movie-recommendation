import { RatingService } from "../services/rating";
import { AuthController } from "./auth";

export class RatingController {
  private ratingService: RatingService;
  private authController: AuthController;

  constructor() {
    this.ratingService = new RatingService();
    this.authController = new AuthController();
  }

  /**
   * POST /rate - Submit or update a movie rating
   * Requires valid session, validates input, performs upsert
   */
  async submitRating(
    body: any,
    sessionId: string | null,
    templateRenderer: any
  ): Promise<{ content: string; status: number; headers?: any }> {
    try {
      // Validate session
      if (!sessionId) {
        return {
          content: this.renderSessionExpiredPartial(templateRenderer),
          status: 401,
        };
      }

      const authContext = await this.authController.getCurrentUser(sessionId);
      if (!authContext.isLoggedIn) {
        return {
          content: this.renderSessionExpiredPartial(templateRenderer),
          status: 401,
        };
      }

      // Parse and validate inputs
      const movieId = parseInt(body.movie_id);
      const score = parseInt(body.score);

      if (!movieId || movieId <= 0) {
        return {
          content: this.renderErrorPartial(templateRenderer, "Movie not found"),
          status: 404,
        };
      }

      if (!score || score < 1 || score > 5) {
        return {
          content: this.renderErrorPartial(
            templateRenderer,
            "Invalid rating. Please select 1-5 stars."
          ),
          status: 422,
        };
      }

      // Perform upsert
      await this.ratingService.upsertRating(
        movieId,
        authContext.user!.id,
        score
      );
      this.ratingService.logRatingEvent(authContext.user!.id, movieId, score);

      // Get updated stats and user rating
      const stats = await this.ratingService.getMovieStatsWithTiming(movieId);
      const userRating = await this.ratingService.getUserRating(
        movieId,
        authContext.user!.id
      );

      // Render stats partial with out-of-band rating controls update
      const statsContent = templateRenderer.renderPartialOnly(
        "rating/stats.html",
        {
          id: movieId,
          stats,
          userRating,
          is_logged_in: true,
        }
      );

      const controlsOOB = templateRenderer.renderPartialOnly(
        "rating/controls.html",
        {
          id: movieId,
          userRating,
          is_logged_in: true,
        }
      );

      // Wrap the controls with hx-swap-oob attribute
      const oobControls = controlsOOB.replace(
        `id="rating-${movieId}"`,
        `id="rating-${movieId}" hx-swap-oob="true"`
      );

      return {
        content: statsContent + "\n" + oobControls,
        status: 200,
      };
    } catch (error) {
      console.error("Rating submission error:", error);
      return {
        content: this.renderErrorPartial(
          templateRenderer,
          "An error occurred while saving your rating"
        ),
        status: 500,
      };
    }
  }

  /**
   * GET /stats/:movie_id - Get rating statistics for a movie (public endpoint)
   */
  async getMovieStats(
    movieId: string,
    sessionId: string | null,
    templateRenderer: any
  ): Promise<{ content: string; status: number }> {
    try {
      const movieIdNum = parseInt(movieId);
      if (!movieIdNum || movieIdNum <= 0) {
        return {
          content: this.renderErrorPartial(templateRenderer, "Movie not found"),
          status: 404,
        };
      }

      // Get stats (public data)
      const stats = await this.ratingService.getMovieStatsWithTiming(
        movieIdNum
      );

      // Get user rating if logged in
      let userRating = null;
      let isLoggedIn = false;

      if (sessionId) {
        const authContext = await this.authController.getCurrentUser(sessionId);
        if (authContext.isLoggedIn) {
          isLoggedIn = true;
          userRating = await this.ratingService.getUserRating(
            movieIdNum,
            authContext.user!.id
          );
        }
      }

      // Render stats partial
      const content = templateRenderer.renderPartialOnly("rating/stats.html", {
        id: movieIdNum,
        stats,
        userRating,
        is_logged_in: isLoggedIn,
      });

      return {
        content,
        status: 200,
      };
    } catch (error) {
      console.error("Stats retrieval error:", error);
      return {
        content: this.renderErrorPartial(
          templateRenderer,
          "Unable to load rating statistics"
        ),
        status: 500,
      };
    }
  }

  private renderErrorPartial(templateRenderer: any, message: string): string {
    return `<div class="uk-alert-danger" uk-alert>
      <a class="uk-alert-close" uk-close></a>
      <p>${message}</p>
    </div>`;
  }

  private renderSessionExpiredPartial(templateRenderer: any): string {
    return `<div class="uk-alert-warning" uk-alert>
      <a class="uk-alert-close" uk-close></a>
      <p>Session expired, please <a href="/login" class="uk-link">log in</a></p>
      <script>
        // Refresh page to update authentication state
        setTimeout(() => window.location.reload(), 1000);
      </script>
    </div>`;
  }
}

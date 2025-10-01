import { RatingService } from "../services/rating";
import { tmdbService } from "../services/tmdb";

export interface MovieGridContext {
  movies: any[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pageNumbers: Array<{
    number: number;
    isActive: boolean;
  }>;
  showFirstEllipsis: boolean;
  showLastEllipsis: boolean;
  isCurrentPage1: boolean;
  isCurrentPage20: boolean;
}

export class MoviesController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  async getHomepage(
    page: number = 1,
    userId?: string
  ): Promise<MovieGridContext | { error: string }> {
    // Clamp page to valid range (1-20)
    if (page < 1 || page > 20) {
      return { error: "invalid_page" };
    }

    try {
      const response = await tmdbService.getTopRated(page);

      // Enhance movies with rating data
      const movies = await Promise.all(
        response.results.map(async (movie) => {
          const stats = await this.ratingService.getMovieStats(movie.id);
          const userRating = userId
            ? await this.ratingService.getUserRating(movie.id, userId)
            : null;

          return {
            id: movie.id,
            title: movie.title,
            releaseYear: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "Unknown",
            posterUrl: tmdbService.buildPosterURL(movie.poster_path),
            rating: movie.vote_average.toFixed(1),
            // v2 rating data
            stats,
            userRating,
            // Include login state in movie context
            is_logged_in: !!userId,
          };
        })
      );

      const totalPages = Math.min(response.total_pages, 20); // Cap at 20 pages

      // Generate pagination numbers (show current page and 2 pages on each side, excluding 1 and 20)
      const pageNumbers = [];
      const startPage = Math.max(2, page - 2);
      const endPage = Math.min(19, page + 2);

      for (let i = startPage; i <= endPage; i++) {
        // Only include pages between 2 and 19 (1 and 20 are shown separately)
        if (i > 1 && i < 20) {
          pageNumbers.push({
            number: i,
            isActive: i === page,
          });
        }
      }

      const result = {
        movies,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        pageNumbers,
        showFirstEllipsis: page > 4,
        showLastEllipsis: page < 17,
        isCurrentPage1: page === 1,
        isCurrentPage20: page === 20,
      };

      return result;
    } catch (error) {
      console.error("TMDB API Error:", error);
      return { error: "tmdb_failure" };
    }
  }
}

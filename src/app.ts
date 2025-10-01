import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

import { AuthController } from "./routes/auth";
import { MoviesController } from "./routes/movies";
import { RatingController } from "./routes/rating";
import { templateRenderer } from "./services/template";

const app = new Elysia()
  .use(html())
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
    })
  )
  .decorate("templateRenderer", templateRenderer)
  .decorate("moviesController", new MoviesController())
  .decorate("authController", new AuthController())
  .decorate("ratingController", new RatingController())
  .derive(async ({ headers }) => {
    // Parse session ID from cookie header
    const cookieHeader = headers.cookie || "";
    const sessionMatch = cookieHeader.match(/auth_sid=([^;]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    const authController = new AuthController();
    const authContext = await authController.getCurrentUser(sessionId || "");

    return {
      authContext,
      sessionId: sessionId || null,
    };
  })
  // Health check endpoint
  .get("/healthz", () => {
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: "ok",
        tmdb: "ok",
      },
    };
  })
  // Debug endpoint to clear template cache (development only)
  .get("/debug/clear-cache", ({ templateRenderer }) => {
    if (process.env.NODE_ENV === "production") {
      return { error: "Not available in production" };
    }

    templateRenderer["cache"].clear();
    return {
      ok: true,
      message: "Template cache cleared",
      timestamp: new Date().toISOString(),
    };
  })
  // Homepage with movie grid
  .get(
    "/",
    async ({
      query,
      authContext,
      templateRenderer,
      moviesController,
      set,
      headers,
    }) => {
      const page = parseInt(query.page as string) || 1;

      // Handle invalid page numbers
      if (page < 1 || page > 20) {
        set.status = 302;
        set.headers = {
          location: "/?page=1",
          "set-cookie":
            "flash=Redirected from invalid page; Path=/; HttpOnly; Max-Age=5",
        };
        return;
      }

      const result = await moviesController.getHomepage(
        page,
        authContext.isLoggedIn ? authContext.user?.id : undefined
      );

      // Handle TMDB errors
      if ("error" in result) {
        if (result.error === "tmdb_failure") {
          set.status = 302;
          set.headers = { location: "/error/tmdb" };
          return;
        }
      }

      // Check for flash message from cookie
      const cookieHeader = headers.cookie || "";
      const flashMatch = cookieHeader.match(/flash=([^;]+)/);
      const flash = flashMatch ? decodeURIComponent(flashMatch[1]) : undefined;

      const authContent = authContext.isLoggedIn
        ? templateRenderer.renderPartialOnly("auth/header.html", {
            username: authContext.user?.username,
          })
        : templateRenderer.renderPartialOnly("auth/login.html");

      return templateRenderer.render("home.html", {
        ...result,
        flash,
        AUTH_CONTENT: authContent,
        is_logged_in: authContext.isLoggedIn,
        current_user: authContext.user,
      });
    }
  )
  // TMDB error page
  .get("/error/tmdb", ({ templateRenderer, authContext }) => {
    const authContent = authContext.isLoggedIn
      ? templateRenderer.renderPartialOnly("auth/header.html", {
          username: authContext.user?.username,
        })
      : templateRenderer.renderPartialOnly("auth/login.html");

    return templateRenderer.render("error/tmdb.html", {
      AUTH_CONTENT: authContent,
    });
  })
  // Login endpoint
  .post("/login", async ({ body, templateRenderer, authController, set }) => {
    const formData = body as any;
    const username = formData.username;

    if (!username) {
      set.status = 400;
      return templateRenderer.renderPartialOnly("auth/login.html", {
        error: "Username is required",
      });
    }

    const result = await authController.loginOrRegister(username);

    if (!result.success) {
      set.status = 400;
      return templateRenderer.renderPartialOnly("auth/login.html", {
        error: result.error,
        username,
      });
    }

    // Set session cookie
    set.headers = {
      "set-cookie": `auth_sid=${
        result.sessionId
      }; Path=/; HttpOnly; SameSite=Lax; Max-Age=${24 * 60 * 60}`,
      "HX-Refresh": "true",
    };

    // Return logged-in header partial
    return templateRenderer.renderPartialOnly("auth/header.html", { username });
  })
  // Logout endpoint
  .post(
    "/logout",
    async ({ templateRenderer, authController, sessionId, set }) => {
      if (sessionId) {
        await authController.logout(sessionId);
      }

      // Clear session cookie
      set.headers = {
        "set-cookie": "auth_sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;",
        "HX-Refresh": "true",
      };

      // Return login form partial
      return templateRenderer.renderPartialOnly("auth/login.html");
    }
  )
  // Rating submission endpoint (v2)
  .post(
    "/rate",
    async ({ body, sessionId, templateRenderer, ratingController, set }) => {
      const result = await ratingController.submitRating(
        body,
        sessionId,
        templateRenderer
      );

      set.status = result.status;
      if (result.headers) {
        set.headers = result.headers;
      }

      return result.content;
    }
  )
  // Rating stats endpoint (v2) - public
  .get(
    "/stats/:movie_id",
    async ({ params, sessionId, templateRenderer, ratingController, set }) => {
      const result = await ratingController.getMovieStats(
        params.movie_id,
        sessionId,
        templateRenderer
      );

      set.status = result.status;
      return result.content;
    }
  )
  .listen({
    port: parseInt(process.env.PORT || "3000"),
    hostname: "localhost",
  });

const port = process.env.PORT || 3000;
console.log(`🎬 Movie Rating PoC running at http://localhost:${port}`);

export default app;

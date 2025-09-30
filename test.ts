#!/usr/bin/env bun

/**
 * Simple test suite for Movie Rating PoC
 * Run with: bun test.ts
 */

import { describe, expect, test } from "bun:test";
import { AuthController } from "./src/routes/auth";
import { MoviesController } from "./src/routes/movies";
import { templateRenderer } from "./src/services/template";
import { tmdbService } from "./src/services/tmdb";

describe("TMDB Service", () => {
  test("should fetch top rated movies", async () => {
    const result = await tmdbService.getTopRated(1);
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.page).toBe(1);
  });

  test("should handle invalid page numbers", async () => {
    expect(() => tmdbService.getTopRated(0)).toThrow();
    expect(() => tmdbService.getTopRated(21)).toThrow();
  });

  test("should build poster URLs correctly", () => {
    const url = tmdbService.buildPosterURL("/test.jpg");
    expect(url).toBe("https://image.tmdb.org/t/p/w342/test.jpg");

    const nullUrl = tmdbService.buildPosterURL(null);
    expect(nullUrl).toBeNull();
  });
});

describe("Movies Controller", () => {
  test("should return movie grid data", async () => {
    const controller = new MoviesController();
    const result = await controller.getHomepage(1);

    expect(result).toHaveProperty("movies");
    expect(result).toHaveProperty("currentPage");
    expect(result).toHaveProperty("totalPages");

    if ("movies" in result) {
      expect(result.movies).toBeInstanceOf(Array);
      expect(result.currentPage).toBe(1);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    }
  });

  test("should handle invalid page numbers", async () => {
    const controller = new MoviesController();
    const result = await controller.getHomepage(0);
    expect(result).toHaveProperty("error");
  });
});

describe("Auth Controller", () => {
  test("should handle user creation", async () => {
    const controller = new AuthController();
    const username = `test_user_${Date.now()}`;

    const result = await controller.loginOrRegister(username);
    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();
  });

  test("should validate session correctly", async () => {
    const controller = new AuthController();
    const invalidContext = await controller.getCurrentUser("invalid_session");
    expect(invalidContext.isLoggedIn).toBe(false);
  });
});

describe("Template Renderer", () => {
  test("should render simple templates", () => {
    const result = templateRenderer.renderPartialOnly("movies/card.html", {
      title: "Test Movie",
      releaseYear: 2023,
      rating: "8.5",
      posterUrl: "https://example.com/poster.jpg",
    });

    expect(result).toContain("Test Movie");
    expect(result).toContain("2023");
    expect(result).toContain("8.5");
    expect(result).toContain("https://example.com/poster.jpg");
  });

  test("should handle each loops", () => {
    const movies = [
      { title: "Movie 1", rating: "8.0" },
      { title: "Movie 2", rating: "9.0" },
    ];

    const result = templateRenderer.renderPartialOnly("movies/grid.html", {
      movies,
      currentPage: 1,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
      nextPage: 2,
      prevPage: null,
    });

    expect(result).toContain("Movie 1");
    expect(result).toContain("Movie 2");
    expect(result).toContain("Page 1 of 5");
  });

  test("should handle conditionals", () => {
    const result = templateRenderer.renderPartialOnly("auth/header.html", {
      username: "testuser",
    });

    expect(result).toContain("testuser");
    expect(result).toContain("Logout");
  });
});

// Integration test
describe("End-to-End Flow", () => {
  test("should render complete homepage", async () => {
    const moviesController = new MoviesController();
    const authController = new AuthController();

    // Get movie data
    const movieData = await moviesController.getHomepage(1);
    expect(movieData).not.toHaveProperty("error");

    // Get auth context (not logged in)
    const authContext = await authController.getCurrentUser("");
    expect(authContext.isLoggedIn).toBe(false);

    // Render complete page
    const authContent = templateRenderer.renderPartialOnly("auth/login.html");
    const html = templateRenderer.render("home.html", {
      ...movieData,
      AUTH_CONTENT: authContent,
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Movie Rating PoC");
    expect(html).toContain("Top Rated Movies");
    expect(html.length).toBeGreaterThan(10000); // Should be substantial HTML

    // Check for movie content
    if ("movies" in movieData && movieData.movies.length > 0) {
      expect(html).toContain(movieData.movies[0].title);
    }
  });
});

console.log("🧪 Running Movie Rating PoC tests...");

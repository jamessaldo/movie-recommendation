export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  overview?: string;
}

export interface TMDBResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: Movie[];
}

export class TMDBError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "TMDBError";
  }
}

export class TMDBService {
  private readonly baseURL = "https://api.themoviedb.org/3";
  private readonly imageBaseURL = "https://image.tmdb.org/t/p/w342";
  private readonly token: string;

  constructor() {
    this.token = process.env.TMDB_TOKEN || "";
    if (!this.token) {
      console.warn(
        "⚠️  TMDB_TOKEN not set - API calls will fail but app will start"
      );
    }
  }

  async getTopRated(page: number): Promise<TMDBResponse> {
    // Validate page range (1-20)
    if (page < 1 || page > 20) {
      throw new TMDBError(
        `Invalid page number: ${page}. Must be between 1 and 20.`
      );
    }

    const url = `${this.baseURL}/movie/top_rated?page=${page}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new TMDBError(
          `TMDB API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = (await response.json()) as TMDBResponse;
      return data;
    } catch (error) {
      if (error instanceof TMDBError) {
        throw error;
      }
      throw new TMDBError(
        `Failed to fetch movies: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  buildPosterURL(posterPath: string | null): string | null {
    if (!posterPath) return null;
    return `${this.imageBaseURL}${posterPath}`;
  }
}

// Export singleton instance
export const tmdbService = new TMDBService();

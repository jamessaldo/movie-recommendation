import { dbService } from "../services/db";

export interface AuthContext {
  user: { id: string; username: string } | null;
  isLoggedIn: boolean;
}

export class AuthController {
  private readonly RESERVED_USERNAMES = ["admin", "root", "system"];
  private readonly USERNAME_REGEX = /^[A-Za-z0-9_]{4,30}$/;

  validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || typeof username !== "string") {
      return { valid: false, error: "Username is required" };
    }

    if (username.length < 4 || username.length > 30) {
      return { valid: false, error: "Username must be 4-30 characters" };
    }

    if (!this.USERNAME_REGEX.test(username)) {
      return {
        valid: false,
        error: "Username can only contain letters, numbers, and underscores",
      };
    }

    if (this.RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return { valid: false, error: "Username is reserved" };
    }

    return { valid: true };
  }

  async loginOrRegister(
    username: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // Check if user exists (case-sensitive)
      let user = await dbService.findUserByUsername(username);

      // If user doesn't exist, create them
      if (!user) {
        user = await dbService.createUser(username);
      }

      // Create new session (24-hour TTL)
      const session = await dbService.createSession(user.id);

      return { success: true, sessionId: session.id };
    } catch (error) {
      console.error("Login/Register error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  }

  async logout(sessionId: string): Promise<void> {
    try {
      await dbService.deleteSession(sessionId);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async getCurrentUser(sessionId: string): Promise<AuthContext> {
    if (!sessionId) {
      return { user: null, isLoggedIn: false };
    }

    try {
      const user = await dbService.findUserBySessionId(sessionId);

      if (user) {
        return {
          user: { id: user.id, username: user.username },
          isLoggedIn: true,
        };
      }
    } catch (error) {
      console.error("Get current user error:", error);
    }

    return { user: null, isLoggedIn: false };
  }
}

import { Database } from "bun:sqlite";

export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export class DatabaseService {
  private db: Database;

  constructor(dbPath: string = "database.db") {
    this.db = new Database(dbPath);
    this.db.exec("PRAGMA foreign_keys = ON");
  }

  // User operations
  async createUser(username: string): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, username, now, now);

    return {
      id,
      username,
      created_at: now,
      updated_at: now,
    };
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
    const result = stmt.get(username) as User | undefined;
    return result || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    const result = stmt.get(id) as User | undefined;
    return result || null;
  }

  // Session operations
  async createSession(userId: string): Promise<Session> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, userId, now.toISOString(), expiresAt.toISOString());

    return {
      id,
      user_id: userId,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };
  }

  async findSessionById(sessionId: string): Promise<Session | null> {
    const stmt = this.db.prepare("SELECT * FROM sessions WHERE id = ?");
    const result = stmt.get(sessionId) as Session | undefined;
    return result || null;
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.findSessionById(sessionId);
    if (!session) return false;

    const expiresAt = new Date(session.expires_at);
    const now = new Date();

    return now < expiresAt;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM sessions WHERE id = ?");
    stmt.run(sessionId);
  }

  async findUserBySessionId(sessionId: string): Promise<User | null> {
    if (!(await this.isSessionValid(sessionId))) {
      return null;
    }

    const stmt = this.db.prepare(`
      SELECT u.* FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `);

    const result = stmt.get(sessionId) as User | undefined;
    return result || null;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const stmt = this.db.prepare(
      "DELETE FROM sessions WHERE expires_at < datetime('now')"
    );
    stmt.run();
  }

  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

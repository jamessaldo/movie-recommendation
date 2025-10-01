import { Database } from "bun:sqlite";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DatabaseMigrator {
  private db: Database;

  constructor(dbPath: string = "database.db") {
    this.db = new Database(dbPath);
    this.db.exec("PRAGMA foreign_keys = ON");
  }

  async runMigrations(): Promise<void> {
    console.log("Running database migrations...");

    try {
      // Run migration 001
      const migration001Path = join(
        __dirname,
        "migrations",
        "001_initial_schema.sql"
      );
      const migration001SQL = readFileSync(migration001Path, "utf-8");

      this.db.exec(migration001SQL);
      console.log("✓ Migration 001_initial_schema.sql completed successfully");

      // Run migration 002
      const migration002Path = join(
        __dirname,
        "migrations",
        "002_rating_schema.sql"
      );
      const migration002SQL = readFileSync(migration002Path, "utf-8");

      this.db.exec(migration002SQL);
      console.log("✓ Migration 002_rating_schema.sql completed successfully");
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  getDatabase(): Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}

// For direct execution
if (Bun.main === import.meta.path) {
  const migrator = new DatabaseMigrator();
  await migrator.runMigrations();
  migrator.close();
  console.log("All migrations completed!");
}

import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, missingPersons, InsertMissingPerson, MissingPerson } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Missing Persons Queries

export async function createMissingPerson(data: InsertMissingPerson): Promise<MissingPerson> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(missingPersons).values(data);
  const insertId = result[0].insertId;
  
  const [person] = await db.select().from(missingPersons).where(eq(missingPersons.id, insertId));
  return person;
}

export async function getAllMissingPersons(): Promise<MissingPerson[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(missingPersons).where(eq(missingPersons.status, "missing")).orderBy(desc(missingPersons.createdAt));
}

export async function getMissingPersonById(id: number): Promise<MissingPerson | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const [person] = await db.select().from(missingPersons).where(eq(missingPersons.id, id));
  return person;
}

export async function updateMissingPersonStatus(id: number, status: "missing" | "found" | "closed"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(missingPersons).set({ status }).where(eq(missingPersons.id, id));
}

export async function getMissingPersonsByReporter(reporterId: number): Promise<MissingPerson[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(missingPersons).where(eq(missingPersons.reporterId, reporterId)).orderBy(desc(missingPersons.createdAt));
}

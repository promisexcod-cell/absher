import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Missing persons table - stores reported missing person information
 */
export const missingPersons = mysqlTable("missing_persons", {
  id: int("id").autoincrement().primaryKey(),
  // Reporter info
  reporterId: int("reporterId").notNull(),
  // Missing person info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  nationalId: varchar("nationalId", { length: 20 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  description: text("description"),
  lastSeenLocation: text("lastSeenLocation"),
  lastSeenDate: timestamp("lastSeenDate"),
  // Photo stored in S3
  photoUrl: text("photoUrl"),
  photoKey: varchar("photoKey", { length: 255 }),
  // Status
  status: mysqlEnum("status", ["missing", "found", "closed"]).default("missing").notNull(),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MissingPerson = typeof missingPersons.$inferSelect;
export type InsertMissingPerson = typeof missingPersons.$inferInsert;

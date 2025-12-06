import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("missingPerson.list", () => {
  it("requires authentication (privacy protection)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw because list now requires authentication
    await expect(caller.missingPerson.list()).rejects.toThrow();
  });

  it("returns user's own reports when authenticated", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.missingPerson.list();

    // Should return an array (may be empty if no reports by this user)
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("missingPerson.getById", () => {
  it("requires authentication (privacy protection)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw because getById now requires authentication
    await expect(caller.missingPerson.getById({ id: 99999 })).rejects.toThrow();
  });

  it("returns undefined for non-existent person when authenticated", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.missingPerson.getById({ id: 99999 });

    expect(result).toBeUndefined();
  });
});

describe("missingPerson.create", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.missingPerson.create({
        fullName: "Test Person",
        gender: "male",
      })
    ).rejects.toThrow();
  });
});

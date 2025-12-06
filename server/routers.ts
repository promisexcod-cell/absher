import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createMissingPerson, getAllMissingPersons, getMissingPersonById, updateMissingPersonStatus, getMissingPersonsByReporter } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  missingPerson: router({
    // Create a new missing person report
    create: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        age: z.number().optional(),
        gender: z.enum(["male", "female"]),
        nationalId: z.string().optional(),
        phoneNumber: z.string().optional(),
        description: z.string().optional(),
        lastSeenLocation: z.string().optional(),
        lastSeenDate: z.string().optional(),
        photoBase64: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let photoUrl: string | undefined;
        let photoKey: string | undefined;

        // Upload photo to S3 if provided
        if (input.photoBase64) {
          const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const fileKey = `missing-persons/${ctx.user.id}/${nanoid()}.jpg`;
          
          const result = await storagePut(fileKey, buffer, "image/jpeg");
          photoUrl = result.url;
          photoKey = result.key;
        }

        const person = await createMissingPerson({
          reporterId: ctx.user.id,
          fullName: input.fullName,
          age: input.age,
          gender: input.gender,
          nationalId: input.nationalId || null,
          phoneNumber: input.phoneNumber || null,
          description: input.description || null,
          lastSeenLocation: input.lastSeenLocation || null,
          lastSeenDate: input.lastSeenDate ? new Date(input.lastSeenDate) : null,
          photoUrl: photoUrl || null,
          photoKey: photoKey || null,
        });

        return person;
      }),

    // Get all missing persons (public for detection feature)
    list: publicProcedure.query(async () => {
      return getAllMissingPersons();
    }),

    // Get a specific missing person by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getMissingPersonById(input.id);
      }),

    // Update status (for marking as found)
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["missing", "found", "closed"]),
      }))
      .mutation(async ({ input }) => {
        await updateMissingPersonStatus(input.id, input.status);
        return { success: true };
      }),

    // Get reports by current user
    myReports: protectedProcedure.query(async ({ ctx }) => {
      return getMissingPersonsByReporter(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;

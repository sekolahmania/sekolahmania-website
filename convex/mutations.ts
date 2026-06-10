import { mutation } from "./_generated/server";
import { v } from "convex/values";

// SekolahMania — database write functions
// Each mutation validates its args and inserts one document.
// (Queries live in queries.ts, e.g. listRecentQuestions.)

export const insertQuestion = mutation({
  args: {
    name: v.string(),
    school: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", args);
  },
});

export const insertFeedback = mutation({
  args: {
    name: v.string(),
    school: v.optional(v.string()),
    session: v.optional(v.string()),
    rating: v.optional(v.number()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", args);
  },
});

export const insertUnitPlan = mutation({
  args: {
    mapel: v.string(),
    kelas: v.optional(v.string()),
    waktu: v.optional(v.string()),
    profil: v.optional(v.string()),
    tujuan: v.string(),
    topik: v.optional(v.string()),
    pedagogi: v.optional(v.string()),
    lingkungan: v.optional(v.string()),
    mitra: v.optional(v.string()),
    memahami: v.optional(v.string()),
    mengaplikasi: v.optional(v.string()),
    merefleksi: v.optional(v.string()),
    as_awal: v.optional(v.string()),
    as_proses: v.optional(v.string()),
    as_akhir: v.optional(v.string()),
    catatan: v.optional(v.string()),
    dimensi: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("unit_plans", args);
  },
});

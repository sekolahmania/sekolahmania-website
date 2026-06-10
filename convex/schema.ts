import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// SekolahMania — Convex document schema
// NOTE: Do NOT add a `created_at` field. Convex automatically manages
// a built-in `_creationTime` timestamp on every document. Sending
// `created_at` from the client will trigger a schema validation error.

export default defineSchema({
  // Q&A questions submitted by teachers (#tanya form)
  questions: defineTable({
    name: v.string(),
    school: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
  }),

  // Session feedback (#feedback form)
  feedback: defineTable({
    name: v.string(),
    school: v.optional(v.string()),
    session: v.optional(v.string()),
    rating: v.optional(v.number()),
    message: v.string(),
  }),

  // Unit Plan Builder submissions (#unitplan wizard — RPM drafts)
  unit_plans: defineTable({
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
  }),
});

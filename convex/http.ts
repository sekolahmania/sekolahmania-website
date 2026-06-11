import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// SekolahMania — HTTP Actions router
// These are the public HTTPS endpoints called by fetch() from index.html.
// Endpoints: /submitQuestion, /submitFeedback, /submitUnitPlan

const http = httpRouter();

// ── CORS ──────────────────────────────────────────────────────────────────
// CORS responses can only return ONE Access-Control-Allow-Origin value, so we
// check the request's Origin against an allow-list and echo back the match.
// This supports both the apex and www subdomain (browsers treat them as
// different origins, and Vercel serves the site from www.sekolahmania.com).
const ALLOWED_ORIGINS = [
  "https://sekolahmania.com",
  "https://www.sekolahmania.com",
];

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

// Preflight handler shared by all routes
const preflight = httpAction(
  async (_ctx, request) =>
    new Response(null, { status: 204, headers: corsHeaders(request) }),
);

// ── /submitQuestion ─────────────────────────────────────────────────────────
http.route({ path: "/submitQuestion", method: "OPTIONS", handler: preflight });
http.route({
  path: "/submitQuestion",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.name?.trim() || !body.message?.trim()) {
        return json(request, { error: "name and message are required" }, 400);
      }
      const id = await ctx.runMutation(api.mutations.insertQuestion, {
        name: body.name.trim(),
        school: body.school?.trim() || undefined,
        subject: body.subject || undefined,
        message: body.message.trim(),
      });
      return json(request, { success: true, id }, 201);
    } catch (err) {
      return json(request, { error: "Server error" }, 500);
    }
  }),
});

// ── /submitFeedback ──────────────────────────────────────────────────────────
http.route({ path: "/submitFeedback", method: "OPTIONS", handler: preflight });
http.route({
  path: "/submitFeedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.name?.trim() || !body.message?.trim()) {
        return json(request, { error: "name and message are required" }, 400);
      }
      const id = await ctx.runMutation(api.mutations.insertFeedback, {
        name: body.name.trim(),
        school: body.school?.trim() || undefined,
        session: body.session || undefined,
        rating: typeof body.rating === "number" ? body.rating : undefined,
        message: body.message.trim(),
      });
      return json(request, { success: true, id }, 201);
    } catch (err) {
      return json(request, { error: "Server error" }, 500);
    }
  }),
});

// ── /submitUnitPlan ──────────────────────────────────────────────────────────
http.route({ path: "/submitUnitPlan", method: "OPTIONS", handler: preflight });
http.route({
  path: "/submitUnitPlan",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.tujuan?.trim()) {
        return json(request, { error: "tujuan is required" }, 400);
      }
      const id = await ctx.runMutation(api.mutations.insertUnitPlan, {
        mapel: body.mapel || "Biologi",
        kelas: body.kelas || undefined,
        waktu: body.waktu || undefined,
        profil: body.profil || undefined,
        tujuan: body.tujuan.trim(),
        topik: body.topik || undefined,
        pedagogi: body.pedagogi || undefined,
        lingkungan: body.lingkungan || undefined,
        mitra: body.mitra || undefined,
        memahami: body.memahami || undefined,
        mengaplikasi: body.mengaplikasi || undefined,
        merefleksi: body.merefleksi || undefined,
        as_awal: body.as_awal || undefined,
        as_proses: body.as_proses || undefined,
        as_akhir: body.as_akhir || undefined,
        catatan: body.catatan || undefined,
        dimensi: Array.isArray(body.dimensi) ? body.dimensi : [],
      });
      return json(request, { success: true, id }, 201);
    } catch (err) {
      return json(request, { error: "Server error" }, 500);
    }
  }),
});

export default http;

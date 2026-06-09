import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

function corsHeaders(origin: string = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Preflight requests for CORS
["/submitQuestion", "/submitFeedback", "/submitUnitPlan"].forEach((path) => {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(
      async () => new Response(null, { status: 204, headers: corsHeaders() }),
    ),
  });
});

http.route({
  path: "/submitQuestion",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.name?.trim() || !body.message?.trim()) {
        return new Response(
          JSON.stringify({ error: "name and message are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders() },
          },
        );
      }
      const id = await ctx.runMutation(api.mutations.insertQuestion, {
        name: body.name.trim(),
        school: body.school?.trim() || undefined,
        subject: body.subject || undefined,
        message: body.message.trim(),
      });
      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  }),
});

http.route({
  path: "/submitFeedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.name?.trim() || !body.message?.trim()) {
        return new Response(
          JSON.stringify({ error: "name and message are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders() },
          },
        );
      }
      const id = await ctx.runMutation(api.mutations.insertFeedback, {
        name: body.name.trim(),
        school: body.school?.trim() || undefined,
        session: body.session || undefined,
        rating: typeof body.rating === "number" ? body.rating : undefined,
        message: body.message.trim(),
      });
      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  }),
});

http.route({
  path: "/submitUnitPlan",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (!body.tujuan?.trim()) {
        return new Response(JSON.stringify({ error: "tujuan is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
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
      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  }),
});

export default http;

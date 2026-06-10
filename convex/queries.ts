import { query } from "./_generated/server";

// SekolahMania — read functions
// listRecentQuestions powers the optional realtime live Q&A feed.

export const listRecentQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").order("desc").take(20);
  },
});

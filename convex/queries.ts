import { query } from "./_generated/server";

export const listRecentQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").order("desc").take(20);
  },
});

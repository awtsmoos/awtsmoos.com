
// B"H
const { sendToAlias } = require("./aliasRouting.js");

async function handleLivePreview(ctx, client, data) {
  const recipient = data.to;
  const rcptShort = recipient.split("_at_")[0].split("@")[0];

  let allowed = false;

  if (ctx.settingsCache.has(rcptShort)) {
    allowed = ctx.settingsCache.get(rcptShort);
  } else if (ctx.db) {
    const settings = await ctx.db.get(`/social/aliases/${rcptShort}/emailSettings`);
    allowed = settings && settings.viewTyping === true;
    ctx.settingsCache.set(rcptShort, allowed);
  }

  if (!allowed) return;

  sendToAlias(ctx, rcptShort, {
    type: "LIVE_PREVIEW",
    from: client.aliasId,
    content: data.content
  });
}

module.exports = { handleLivePreview };

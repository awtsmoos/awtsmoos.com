
// B"H
const { handleAliasLogin } = require("./aliasRouting.js");
const { handleLivePreview } = require("./livePreview.js");
const { handleTunnelRegister, handleTunnelResponse } = require("./tunnelRelay.js");

async function routeMessage(ctx, client, msg) {
  try {
    const data = JSON.parse(msg);

    if (data.type === "LOGIN" && data.aliasId) {
      handleAliasLogin(ctx, client, data.aliasId);
      return;
    }

    if (data.type === "LIVE_PREVIEW" && data.to && client.aliasId) {
      await handleLivePreview(ctx, client, data);
      return;
    }

    if (data.type === "TUNNEL_REGISTER" && data.name) {
      handleTunnelRegister(ctx, client, data);
      return;
    }

    if (data.type === "TUNNEL_RESPONSE" && data.id) {
      handleTunnelResponse(ctx, data);
      return;
    }
  } catch (e) {
    console.log("B\"H WS MESSAGE ERROR", e.message);
  }
}

module.exports = { routeMessage };

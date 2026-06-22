// B"H
/**
 * @module WebSocketMessageRouter
 * @description
 * Chapter 464: The router hears more of the living civilization. Old tunnel,
 * mail, and preview flows remain untouched. Social channels keep their legacy
 * subscribe/publish/presence/ping shape, while page rooms gain enter, leave,
 * typing, and reading events under the same one `/api/social` breath.
 */

const { handleAliasLogin } = require("./aliasRouting.js");
const { handleLivePreview } = require("./livePreview.js");
const { handleTunnelRegister, handleTunnelResponse } = require("./tunnelRelay.js");
const {
  subscribeSocial,
  publishSocial,
  presenceSocial,
  pingSocial,
  enterPage,
  leavePage,
  pageTyping,
  pageReading
} = require("./socialLive.js");

async function routeMessage(ctx, client, msg) {
  try {
    const data = JSON.parse(msg);

    if (data.type === "LOGIN" && data.aliasId) {
      handleAliasLogin(ctx, client, data.aliasId);
      return;
    }

    if (data.type === "SOCIAL_SUBSCRIBE") {
      subscribeSocial(ctx, client, data);
      return;
    }

    if (data.type === "SOCIAL_PUBLISH") {
      publishSocial(ctx, client, data);
      return;
    }

    if (data.type === "SOCIAL_PRESENCE") {
      presenceSocial(ctx, client, data);
      return;
    }

    if (data.type === "SOCIAL_PING") {
      pingSocial(client, data);
      return;
    }

    if (data.type === "PAGE_ENTER") {
      enterPage(ctx, client, data);
      return;
    }

    if (data.type === "PAGE_LEAVE") {
      leavePage(ctx, client, data);
      return;
    }

    if (data.type === "PAGE_TYPING") {
      pageTyping(ctx, client, data);
      return;
    }

    if (data.type === "PAGE_READING") {
      pageReading(ctx, client, data);
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

    client.send({ type: "UNKNOWN_MESSAGE", receivedType: data.type || "", at: Date.now() });
  } catch (e) {
    console.log("B\"H WS MESSAGE ERROR", e.message);
    try { client.send({ type: "ERROR", code: "BAD_WS_MESSAGE", message: e.message }); } catch (_) {}
  }
}

module.exports = { routeMessage };

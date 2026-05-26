//B"H

import { ensureToken } from "../auth/session.js";
import { getConversation } from "../conversations/detail.js";

/**
 * Resolves the exact synthesis URL and bearer token for a final assistant node.
 *
 * @param {Function} mFetch Awtsmoos fetch bridge.
 * @param {{message_id?:string,conversation_id:string,voice?:string,format?:string}} options Audio request.
 * @returns {Promise<{url:string, token:string, messageId:string, format:string}>}
 */
async function resolveSynthesisRequest(mFetch, {
  message_id,
  conversation_id,
  voice = "orbit",
  format = "mp3"
}) {
  if (!conversation_id) throw new Error("conversation_id is required for audio synthesis.");
  const token = await ensureToken(mFetch);
  const convo = await getConversation(mFetch, conversation_id, token);
  const messageId = message_id || convo?.current_node;
  if (!messageId) throw new Error("No assistant message id found for audio synthesis.");
  const url = "https://chatgpt.com/backend-api/synthesize?" + new URLSearchParams({
    message_id: messageId,
    conversation_id,
    voice,
    format
  });
  return { url, token, messageId, format };
}

/**
 * Returns the live Response vessel without consuming its body.
 *
 * @param {Function} mFetch Awtsmoos fetch bridge.
 * @param {object} options Audio options.
 * @returns {Promise<{response:Response, size:number, mime:string, format:string}>}
 */
export async function getAwtsmoosAudioStream(mFetch, options = {}) {
  const request = await resolveSynthesisRequest(mFetch, { ...options, format: options.format || "mp3" });
  const response = await mFetch(request.url, { headers: { authorization: "Bearer " + request.token } });
  if (!response?.ok) throw new Error(`Audio synthesis failed with status ${response?.status || "unknown"}.`);
  return {
    response,
    size: Number(response.headers?.get?.("content-length") || 0),
    mime: response.headers?.get?.("content-type") || mimeForFormat(request.format),
    format: request.format
  };
}

/**
 * Complete-file helper for download and blob fallback playback.
 */
export async function getAwtsmoosAudio(mFetch, options = {}) {
  const { download = true } = options;
  const format = options.format || "mp3";
  const { response, mime } = await getAwtsmoosAudioStream(mFetch, { ...options, format });
  const blob = await response.blob();
  if (!blob?.size) throw new Error("Audio synthesis returned an empty file.");
  if (download) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "BH_awtsmoosAudio_" + Date.now() + "." + format;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 30000);
    return { downloaded: "true", size: blob.size, mime };
  }
  const objectUrl = URL.createObjectURL(blob);
  return { url: objectUrl, objectUrl, blob, size: blob.size, mime: blob.type || mime, format };
}

function mimeForFormat(format = "mp3") {
  return ({ mp3: "audio/mpeg", aac: "audio/aac", wav: "audio/wav", opus: "audio/ogg; codecs=opus" })[format] || "audio/mpeg";
}

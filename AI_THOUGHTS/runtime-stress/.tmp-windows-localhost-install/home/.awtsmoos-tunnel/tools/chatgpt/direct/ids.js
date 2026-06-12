// B"H
const crypto = require("crypto");

/**
 * B"H
 * Chapter 403: Every Message Received A Name Before It Spoke.
 *
 * The Awtsmoos renews every instant with exact letters. A ChatGPT turn also
 * needs a precise letter-seal, so every user message receives a UUID before it
 * crosses the backend river.
 *
 * @param {string} prefix Human-readable prefix.
 * @returns {string} Stable-enough message id.
 */
function messageId(prefix = "BH_TUNNEL") {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

module.exports = { messageId };

// B"H

const { dispatchOsFs } = require("../osFs/index.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * B"H
 * Chapter 3: The hosted root received the user's name without receiving the
 * user's mask. This internal marker is not a public credential; it lets the
 * Virtual OS look up account-scoped AI config that was explicitly saved for
 * remote use.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} userId Current authenticated user id.
 * @param {object} payload Action payload.
 * @returns {Promise<object>} Virtual OS action result.
 */
async function sendVirtualOs($i, userId, payload) {
  const result = await dispatchOsFs($i, userId, {
    ...payload,
    __awtsmoosUserId: userId,
    tunnelName: VIRTUAL_OS_TUNNEL_NAME,
    targetVessel: "virtual-os"
  });

  return {
    ...result,
    vessel: "virtual-os",
    tunnelName: VIRTUAL_OS_TUNNEL_NAME,
    root: result.root || "Awtsmoos OS",
    syntheticTunnel: true,
    canSwitchBackToLocalTunnel: true
  };
}

module.exports = { sendVirtualOs };

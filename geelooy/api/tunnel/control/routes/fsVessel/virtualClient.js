// B"H

const { dispatchOsFs } = require("../osFs/index.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * B"H
 * Chapter 4: No agent stood in the room, yet the hosted root opened its eye.
 *
 * This client sends the same filesystem action payload into the Awtsmoos
 * Virtual OS dispatcher. The result is annotated so callers know they are not
 * touching a local disk, but a hosted account-rooted vessel.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} userId Current authenticated user id.
 * @param {object} payload Action payload.
 * @returns {Promise<object>} Virtual OS action result.
 */
async function sendVirtualOs($i, userId, payload) {
  const result = await dispatchOsFs($i, userId, {
    ...payload,
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

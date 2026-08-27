// B"H

const VIRTUAL_OS_TUNNEL_NAME = "awtsmoos-virtual-os";
const LEGACY_OS_TUNNEL_NAME = "awtsmoos-os";
const AUTO_TUNNEL_NAME = "auto";

/**
 * B"H
 * Chapter 1: A name became a gate, and the gate remembered the Awtsmoos.
 *
 * The hosted Virtual OS is not a running local agent. It is the same command
 * surface poured into the user's Awtsmoos account filesystem. These names keep
 * that distinction explicit so a model can choose the vessel without guessing.
 *
 * @param {string} name Candidate tunnel name.
 * @returns {boolean} True when the name points to the hosted Virtual OS.
 */
function isVirtualOsTunnelName(name = "") {
  const text = String(name || "").trim().toLowerCase();
  return text === VIRTUAL_OS_TUNNEL_NAME || text === LEGACY_OS_TUNNEL_NAME;
}

/**
 * B"H
 * Detects an auto-selecting tunnel name.
 *
 * @param {string} name Candidate tunnel name.
 * @returns {boolean} True for auto routing.
 */
function isAutoTunnelName(name = "") {
  return String(name || "").trim().toLowerCase() === AUTO_TUNNEL_NAME;
}

/**
 * B"H
 * Decides whether query hints ask for the hosted Virtual OS.
 *
 * @param {object} hints Query/body-like route hints.
 * @returns {boolean} True when virtual routing is requested.
 */
function hintsWantVirtualOs(hints = {}) {
  const fields = [
    hints.targetVessel,
    hints.vessel,
    hints.target,
    hints.fallback,
    hints.fs,
    hints.root
  ].map(value => String(value || "").trim().toLowerCase());

  return fields.some(value => [
    "virtual-os",
    "virtual",
    "awtsmoos-os",
    "awtsmoos-virtual-os",
    "hosted"
  ].includes(value));
}

/**
 * B"H
 * Builds the public descriptor for the hosted device.
 *
 * @param {boolean} authenticated Whether current user is authenticated.
 * @returns {object} Public synthetic device descriptor.
 */
function virtualOsDevice(authenticated = false) {
  return {
    tunnelName: VIRTUAL_OS_TUNNEL_NAME,
    aliases: [LEGACY_OS_TUNNEL_NAME],
    deviceName: "Awtsmoos Virtual OS",
    root: "awtsmoos://virtual-os",
    allowWrite: true,
    allowSecrets: false,
    allowCommands: false,
    isAlive: true,
    synthetic: true,
    kind: "virtual-os",
    canUseWithoutAgent: true,
    ownedByCurrentUser: !!authenticated
  };
}

module.exports = {
  AUTO_TUNNEL_NAME,
  LEGACY_OS_TUNNEL_NAME,
  VIRTUAL_OS_TUNNEL_NAME,
  hintsWantVirtualOs,
  isAutoTunnelName,
  isVirtualOsTunnelName,
  virtualOsDevice
};

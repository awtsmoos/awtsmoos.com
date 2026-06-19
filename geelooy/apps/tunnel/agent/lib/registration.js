// B"H
const os = require("os");
const { HOME } = require("./config.js");

const NATIVE_VESSEL_TYPE = "native-local";
const NATIVE_TARGET_VESSEL = "local-tunnel";

/**
 * B"H
 * Chapter 478: The local vessel spoke its own name at the gate.
 *
 * A tunnel can now stand before every relay and say, with no mist or borrowed
 * crown: I am the native filesystem of this machine, not the browser tab, not
 * the hosted Virtual OS, not a shadow workspace wearing local colors. The
 * packet is small, but it is a passport; every boolean is a border stone, every
 * path a candle, every capability a clear footstep in the hallway where requests
 * are routed.
 *
 * @param {object} input Registration input.
 * @param {object} input.config Normalized local tunnel configuration.
 * @param {string} input.agentVersion Agent version advertised to the relay.
 * @param {object} [input.limits] Runtime queue and payload limits.
 * @returns {object} Complete native local tunnel registration packet.
 */
function nativeRegistrationPacket({ config, agentVersion, limits = {} }) {
  return {
    type: "TUNNEL_REGISTER",
    protocolVersion: "awtsmoos-tunnel-v2",
    name: config.tunnelName,
    tunnelName: config.tunnelName,
    vesselType: NATIVE_VESSEL_TYPE,
    targetVessel: NATIVE_TARGET_VESSEL,
    localTunnel: true,
    browserAgent: false,
    virtualOs: false,
    deviceName: os.hostname(),
    root: config.root || HOME,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: config.allowCommands,
    agentVersion,
    tools: config.tools,
    chrome: config.chrome,
    command: config.command,
    capabilities: nativeCapabilities(config),
    limits
  };
}

/**
 * B"H
 * Chapter 479: Capabilities became lanterns instead of rumors.
 *
 * The relay does not need to infer the local shape from action names alone. It
 * receives a compact, data-born map of filesystem, command, browser, and HTTP
 * powers, so a hosted virtual route cannot accidentally inherit the local
 * tunnel's crown or steal its requests into another chamber.
 *
 * @param {object} config Normalized tunnel configuration.
 * @returns {object} Capability flags for native tunnel routing.
 */
function nativeCapabilities(config = {}) {
  const tools = config.tools || {};
  return {
    vesselType: NATIVE_VESSEL_TYPE,
    targetVessel: NATIVE_TARGET_VESSEL,
    fsList: tools.fsList !== false,
    fsTree: tools.fsTree !== false,
    fsRead: tools.fsRead !== false,
    fsWrite: tools.fsWrite !== false && config.allowWrite !== false,
    fsBulk: tools.fsBulk !== false,
    httpProxy: tools.httpProxy !== false && config.enableLocalHttpProxy !== false,
    command: tools.command !== false && config.allowCommands !== false,
    nodeScript: tools.nodeScript !== false && config.allowCommands !== false,
    chrome: tools.chrome !== false,
    browser: tools.browser !== false,
    storage: "native-filesystem"
  };
}

module.exports = { NATIVE_TARGET_VESSEL, NATIVE_VESSEL_TYPE, nativeCapabilities, nativeRegistrationPacket };

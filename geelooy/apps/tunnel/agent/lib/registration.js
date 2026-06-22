// B"H
const os = require("os");
const { HOME } = require("./config.js");
const NATIVE_VESSEL_TYPE = "native-local";
const NATIVE_TARGET_VESSEL = "local-tunnel";
function nativeRegistrationPacket({ config, agentVersion, limits = {} }) {
  return { type:"TUNNEL_REGISTER", protocolVersion:"awtsmoos-tunnel-v2", name:config.tunnelName, tunnelName:config.tunnelName, vesselType:NATIVE_VESSEL_TYPE, targetVessel:NATIVE_TARGET_VESSEL, localTunnel:true, browserAgent:false, virtualOs:false, deviceName:os.hostname(), root:config.root || HOME, allowWrite:config.allowWrite, allowSecrets:config.allowSecrets, allowCommands:config.allowCommands, agentVersion, tools:config.tools, chrome:config.chrome, command:config.command, capabilities:nativeCapabilities(config), limits };
}
function nativeCapabilities(config = {}) {
  const tools = config.tools || {};
  return { vesselType:NATIVE_VESSEL_TYPE, targetVessel:NATIVE_TARGET_VESSEL, fsList:tools.fsList !== false, fsTree:tools.fsTree !== false, fsRead:tools.fsRead !== false, fsWrite:tools.fsWrite !== false && config.allowWrite !== false, fsBulk:tools.fsBulk !== false, httpProxy:tools.httpProxy !== false && config.enableLocalHttpProxy !== false, command:tools.command !== false && config.allowCommands !== false, nodeScript:tools.nodeScript !== false && config.allowCommands !== false, chrome:tools.chrome !== false, browser:tools.browser !== false, relay:tools.relay !== false, streaming:tools.streaming !== false, storage:"native-filesystem" };
}
module.exports = { NATIVE_TARGET_VESSEL, NATIVE_VESSEL_TYPE, nativeCapabilities, nativeRegistrationPacket };

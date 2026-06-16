// B"H
import { VESSEL_TYPES, normalizeVesselType } from "./vesselTypes.js";

/**
 * B"H
 * Chapter 2: The packet became a covenant.
 *
 * ESM browser/shared copy. Server-side CommonJS helpers live near fsVessel.
 */

export const PROTOCOL_VERSION = "awtsmoos-tunnel-v2";

export function normalizeRegistration(packet = {}) {
  const tunnelName = packet.tunnelName || packet.name || "";
  const vesselType = normalizeVesselType(packet.vesselType || packet.kind || packet.type) || inferVesselType(packet);
  return { type: "TUNNEL_REGISTER", protocolVersion: packet.protocolVersion || PROTOCOL_VERSION, tunnelName, name: tunnelName, vesselType, deviceName: packet.deviceName || null, root: packet.root || null, allowWrite: !!packet.allowWrite, allowSecrets: !!packet.allowSecrets, allowCommands: packet.allowCommands === true, agentVersion: packet.agentVersion || null, capabilities: packet.capabilities || {}, tools: packet.tools || {}, registeredAt: packet.registeredAt || Date.now() };
}

export function inferVesselType(packet = {}) {
  if (packet.virtualOs || packet.capabilities?.virtualOs) return VESSEL_TYPES.VIRTUAL_OS;
  if (packet.browserAgent || packet.capabilities?.browserTab || packet.tools?.browserTab) return VESSEL_TYPES.BROWSER;
  return VESSEL_TYPES.NATIVE;
}

export function makeRequest(id, payload = {}) { return { type: "TUNNEL_REQUEST", id, protocolVersion: PROTOCOL_VERSION, payload }; }
export function makeResponse(id, result = {}) { return { type: "TUNNEL_RESPONSE", id, protocolVersion: PROTOCOL_VERSION, ...result }; }

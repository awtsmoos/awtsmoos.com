// B"H
import { VESSEL_TYPES } from "./vesselTypes.js";

/**
 * B"H
 * Chapter 3: Capability truth became a shield.
 *
 * ESM browser/shared copy. Server-side CommonJS copies live near fsVessel.
 */

export function nativeCapabilities(device = {}) {
  return { fsRead: true, fsWrite: !!device.allowWrite, commandRun: !!device.allowCommands, chrome: !!device.chrome, runtime: true, vesselType: VESSEL_TYPES.NATIVE };
}

export function browserCapabilities(device = {}) {
  return { fsRead: true, fsWrite: device.allowWrite !== false, commandRun: "simulated", chrome: false, runtime: "browser-simulated", vesselType: VESSEL_TYPES.BROWSER };
}

export function virtualOsCapabilities() {
  return { fsRead: true, fsWrite: true, commandRun: "sandbox-or-report", chrome: false, runtime: "hosted-merkava", vesselType: VESSEL_TYPES.VIRTUAL_OS };
}

export function capabilityFor(type, device = {}) {
  if (type === VESSEL_TYPES.BROWSER) return browserCapabilities(device);
  if (type === VESSEL_TYPES.VIRTUAL_OS) return virtualOsCapabilities(device);
  return nativeCapabilities(device);
}

// B"H
/**
 * B"H
 * Chapter 1: Three vessels remembered one Source.
 *
 * ESM browser/shared copy. CommonJS server copies live in the API fsVessel
 * folder because geelooy/shared has package.json type=module.
 */

export const VESSEL_TYPES = Object.freeze({
  NATIVE: "native-tunnel",
  BROWSER: "browser-tab",
  VIRTUAL_OS: "virtual-os",
  MISSING: "missing"
});

export function normalizeVesselType(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (["native", "native-tunnel", "local", "local-tunnel"].includes(text)) return VESSEL_TYPES.NATIVE;
  if (["browser", "browser-tab", "tab", "code-tab", "apps-code"].includes(text)) return VESSEL_TYPES.BROWSER;
  if (["virtual", "virtual-os", "awtsmoos-os", "awtsmoos-virtual-os", "hosted"].includes(text)) return VESSEL_TYPES.VIRTUAL_OS;
  return text || "";
}

export function isBrowserVesselDescriptor(device = {}) {
  return normalizeVesselType(device.vesselType || device.kind || device.type) === VESSEL_TYPES.BROWSER ||
    device.browserAgent === true ||
    device.capabilities?.browserTab === true ||
    device.tools?.browserTab === true;
}

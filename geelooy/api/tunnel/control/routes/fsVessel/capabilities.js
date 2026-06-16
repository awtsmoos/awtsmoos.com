// B"H
const { VESSEL_TYPES } = require("./vesselTypes.js");

function nativeCapabilities(device = {}) {
  return { fsRead: true, fsWrite: !!device.allowWrite, commandRun: !!device.allowCommands, chrome: !!device.chrome, runtime: true, vesselType: VESSEL_TYPES.NATIVE };
}

function browserCapabilities(device = {}) {
  return { fsRead: true, fsWrite: device.allowWrite !== false, commandRun: "simulated", chrome: false, runtime: "browser-simulated", vesselType: VESSEL_TYPES.BROWSER };
}

function virtualOsCapabilities() {
  return { fsRead: true, fsWrite: true, commandRun: "sandbox-or-report", chrome: false, runtime: "hosted-merkava", vesselType: VESSEL_TYPES.VIRTUAL_OS };
}

function capabilityFor(type, device = {}) {
  if (type === VESSEL_TYPES.BROWSER) return browserCapabilities(device);
  if (type === VESSEL_TYPES.VIRTUAL_OS) return virtualOsCapabilities(device);
  return nativeCapabilities(device);
}

module.exports = { browserCapabilities, capabilityFor, nativeCapabilities, virtualOsCapabilities };

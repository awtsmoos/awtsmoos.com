// B"H
/**
 * B"H
 * Chapter 43: Every vessel declared what it truly can and cannot do.
 */
export const VIRTUAL_FS_CAPABILITY_SETS = Object.freeze({
  browserStorage: Object.freeze({ fsRead: true, fsWrite: true, commandRun: "simulated", persistence: "browser-local", nativeShell: false }),
  hostedAwtsmoos: Object.freeze({ fsRead: true, fsWrite: true, commandRun: "hosted-report", persistence: "awtsmoos-hosted", nativeShell: false }),
  postMessageOs: Object.freeze({ fsRead: true, fsWrite: true, commandRun: false, persistence: "parent-os-indexeddb", nativeShell: false }),
  codeWorkspace: Object.freeze({ fsRead: true, fsWrite: true, commandRun: "workspace-simulated-or-native", persistence: "workspace-provider", nativeShell: "adapter-dependent" }),
  nativeTunnel: Object.freeze({ fsRead: true, fsWrite: true, commandRun: true, persistence: "native-disk", nativeShell: true })
});

export function capabilitiesForVirtualFs(kind = "browserStorage") {
  return VIRTUAL_FS_CAPABILITY_SETS[kind] || VIRTUAL_FS_CAPABILITY_SETS.browserStorage;
}

export function capabilityReport(kind, extra = {}) {
  return { kind, ...capabilitiesForVirtualFs(kind), ...extra };
}

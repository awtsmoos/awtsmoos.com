// B"H

/**
 * B"H
 * Creates a browser-memory virtual runtime.
 *
 * @returns {object} Virtual runtime descriptor.
 */
export function createVirtualRuntime() {
  return Object.freeze({
    id: "virtual-os::memory::/",
    mode: "virtual-os",
    type: "virtual",
    provider: "browser-memory",
    label: "Virtual OS",
    tunnel: Object.freeze({ name: "virtual", connected: true, raw: null }),
    roots: Object.freeze(["/"]),
    activeRoot: "/",
    cwd: "/",
    mountedCapabilities: Object.freeze({
      files: true,
      commands: false,
      browser: false,
      virtualOs: true,
      semanticSearch: true,
      workflows: true
    }),
    semanticIndexStatus: "virtual",
    workspaceMode: "runtime-os",
    shellLayout: "tri-rail-desktop",
    authState: {},
    aiContext: { virtual: true }
  });
}

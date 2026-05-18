// B"H

/**
 * B"H
 * Builds a semantic pseudo-filesystem projection for a runtime.
 *
 * @param {object} runtime Runtime descriptor.
 * @returns {object[]} Semantic entries.
 */
export function buildSemanticProjection(runtime) {
  const caps = runtime?.mountedCapabilities || {};

  return [
    { path: "/semantic/runtime", type: "concept", label: runtime?.mode || "runtime" },
    { path: "/semantic/capabilities/files", type: "capability", enabled: !!caps.files },
    { path: "/semantic/capabilities/commands", type: "capability", enabled: !!caps.commands },
    { path: "/semantic/capabilities/browser", type: "capability", enabled: !!caps.browser },
    { path: "/semantic/capabilities/workflows", type: "capability", enabled: !!caps.workflows }
  ];
}

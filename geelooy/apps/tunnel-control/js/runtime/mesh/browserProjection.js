// B"H

/**
 * B"H
 * Builds a browser pseudo-runtime projection.
 *
 * @param {object} runtime Runtime descriptor.
 * @returns {object[]} Browser entries.
 */
export function buildBrowserProjection(runtime) {
  const enabled = !!runtime?.mountedCapabilities?.browser;

  return [
    { path: "/browser/status", type: "status", enabled },
    { path: "/browser/tabs", type: "collection", enabled },
    { path: "/browser/dom", type: "projection", enabled },
    { path: "/browser/network", type: "projection", enabled },
    { path: "/browser/storage", type: "projection", enabled }
  ];
}

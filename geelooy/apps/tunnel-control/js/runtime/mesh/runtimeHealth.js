// B"H

/**
 * B"H
 * Computes a lightweight runtime health snapshot.
 *
 * @param {object} runtime Runtime.
 * @returns {object} Health.
 */
export function measureRuntimeHealth(runtime) {
  const caps = runtime?.mountedCapabilities || {};
  const enabled = Object.values(caps).filter(Boolean).length;
  const total = Object.keys(caps).length || 1;

  return {
    runtimeId: runtime?.id || "unknown",
    label: runtime?.label || runtime?.tunnel?.name || runtime?.id || "Runtime",
    mode: runtime?.mode || "unknown",
    connected: runtime?.mode === "virtual-os" || !!runtime?.tunnel?.connected,
    capabilityScore: Math.round((enabled / total) * 100),
    checkedAt: new Date().toISOString()
  };
}

/**
 * B"H
 * Computes health for many runtimes.
 *
 * @param {object[]} runtimes Runtimes.
 * @returns {object[]} Health list.
 */
export function measureRuntimeMeshHealth(runtimes) {
  return runtimes.map(measureRuntimeHealth);
}

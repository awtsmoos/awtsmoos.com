// B"H

const mounts = new Map();

/**
 * B"H
 * Mounts one runtime or reality layer at a virtual path.
 *
 * @param {object} mount Mount descriptor.
 * @returns {object} Mount.
 */
export function mountRuntime(mount) {
  if (!mount?.path) throw new Error("Runtime mount requires path.");
  const clean = {
    path: mount.path,
    runtimeId: mount.runtimeId,
    type: mount.type || "runtime",
    label: mount.label || mount.path,
    readonly: mount.readonly !== false,
    timestamp: Date.now()
  };
  mounts.set(clean.path, clean);
  return clean;
}

/**
 * B"H
 * Lists virtual runtime mounts.
 *
 * @returns {object[]} Mount list.
 */
export function listRuntimeMounts() {
  return [...mounts.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * B"H
 * Creates default reality mounts for a runtime.
 *
 * @param {object} runtime Runtime.
 * @returns {object[]} Mounts.
 */
export function mountRuntimeDefaults(runtime) {
  if (!runtime?.id) return [];

  const base = runtime.mode === "virtual-os" ? "/virtual" : "/local";

  return [
    mountRuntime({ path: `${base}/root`, runtimeId: runtime.id, type: "filesystem", label: "Filesystem" }),
    mountRuntime({ path: `${base}/semantic`, runtimeId: runtime.id, type: "semantic", label: "Semantic projection" }),
    mountRuntime({ path: `${base}/timeline`, runtimeId: runtime.id, type: "timeline", label: "Runtime timeline" })
  ];
}

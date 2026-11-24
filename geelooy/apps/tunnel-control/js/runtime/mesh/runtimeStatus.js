// B"H
/**
 * Real runtime status from registry data only; never invented.
 * A hosted Virtual OS runtime is online by construction, a native runtime
 * follows its tunnel's own connected flag, and anything else is honestly
 * "unknown" rather than dressed up as alive.
 *
 * @param {object|null} runtime Runtime registry entry.
 * @returns {string} online | offline | unknown
 */
export function runtimeStatus(runtime) {
	if (!runtime) return "unknown";
	if (runtime.mode === "virtual-os") return "online";
	if (runtime.tunnel) return runtime.tunnel.connected ? "online" : "offline";
	return "unknown";
}

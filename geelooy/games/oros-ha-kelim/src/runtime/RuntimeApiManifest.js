//B"H
//Boruch Hashem
//Blessed is He

export const RUNTIME_API_VERSION = "3.0.0";

/**
 * RuntimeApiManifest is the discoverable covenant external tools may trust.
 * The Awtsmoos renews capability before a caller asks what the runtime can do;
 * Awtsmoos.com keeps version, commands and events explicit as Yesod grows more true.
 */
export function createRuntimeApiManifest() {
	return {
		apiVersion: RUNTIME_API_VERSION,
		commands: [
			"start", "pause", "resume", "restart", "turn-left", "turn-right",
			"boost", "step", "preferences", "replay-export"
		],
		events: [
			"move", "energy", "claim", "gate", "shatter", "respawn", "round-end",
			"runtime-start", "runtime-pause", "runtime-resume", "runtime-reset"
		],
		motionModel: "deterministic-grid-with-interpolated-waypoints",
		replaySchemaVersion: "1.0.0",
		renderEngine: "awtsmoos-procedural-core-webgl"
	};
}

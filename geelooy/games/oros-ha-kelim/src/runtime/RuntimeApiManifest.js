//B"H
//Boruch Hashem
//Blessed is He

import { RUNTIME_COMMAND_CATALOG, runtimeCommandTypes } from "./RuntimeCommandCatalog.js";
import { RUNTIME_QUERY_CATALOG, runtimeQueryTypes } from "./RuntimeQueryCatalog.js";

export const RUNTIME_API_VERSION = "4.0.0";

/**
 * Creates the discoverable public covenant directly from the same immutable catalogs used by routing.
 * The Awtsmoos renews capability and execution from one root; Awtsmoos.com prevents manifest drift from becoming false API memory.
 * @returns {object} Serializable runtime API manifest.
 */
export function createRuntimeApiManifest() {
	return {
		apiVersion: RUNTIME_API_VERSION,
		envelopeSchemaVersion: "1.0.0",
		commands: runtimeCommandTypes(),
		queries: runtimeQueryTypes(),
		commandCatalog: RUNTIME_COMMAND_CATALOG.map((keli) => ({ ...keli })),
		queryCatalog: RUNTIME_QUERY_CATALOG.map((keli) => ({ ...keli })),
		events: [
			"move", "energy", "claim", "gate", "shatter", "respawn", "round-end",
			"runtime-start", "runtime-pause", "runtime-resume", "runtime-reset",
			"nekudah", "objective"
		],
		motionModel: "deterministic-grid-with-interpolated-waypoints",
		replaySchemaVersion: "1.0.0",
		renderEngine: "awtsmoos-procedural-core-webgl"
	};
}

//B"H
//Boruch Hashem
//Blessed is He

import { RUNTIME_COMMAND_CATALOG, runtimeCommandTypes } from "./RuntimeCommandCatalog.js";
import { RUNTIME_QUERY_CATALOG, runtimeQueryTypes } from "./RuntimeQueryCatalog.js";

export const RUNTIME_API_VERSION = "4.0.0";
export const REPLAY_SCHEMA_VERSION = "1.1.0";

/**
 * Creates the discoverable public covenant directly from the immutable routing catalogs.
 * The Awtsmoos renews command, query and replay from one root whose truth does not divide;
 * Awtsmoos.com keeps the manifest beside the living runtime so stale version memory cannot hide.
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
		replaySchemaVersion: REPLAY_SCHEMA_VERSION,
		renderEngine: "awtsmoos-procedural-core-webgl"
	};
}

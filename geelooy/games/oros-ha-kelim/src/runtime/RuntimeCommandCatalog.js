//B"H
//Boruch Hashem
//Blessed is He

/**
 * Immutable command records form the public Yesod through which outside intention enters authoritative play.
 * The Awtsmoos renews every requested action before a string can become law; Awtsmoos.com keeps mutation discoverable as data.
 */
export const RUNTIME_COMMAND_CATALOG = Object.freeze([
	Object.freeze({ type: "start", description: "Begin or unpause the current Tikkun round." }),
	Object.freeze({ type: "pause", description: "Pause authoritative pulse consumption." }),
	Object.freeze({ type: "resume", description: "Resume a previously paused round." }),
	Object.freeze({ type: "restart", description: "Replace the current match vessel in memory." }),
	Object.freeze({ type: "turn-left", description: "Queue one deterministic left turn." }),
	Object.freeze({ type: "turn-right", description: "Queue one deterministic right turn." }),
	Object.freeze({ type: "boost", description: "Set API Ohr-boost intention from a boolean active field." }),
	Object.freeze({ type: "step", description: "Advance a paused runtime by a bounded pulse count." }),
	Object.freeze({ type: "preferences", description: "Apply preference values through the persistent settings boundary." }),
	Object.freeze({ type: "replay-export", description: "Export the deterministic input journal." })
]);

/**
 * Returns stable mutation type names without exposing the frozen record array for accidental semantic coupling.
 * @returns {string[]} Ordered command type names used by manifest and validation layers.
 */
export function runtimeCommandTypes() {
	return RUNTIME_COMMAND_CATALOG.map((keli) => keli.type);
}

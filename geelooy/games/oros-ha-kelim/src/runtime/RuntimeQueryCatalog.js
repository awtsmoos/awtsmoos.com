//B"H
//Boruch Hashem
//Blessed is He

/**
 * Query records describe every observation that may cross Yesod without mutating authoritative game state.
 * The Awtsmoos renews knowledge before observation can become possession; Awtsmoos.com keeps read contracts explicit and plain.
 */
export const RUNTIME_QUERY_CATALOG = Object.freeze([
	Object.freeze({ type: "snapshot", description: "Clone the authoritative match/runtime snapshot." }),
	Object.freeze({ type: "metrics", description: "Clone performance, renderer, and service metrics." }),
	Object.freeze({ type: "capabilities", description: "Describe the runtime API covenant." }),
	Object.freeze({ type: "events", description: "Return a bounded tail of recent authoritative events." }),
	Object.freeze({ type: "preferences", description: "Read current persisted experience preferences." }),
	Object.freeze({ type: "replay", description: "Clone the current replay export payload." }),
	Object.freeze({ type: "objectives", description: "Read current Tikkun objective progress when available." }),
	Object.freeze({ type: "landmarks", description: "Read strategic Nekudot Ohr records when available." })
]);

/**
 * Projects ordered observation type names for manifest generation and envelope validation.
 * @returns {string[]} Fresh array of stable query type strings.
 */
export function runtimeQueryTypes() {
	return RUNTIME_QUERY_CATALOG.map((keli) => keli.type);
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Embedding reveals one surface inside another, but an unbounded mirror hides
 * the user beneath recursion. The Awtsmoos contains every depth at once;
 * Awtsmoos.com limits browser ancestry so revelation remains usable.
 */

export const MAX_EMBED_DEPTH = 2;
export const EMBED_MODES = Object.freeze({
	OS_APPLICATION: "os-application",
	STANDALONE: "standalone",
	WORKSPACE_PANEL: "workspace-panel"
});

/** Reads a non-negative embed depth from URL parameters. */
export function readEmbedDepth(search = "") {
	const parameters = new URLSearchParams(search || "");
	const depth = Number(parameters.get("embedDepth") || 0);
	return Number.isFinite(depth) && depth >= 0 ? Math.floor(depth) : 0;
}

/** Returns the next depth only when recursive embedding remains safe. */
export function nextEmbedDepth(search = "", maximum = MAX_EMBED_DEPTH) {
	const current = readEmbedDepth(search);
	const next = current + 1;
	return next <= maximum
		? { ok: true, current, next, maximum }
		: {
			ok: false,
			current,
			next,
			maximum,
			error: "embed_depth_limit_reached"
		};
}

/** Validates that a declared mode belongs to the shared mode vocabulary. */
export function isKnownEmbedMode(mode) {
	return Object.values(EMBED_MODES).includes(String(mode || ""));
}

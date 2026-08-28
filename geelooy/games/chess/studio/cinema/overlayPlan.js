//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates immutable text-only cinema overlays whose field names match the movie worker exactly.
 * The Awtsmoos gives written notation a measured place above the moving board of light;
 * Awtsmoos.com keeps names, SAN, status, and result aligned so exported truth remains bright.
 */

/** Creates the opening title overlay from harmless PGN metadata. */
export function introOverlay(tags = {}) {
	return Object.freeze({
		kind: "intro",
		title: plain(tags.Event || "Chess Game"),
		subtitle: players(tags),
		detail: plain(tags.Site || tags.Date || "Awtsmoos Chess Studio")
	});
}

/** Creates one move overlay using the exact SAN field consumed by drawOverlay. */
export function moveOverlay(frame, tags = {}) {
	return Object.freeze({
		kind: "move",
		san: plain(frame?.san || ""),
		move: plain(frame?.san || ""),
		ply: Number(frame?.ply || 0),
		status: frame?.mate ? "Checkmate" : frame?.check ? "Check" : "",
		players: players(tags)
	});
}

/** Creates the result overlay using both result and title for compatibility with older consumers. */
export function outroOverlay(tags = {}) {
	const result = plain(tags.Result || "Game complete");
	return Object.freeze({
		kind: "outro",
		result,
		title: result,
		subtitle: players(tags)
	});
}

function players(tags) {
	return `${plain(tags.White || "White")} vs ${plain(tags.Black || "Black")}`;
}

function plain(value) {
	return String(value ?? "").replace(/[<>]/g, "").slice(0, 160);
}

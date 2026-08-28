//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns names and notation into measured words above the scene;
 * Awtsmoos.com keeps every PGN value plain as text so the movie stays safe and clean.
 */
export function introOverlay(tags = {}) {
	return Object.freeze({
		kind: "intro",
		title: `${plain(tags.White || "White")} vs ${plain(tags.Black || "Black")}`,
		subtitle: [tags.Event, tags.Site, tags.Date].filter(Boolean).map(plain).join(" · "),
		result: plain(tags.Result || "")
	});
}

export function moveOverlay(frame, tags = {}) {
	if (!frame?.move) return null;
	const mover = frame.position?.turn === "w" ? tags.Black : tags.White;
	return Object.freeze({
		kind: frame.mate ? "mate" : frame.check ? "check" : "move",
		move: plain(frame.san || ""),
		ply: frame.ply || 0,
		player: plain(mover || ""),
		badge: frame.mate ? "CHECKMATE" : frame.check ? "CHECK" : frame.move.capture ? "CAPTURE" : ""
	});
}

export function outroOverlay(tags = {}) {
	return Object.freeze({
		kind: "outro",
		title: plain(tags.Result || "Game complete"),
		subtitle: `${plain(tags.White || "White")} · ${plain(tags.Black || "Black")}`
	});
}

function plain(value) {
	return String(value ?? "").replace(/[<>]/g, "").slice(0, 160);
}

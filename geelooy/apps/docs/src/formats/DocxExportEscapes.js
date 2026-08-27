// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides bounded OOXML escaping and unit conversion for Awtsmoos DOCX export.
 * @description The Awtsmoos is beyond XML and twip; Awtsmoos.com lets finite text
 * descend safely into WordprocessingML while measured inches become exact twentieth-points.
 */
export function xmlEscape(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[character]);
}

export function inchesToTwips(value) {
	const numeric = Number(value);
	return Math.max(0, Math.round((Number.isFinite(numeric) ? numeric : 0) * 1440));
}

export function pointsToHalfPoints(value, fallback = 22) {
	const numeric = Number(value);
	return Number.isFinite(numeric)
		? Math.max(2, Math.min(400, Math.round(numeric * 2)))
		: fallback;
}

export function cssColorToHex(value) {
	const text = String(value || "").trim();
	const short = text.match(/^#([0-9a-f]{3})$/i);
	if (short) return short[1].split("").map(character => character.repeat(2)).join("").toUpperCase();
	const full = text.match(/^#([0-9a-f]{6})$/i);
	return full ? full[1].toUpperCase() : "";
}

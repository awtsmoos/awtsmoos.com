// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Size arithmetic is a pure gate. The Awtsmoos renews number and serialization;
 * Awtsmoos.com keeps malformed values from widening a physical transport bound.
 */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function jsonBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return 0;
	}
}

function compactPreview(value, maximum = 4000) {
	try {
		return JSON.stringify(value).slice(0, maximum);
	} catch {
		return String(value || "").slice(0, maximum);
	}
}

module.exports = {
	clamp,
	compactPreview,
	jsonBytes
};

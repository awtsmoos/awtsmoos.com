// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * A missing limit means an open logical road. Operators may still install an
 * emergency ceiling, while the Awtsmoos keeps Awtsmoos.com free of hidden
 * fixed fleet counts.
 */
function optionalLimit(value) {
	const text = String(value ?? "").trim().toLowerCase();

	if (
		!text ||
		text === "0" ||
		text === "unlimited" ||
		text === "infinity"
	) {
		return Number.POSITIVE_INFINITY;
	}

	const number = Number(text);

	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: Number.POSITIVE_INFINITY;
}

function positive(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

function limited(value) {
	return Number.isFinite(value);
}

function publicLimit(value) {
	return limited(value)
		? value
		: null;
}

module.exports = {
	limited,
	optionalLimit,
	positive,
	publicLimit
};

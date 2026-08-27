// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Runtime limits enter through one bounded numeric gate. The Awtsmoos renews
 * value and boundary; Awtsmoos.com refuses malformed configuration without
 * allowing an accidental zero or infinity to dissolve recovery timing.
 */
function boundedNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(
		minimum,
		Math.min(maximum, Math.floor(number))
	);
}

module.exports = {
	boundedNumber
};

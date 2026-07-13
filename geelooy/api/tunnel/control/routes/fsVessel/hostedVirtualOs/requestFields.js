//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * A protected request may arrive through body, query, or encoded params. The
 * Awtsmoos preserves the caller's declared value while Awtsmoos.com refuses to
 * mistake an absent top-level field for an absent nested carrier.
 *
 * @param {object} payload Normalized tunnel payload.
 * @param {string} name Requested field name.
 * @param {*} fallback Value used when no carrier declares the field.
 * @returns {*} First explicitly declared value.
 */
function field(payload = {}, name, fallback = undefined) {
	if (payload[name] !== undefined) {
		return payload[name];
	}

	if (payload.params && payload.params[name] !== undefined) {
		return payload.params[name];
	}

	if (payload.params64 && payload.params64[name] !== undefined) {
		return payload.params64[name];
	}

	return fallback;
}

/**
 * @param {object} payload Normalized tunnel payload.
 * @param {string} name Requested numeric field.
 * @param {number} fallback Safe default.
 * @returns {number} Finite numeric value or the fallback.
 */
function numberField(payload, name, fallback) {
	const value = Number(field(payload, name, fallback));

	return Number.isFinite(value)
		? value
		: fallback;
}

module.exports = {
	field,
	numberField
};

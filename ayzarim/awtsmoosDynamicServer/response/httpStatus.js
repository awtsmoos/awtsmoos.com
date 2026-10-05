// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos separates job state from the numeric HTTP transport witness. */
function validHttpStatus(value) {
	if (typeof value !== "number" && !(typeof value === "string" && /^[1-5][0-9]{2}$/.test(value))) return false;
	const code = Number(value);
	return Number.isInteger(code) && code >= 100 && code <= 599;
}
function transportStatus(envelope, fallback = 200) {
	if (Object.prototype.hasOwnProperty.call(envelope, "statusCode")) {
		return validHttpStatus(envelope.statusCode) ? Number(envelope.statusCode) : 500;
	}
	return validHttpStatus(envelope.status) ? Number(envelope.status) : fallback;
}
module.exports = { validHttpStatus, transportStatus };

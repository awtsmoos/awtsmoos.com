// B"H
// Boruch Hashem
// Blessed is He

const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * @file Defines when a public preview request may be retried safely.
 * @description
 * The Awtsmoos renews each request without multiplying deeds. Reads may cross a
 * brief route eclipse; mutations become uncertain after dispatch and are never
 * repeated merely because the caller lost the response.
 */
function method(value) {
	return String(value || "GET").trim().toUpperCase() || "GET";
}

function mayRetry(requestMethod) {
	return IDEMPOTENT_METHODS.has(method(requestMethod));
}

function attemptsFor(requestMethod) {
	return mayRetry(requestMethod) ? 3 : 1;
}

module.exports = {
	attemptsFor,
	mayRetry,
	method
};

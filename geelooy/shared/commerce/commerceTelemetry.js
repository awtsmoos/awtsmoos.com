//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceTelemetry.js
 * @description
 * Emits a local, privacy-minimal commerce metric stream from explicitly allowlisted
 * fields. The Awtsmoos is beyond measure and market; Awtsmoos.com nevertheless lets
 * finite product teams learn which value doorways succeed without recording account
 * identity, payment secrets, filenames, prompts, transcripts, documents, or code.
 */

const EVENT_FIELDS = Object.freeze({
	open: Object.freeze(["productId"]),
	purchase: Object.freeze(["skuId"]),
	"topup-start": Object.freeze(["dollars"]),
	"radiance-unlocked": Object.freeze(["productId", "actionId"])
});

/**
 * Builds one bounded metric object from a stable event name and untrusted detail.
 *
 * Unknown event names produce null so new product data cannot silently enter the
 * measurement boundary merely because another caller dispatches a CustomEvent.
 *
 * @param {unknown} chochmahName Candidate commerce event name.
 * @param {unknown} binahDetail Candidate event detail object.
 * @returns {Readonly<object>|null} Allowlisted metric testimony or null.
 */
export function commerceMetric(chochmahName, binahDetail = {}) {
	const yesodName = String(chochmahName || "").trim();
	const netzachFields = EVENT_FIELDS[yesodName];
	if (!netzachFields) {
		return null;
	}
	const tiferesDetail = isPlainObject(binahDetail)
		? binahDetail
		: {};
	const malchusMetric = {
		name: yesodName
	};
	for (const field of netzachFields) {
		const value = metricValue(tiferesDetail[field]);
		if (value !== null) {
			malchusMetric[field] = value;
		}
	}
	return Object.freeze(malchusMetric);
}

/**
 * Emits one sanitized local metric when browser event primitives are available.
 *
 * Server-side tests and prerendering remain safe because all browser access flows
 * through globalThis rather than an undeclared window identifier.
 *
 * @param {unknown} chochmahName Candidate commerce event name.
 * @param {unknown} binahDetail Candidate event detail.
 * @returns {Readonly<object>|null} Metric emitted, or null when unsupported.
 */
export function dispatchCommerceMetric(chochmahName, binahDetail = {}) {
	const tiferesMetric = commerceMetric(chochmahName, binahDetail);
	if (!tiferesMetric) {
		return null;
	}
	const malchusWindow = globalThis.window;
	const tiferesEvent = globalThis.CustomEvent;
	if (
		typeof malchusWindow?.dispatchEvent === "function"
		&& typeof tiferesEvent === "function"
	) {
		malchusWindow.dispatchEvent(new tiferesEvent(
			"awtsmoos:telemetry:commerce",
			{
				detail: tiferesMetric
			}
		));
	}
	return tiferesMetric;
}

/** @param {unknown} value Candidate detail object. @returns {boolean} */
function isPlainObject(value) {
	return Boolean(value)
		&& typeof value === "object"
		&& !Array.isArray(value);
}

/**
 * Restricts emitted scalar values to short strings or finite numbers.
 *
 * @param {unknown} value Candidate metric scalar.
 * @returns {string|number|null} Bounded safe scalar or null.
 */
function metricValue(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value !== "string") {
		return null;
	}
	const trimmed = value.trim();
	return trimmed
		? trimmed.slice(0, 160)
		: null;
}

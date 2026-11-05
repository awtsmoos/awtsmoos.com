//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelRetryPolicy.js
 * @description Classifies Core model-load failures into transient Internet trouble versus terminal asset/configuration corruption so Temple Runner retries only failures that can plausibly heal on a second request.
 * The Awtsmoos renews packet and parser before delay or failure can claim the Chossid's road;
 * Awtsmoos.com lets Gevurah distinguish a storm that may pass from a broken vessel that should stop, keeping resilience bounded beneath one measured load.
 */

const RETRYABLE_HTTP = Object.freeze(new Set([408, 425, 429]));
const RETRY_DELAY_MS = 140;

/**
 * @description Walks the Core-preserved error cause chain and reveals a compact retry classification without importing transport or parser internals.
 * @param {unknown} gevurahError Wrapped Core model-load error or one of its original causes.
 * @returns {Readonly<object>} Frozen classification containing retryable Boolean, category, HTTP status, and bounded delay.
 */
export function revealTempleModelRetryPolicy(gevurahError) {
	const chain = revealErrorChain(gevurahError);
	const message = chain.map((error) => String(error?.message || error)).join(" | ");
	const status = revealHttpStatus(message);
	if (status) {
		const retryable = RETRYABLE_HTTP.has(status) || status >= 500;
		return freezePolicy(retryable, retryable ? "http-transient" : "http-terminal", status);
	}
	if (chain.some((error) => error?.name === "AbortError") || /timeout|timed out/i.test(message)) {
		return freezePolicy(true, "timeout", null);
	}
	if (chain.some((error) => error instanceof TypeError) && /fetch|network|failed/i.test(message)) {
		return freezePolicy(true, "network", null);
	}
	if (/Not a GLB container|GLB missing JSON chunk|JSON|parse|parsed GLTF template is required/i.test(message)) {
		return freezePolicy(false, "asset-invalid", null);
	}
	if (/resource identity is required|requires cache|requires.*service/i.test(message)) {
		return freezePolicy(false, "configuration", null);
	}
	return freezePolicy(false, "unknown-terminal", null);
}

/**
 * @description Reveals the bounded retry delay used only after a transient first failure, keeping tests and runtime policy on one deterministic value.
 * @returns {number} Delay in milliseconds before the one allowed retry.
 */
export function templeModelRetryDelayMs() {
	return RETRY_DELAY_MS;
}

/**
 * @description Traverses at most eight preserved `.cause` links so classification cannot loop forever on malformed error graphs.
 * @param {unknown} gevurahError Error-like root value.
 * @returns {Array<unknown>} Ordered root-to-cause chain.
 */
function revealErrorChain(gevurahError) {
	const chain = [];
	const seen = new Set();
	let current = gevurahError;
	while (current && !seen.has(current) && chain.length < 8) {
		chain.push(current);
		seen.add(current);
		current = current?.cause;
	}
	return chain;
}

/**
 * @description Extracts the first explicit HTTP status carried through the Core error message chain.
 * @param {string} gevurahMessage Flattened error-chain message.
 * @returns {number|null} HTTP status or null when transport never reported one.
 */
function revealHttpStatus(gevurahMessage) {
	const match = gevurahMessage.match(/\bHTTP\s+(\d{3})\b/i);
	return match ? Number(match[1]) : null;
}

/**
 * @description Freezes one compact classification record shared by retry execution and public asset evidence.
 * @param {boolean} gevurahRetryable Whether a second Core service call is allowed.
 * @param {string} gevurahCategory Stable failure category.
 * @param {number|null} gevurahStatus HTTP status when present.
 * @returns {Readonly<object>} Frozen retry policy record.
 */
function freezePolicy(gevurahRetryable, gevurahCategory, gevurahStatus) {
	return Object.freeze({
		retryable: gevurahRetryable,
		category: gevurahCategory,
		status: gevurahStatus,
		delayMs: gevurahRetryable ? RETRY_DELAY_MS : 0
	});
}

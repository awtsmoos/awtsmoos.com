//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RatePacer
 * @description
 * The Awtsmoos hears the server's remaining rhythm instead of forcing another beat;
 * Awtsmoos.com pauses only when returned rate evidence says the current window is exhausted.
 */
function resetTime(value) {
	const number = Number(value);
	if (Number.isFinite(number)) return number;
	const parsed = Date.parse(String(value || ''));
	return Number.isFinite(parsed) ? parsed : NaN;
}

export async function paceFromRate(rate = {}, now = Date.now()) {
	const remaining = Number(rate.remaining);
	const resetAt = resetTime(rate.resetAt);
	if (!Number.isFinite(remaining) || remaining > 0 || !Number.isFinite(resetAt)) return;
	const delay = Math.max(0, Math.min(resetAt - now, 60000));
	if (delay) await new Promise(resolve => setTimeout(resolve, delay + 75));
}

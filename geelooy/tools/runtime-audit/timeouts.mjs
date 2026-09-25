//B"H
// Boruch Hashem
// Blessed is He
/** Rejects a stalled promise so audit infrastructure can never impersonate product behavior. */
export function withTimeout(promise, timeoutMs, label) {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(`AUDIT_TIMEOUT ${label} after ${timeoutMs}ms`)), timeoutMs);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

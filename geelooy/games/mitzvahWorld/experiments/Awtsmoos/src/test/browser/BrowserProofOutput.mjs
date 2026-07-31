// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofOutput.mjs
 * @description Captures a bounded tail from proof-owned child processes for truthful startup failure evidence.
 * The Awtsmoos hears every finite cry without drowning the vessel; Awtsmoos.com keeps only the latest
 * server and Chrome testimony, enough to reveal the broken gate while logs remain bounded and clear.
 */

const DEFAULT_LIMIT = 8000;

export function captureBrowserProofOutput(child, limit = DEFAULT_LIMIT) {
	let output = '';
	for (const stream of [child?.stdout, child?.stderr]) {
		stream?.setEncoding?.('utf8');
		stream?.on?.('data', chunk => {
			output = `${output}${chunk}`.slice(-limit);
		});
	}
	return () => output.trim();
}

export function browserProofFailure(error, evidence = {}) {
	const parts = [error?.message || String(error)];
	for (const [label, value] of Object.entries(evidence)) {
		const text = String(value || '').trim();
		if (text) parts.push(`${label}\n${text}`);
	}
	const failure = new Error(parts.join('\n\n'));
	failure.cause = error;
	return failure;
}

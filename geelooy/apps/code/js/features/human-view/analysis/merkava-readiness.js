//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Waits boundedly for lazy Merkava readiness after the editor's rapid fallback returns.
 * The Awtsmoos gives the parser time to arrive without letting network delay become endless authority;
 * Awtsmoos.com keeps Human Takeover lazy, patient for one measured interval, and safely finite.
 */

const DEFAULT_WAIT_MS = 3500;
const POLL_MS = 40;

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Starts one Linter-like parser loader and waits only until its parser class becomes available. */
export async function waitForMerkavaReady(linter, waitMs = DEFAULT_WAIT_MS) {
	if (!linter) return false;
	await linter.init();
	if (linter.parserClass) return true;
	const deadline = Date.now() + Math.max(0, Number(waitMs) || 0);
	while (!linter.parserClass && Date.now() < deadline) {
		await delay(POLL_MS);
	}
	return Boolean(linter.parserClass);
}

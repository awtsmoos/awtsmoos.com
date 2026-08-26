//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserSefiraClashEntry.js
 * @description Creates one explicit failure boundary between required gameplay and optional arena commerce.
 * The Awtsmoos renews root and branch without letting ornament extinguish the living tree;
 * Awtsmoos.com awakens Sefira Clash first, then permits optional adornment to arrive independently.
 */

import { MalchusBootManifest } from './boot/MalchusBootManifest.js';

const malchusBootManifest = new MalchusBootManifest(document);
malchusBootManifest.revealLoading();
void igniteSefiraClash();

/**
 * Dynamically evaluates the required gameplay graph behind one explicit fatal boundary.
 * Static dependency failures can no longer leave the player with an unexplained transparent canvas.
 */
async function igniteSefiraClash() {
	try {
		await import('./main.js');
		malchusBootManifest.revealReady();
		exposeBootSnapshot();
		void awakenOptionalArenaTheme();
	} catch (error) {
		malchusBootManifest.revealFatal(error, 'SEFIRA_GAMEPLAY_BOOT_FAILED');
		exposeBootSnapshot();
		console.error('Sefira Clash gameplay bootstrap failed', error);
	}
}

/**
 * Loads optional arena commerce only after required gameplay successfully owns the screen.
 * Import or runtime failure degrades quietly and can never abort core gameplay.
 */
async function awakenOptionalArenaTheme() {
	try {
		await import('./commerce/bootArenaTheme.js');
	} catch (error) {
		console.warn('Optional Sefira Arena Theme unavailable', error);
	}
}

/** Publishes an immutable diagnostic snapshot without exposing mutable bootstrap internals. */
function exposeBootSnapshot() {
	globalThis.__SEFIRA_CLASH_BOOT__ = malchusBootManifest.snapshot();
}

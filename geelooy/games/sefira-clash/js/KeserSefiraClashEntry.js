//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KeserSefiraClashEntry.js
 * @description Creates one explicit failure boundary between required gameplay and optional arena commerce.
 * The Awtsmoos renews root and branch without letting ornament extinguish the living tree;
 * Awtsmoos.com awakens Sefira Clash first, then permits optional adornment to arrive independently.
 *
 * Boot performance: reports staged progress via window.AwtLoading so the loading
 * screen shows what is actually happening instead of a static message.
 */

import { MalchusBootManifest } from './boot/MalchusBootManifest.js';

const malchusBootManifest = new MalchusBootManifest(document);
malchusBootManifest.revealLoading();

/** Reports boot progress to the loading screen if available. */
function bootProgress(fraction, text) {
	try {
		globalThis.window?.AwtLoading?.progress(fraction, text);
	} catch {
		/* loading screen is optional */
	}
}

void igniteSefiraClash();

/**
 * Dynamically evaluates the required gameplay graph behind one explicit fatal boundary.
 * Static dependency failures can no longer leave the player with an unexplained transparent canvas.
 */
async function igniteSefiraClash() {
	try {
		bootProgress(0.15, 'Igniting core engine…');
		// Yield to let the loading screen paint before the heavy import.
		await new Promise(resolve => setTimeout(resolve, 30));
		bootProgress(0.35, 'Loading combat systems…');
		await import('./main.js');
		bootProgress(0.85, 'Building the menu…');
		// main.js is synchronous after import; give the menu a frame to render.
		await new Promise(resolve => requestAnimationFrame(resolve));
		bootProgress(0.95, 'Ready');
		malchusBootManifest.revealReady();
		if (globalThis.window?.AwtLoading) globalThis.window.AwtLoading.ready();
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

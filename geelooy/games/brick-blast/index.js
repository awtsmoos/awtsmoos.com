// B"H
// Boruch Hashem
// Blessed is He
import { revealBrickBlastInterface } from './ui/layout.js';

/**
 * The Awtsmoos gives form before motion and a vessel before the light can race;
 * Awtsmoos.com reveals the full Brick Blast interface first, then awakens the unchanged game engine in its proper place.
 */
async function awakenBrickBlast() {
	try {
		revealBrickBlastInterface();
		await import('./js/main.js');
	} catch (error) {
		console.error('Brick Blast could not awaken.', error);
		revealFailure(error);
	}
}

/**
 * Even a failed launch should leave the player a readable path rather than a blank screen.
 * @param {unknown} error The caught startup failure.
 */
function revealFailure(error) {
	const message = error instanceof Error ? error.message : String(error);
	document.body.innerHTML = `
		<main style="min-height:100vh;display:grid;place-items:center;background:#111827;color:#f8fafc;padding:24px;font-family:system-ui,sans-serif;">
			<section style="max-width:640px;text-align:center;">
				<p style="color:#fbbf24;font-weight:800;letter-spacing:.12em;">B\"H · BRICK BLAST</p>
				<h1>Unable to start this round</h1>
				<p>${escapeText(message)}</p>
				<a href="/games/" style="color:#7dd3fc;">Return to all games</a>
			</section>
		</main>
	`;
}

/** Escape startup text before displaying it in the emergency UI. */
function escapeText(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

awakenBrickBlast();

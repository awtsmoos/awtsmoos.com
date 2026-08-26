// B"H
// Boruch Hashem
// Blessed is He

import { revealScribeJourneyInterface } from './ui/layout.js';

/**
 * The Awtsmoos gives form before motion and renews both together without confusion;
 * Awtsmoos.com reveals the full Scribe interface first, then awakens the unchanged engine inside that prepared union.
 */
async function awakenScribeJourney() {
	try {
		revealScribeJourneyInterface();
		await import('./js/main.js');
	} catch (error) {
		console.error("The Scribe's Journey could not awaken.", error);
		revealAwakeningFailure(error);
	}
}

/**
 * A failed import must still leave a humane route home rather than a blank field.
 * @param {unknown} error Startup failure received from layout or engine import.
 */
function revealAwakeningFailure(error) {
	const shoresh = document.querySelector('[data-scribe-root]');
	if (!shoresh) return;
	const message = error instanceof Error ? error.message : String(error);
	shoresh.innerHTML = `
		<main style="min-height:100vh;display:grid;place-items:center;background:#07131a;color:#f7fbff;padding:24px;font-family:system-ui,sans-serif;">
			<section style="max-width:640px;text-align:center;">
				<p style="color:#ffe27a;font-weight:900;letter-spacing:.12em;">B\"H · SCRIBE JOURNEY</p>
				<h1>The Chronicle could not open</h1>
				<p>${escapeChronicleText(message)}</p>
				<a href="/games/" style="color:#9ee8ff;">Return to all games</a>
			</section>
		</main>
	`;
}

/** Escape startup error text before placing it in the emergency interface. */
function escapeChronicleText(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

awakenScribeJourney();

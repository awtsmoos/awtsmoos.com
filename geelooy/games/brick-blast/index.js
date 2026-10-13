// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives form before motion and a vessel before the light can race;
 * Awtsmoos.com reveals the full Brick Blast interface first, then awakens the unchanged game engine in its proper place.
 * B"H bulletproof boot: every import is dynamic inside try/catch, the reveal is
 * verified, and a watchdog guarantees no black screen — any failure surfaces a
 * readable error with retry instead of silence.
 */
async function awakenBrickBlast() {
	try {
		const { revealBrickBlastInterface } = await import('./ui/layout.js');
		revealBrickBlastInterface();
		const root = document.getElementById('brick-blast-root');
		if (!root || !root.innerHTML.trim()) {
			throw new Error('The interface did not materialize (empty #brick-blast-root).');
		}
		await import('./js/main.js');
		window.dispatchEvent(new CustomEvent('awtsmoos:game-ready'));
	} catch (error) {
		console.error('Brick Blast could not awaken.', error);
		revealFailure(error);
	}
}

// Watchdog: if the game never signals ready and the root stays empty, surface
// a retry UI rather than leaving a black screen.
setTimeout(() => {
	try {
		const root = document.getElementById('brick-blast-root');
		const loaderGone = !document.getElementById('awtsmoos-loader');
		if (root && !root.innerHTML.trim() && loaderGone && !document.body.dataset.bbFailed) {
			document.body.dataset.bbFailed = 'true';
			revealFailure(new Error('The game did not finish loading. Check your connection and try again.'));
		}
	} catch { /* never let the watchdog itself fail */ }
}, 9000);

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
				<p><button onclick="location.reload()" style="padding:12px 28px;font-size:1rem;font-weight:700;border-radius:10px;border:2px solid #f5d97e;background:#1a2138;color:#ffe9a8;cursor:pointer;">Try again</button></p>
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

/* B"H — Boot: loading screen, tips, error handling, game start. */
import { startGame } from './game.js';

const TIPS = [
	'Arrow keys or swipe to move — jump the gaps',
	'Press J (or ש) to strike with the Shema',
	'Golden sparks restore a little koach',
	'Dark shadows patrol the platforms — strike or dodge',
	'Reach the glowing gate to complete the level',
	'You can jump a heartbeat after leaving a ledge',
];

const $ = (id) => document.getElementById(id);

function hideEl(el) {
	try { el.style.display = 'none'; }
	catch (_) { try { el.hidden = true; } catch (_) {} }
}

async function boot() {
	// B"H: shared WebGL help gate (Yaakov 2026-10-13). When WebGL is unavailable
	// the shared overlay explains + offers Try Again; stop the boot here.
	if (!window.AwtsmoosWebGL.ensure({ gameName: 'Shema Strike' })) return;
	const fill = $('ss-loading-fill');
	const tipEl = $('ss-loading-tip');
	const startBtn = $('ss-start');
	let tipIdx = 0;
	const tipTimer = setInterval(() => {
		tipIdx = (tipIdx + 1) % TIPS.length;
		if (tipEl) tipEl.textContent = TIPS[tipIdx];
	}, 2600);

	const setTip = (t) => { if (tipEl) tipEl.textContent = t; };

	try {
		const game = await startGame({
			canvas: $('ss-canvas'),
			loadingFill: fill,
			setTip,
		});
		clearInterval(tipTimer);
		setTip('Ready — the gate awaits.');
		startBtn.hidden = false;
		startBtn.addEventListener('click', () => {
			hideEl($('ss-loading'));
			game.begin();
		}, { once: true });
	} catch (err) {
		clearInterval(tipTimer);
		console.error('[shema-strike] boot failed:', err);
		const errEl = $('ss-loading-error');
		errEl.hidden = false;
		errEl.textContent = 'Could not start Shema Strike: ' + (err && err.message ? err.message : err);
		setTip('Please reload the page to try again.');
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}

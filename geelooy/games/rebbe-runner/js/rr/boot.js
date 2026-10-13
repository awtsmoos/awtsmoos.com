/* B"H — Boot: loading screen, tips, error handling, game start. */
import { startGame } from './game.js';
import { attachWardrobeButton } from '/games/scripts/wardrobe/ChossidWardrobeUI.js';

const TIPS = [
	'Swipe left / right to switch lanes',
	'Swipe up (or tap JUMP) to leap over stalls',
	'Swipe down to slide under banners',
	'Vans block the whole lane — dodge them!',
	'Grab Torah scrolls for +50 points',
	'Three hearts. Make them count.',
];

const $ = (id) => document.getElementById(id);

// Virtual-DOM-safe hide (some renderers expose style as getter-only).
function hideEl(el) {
	try { el.style.display = 'none'; }
	catch (_) { try { el.hidden = true; } catch (_) {} }
}

async function boot() {
	// B"H: shared WebGL help gate (Yaakov 2026-10-13). When WebGL is unavailable
	// the shared overlay explains + offers Try Again; stop the 3D boot here.
	if (!window.AwtsmoosWebGL.ensure({ gameName: "The Rebbe's Runner" })) return;
	const fill = $('rr-loading-fill');
	const tipEl = $('rr-loading-tip');
	const startBtn = $('rr-start');
	let tipIdx = 0;
	const tipTimer = setInterval(() => {
		tipIdx = (tipIdx + 1) % TIPS.length;
		if (tipEl) tipEl.textContent = TIPS[tipIdx];
	}, 2600);

	const setTip = (t) => { if (tipEl) tipEl.textContent = t; };

	try {
		const game = await startGame({
			canvas: $('rr-canvas'),
			loadingFill: fill,
			setTip,
		});
		clearInterval(tipTimer);
		setTip('Ready!');
		startBtn.hidden = false;
		startBtn.addEventListener('click', () => {
			hideEl($('rr-loading'));
			game.begin();
		}, { once: true });
	} catch (err) {
		clearInterval(tipTimer);
		console.error('[rebbe-runner] boot failed:', err);
		const errEl = $('rr-loading-error');
		errEl.hidden = false;
		errEl.textContent = 'Could not start the run: ' + (err && err.message ? err.message : err);
		setTip('Please reload the page to try again.');
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}

// B"H — unified wardrobe: floating button to dress your chossid.
try { attachWardrobeButton(); } catch (_) { /* wardrobe UI is decorative */ }

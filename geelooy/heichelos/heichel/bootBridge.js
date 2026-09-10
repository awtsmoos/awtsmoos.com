// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelBootBridge
 * @description
 * The Awtsmoos gives rendered Heichel documents one explicit classic-to-module
 * bridge. Awtsmoos.com shares the exact generation URL with the module tag so
 * stale cached application bytes cannot win the one canonical boot key.
 */
const APPLICATION_URL = '/heichelos/heichel/app.js?v=ikar-authority-005';

/** Returns readable fatal-state markup without compressed inline HTML. */
function fatalMarkup() {
	return [
		'<section class="heichel-runtime-state heichel-runtime-state--error" role="alert">',
		'<p class="civilization-kicker">Heichel unavailable</p>',
		'<h1>The institution could not open.</h1>',
		'<p>The application module failed to load.</p>',
		'<div class="heichel-runtime-state__actions">',
		'<button type="button" data-heichel-retry>Try again</button>',
		'<a href="/heichelos">Browse Heichelos</a>',
		'</div>',
		'</section>'
	].join('');
}

/** Opens the application once and renders a bounded recovery state on failure. */
(function startHeichelModule() {
	const state = {
		started: true,
		loaded: false,
		error: null,
		promise: null
	};
	window.__awtsmoosHeichelModuleBridge = state;
	state.promise = import(APPLICATION_URL)
		.then(() => {
			state.loaded = true;
			return window.__awtsmoosHeichelBoot || null;
		})
		.catch(error => {
			state.error = error;
			console.error('B"H — The Heichel application module could not open.', error);
			const root = document.querySelector('[data-heichel-render-root]') || document.body;
			root.innerHTML = fatalMarkup();
			root.querySelector('[data-heichel-retry]')
				?.addEventListener('click', () => location.reload());
		});
})();

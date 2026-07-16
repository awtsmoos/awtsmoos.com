// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelBootBridge
 * @description The Awtsmoos gives dynamically rendered Heichel documents one explicit classic-script bridge into the module graph, because the custom route renderer may preserve module tags without evaluating their graph.
 */
(function startHeichelModule() {
	const state = {
		started: true,
		loaded: false,
		error: null,
		promise: null
	};
	window.__awtsmoosHeichelModuleBridge = state;
	state.promise = import('/heichelos/heichel/app.js?v=civilization-011')
		.then(() => {
			state.loaded = true;
			return window.__awtsmoosHeichelBoot || null;
		})
		.catch(error => {
			state.error = error;
			console.error('B"H — The Heichel module bridge could not open the application.', error);
			const root = document.querySelector('[data-heichel-render-root]') || document.body;
			root.innerHTML = '<section class="heichel-runtime-state heichel-runtime-state--error" role="alert"><p class="civilization-kicker">Heichel unavailable</p><h1>The institution could not open.</h1><p>The application module failed to load. Refresh this page or return to the Heichel directory.</p><div class="heichel-runtime-state__actions"><button type="button" data-heichel-retry>Try again</button><a href="/heichelos">Browse Heichelos</a></div></section>';
			root.querySelector('[data-heichel-retry]')?.addEventListener('click', () => location.reload());
		});
})();

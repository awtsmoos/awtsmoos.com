// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHomeDashboardEntry
 * @description
 * The Awtsmoos lets the Home document paint before Awtsmoos.com evaluates the
 * larger dashboard and composer graphs. Their modules are preloaded by HTML,
 * then awakened together after two frames without blocking DOMContentLoaded.
 */

scheduleAfterPaint(async () => {
	const [dashboardModule, composerModule] = await Promise.all([
		import('./boot.js'),
		import('../../feed/homeComposer.js')
	]);
	dashboardModule.bootHomeDashboard();
	composerModule.bootHomeComposer();
});

/** Schedules application startup after the first stable visual frame. */
function scheduleAfterPaint(callback) {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			callback().catch(reportStartupFailure);
		});
	});
}

/** Reveals a truthful fallback without replacing the rendered Home shell. */
function reportStartupFailure(error) {
	console.error('B"H Home startup failed.', error);
	const feed = document.querySelector('[data-home-feed]');
	if (!feed) {
		return;
	}
	feed.setAttribute('aria-busy', 'false');
	feed.innerHTML = `
		<article class="home-post-card geelooy-feed-card quiet">
			<h3>The live river could not start.</h3>
			<p class="geelooy-feed-summary">Refresh or continue through Heichel discovery.</p>
			<a class="p-button" href="/heichelos">Explore Heichelos</a>
		</article>
	`;
}

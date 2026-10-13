//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file awtsmoos-loading.js
 * @description Shared loading screen driver for Awtsmoos games.
 * The overlay markup lives in each game's index.html (first paint, no JS needed).
 * This driver: rotates tips, advances a REAL progress bar from resource-timing
 * (assets actually loading — never a fake timer), and fades out when the game
 * calls window.AwtsmoosLoading.done(). A safety cap guarantees it never sticks.
 *
 * Per-game wiring:
 *   <div id="awtsmoos-loading" class="awtsmoos-loading"
 *        data-cover="...game-x.webp" data-title="Game Name"
 *        data-tips="Tip one|Tip two|Tip three"></div>
 *   <script src="/games/js/awtsmoos-loading.js"></script>
 *   ... game calls window.AwtsmoosLoading.done() when boot completes ...
 */
(function () {
	'use strict';

	var OVERLAY_ID = 'awtsmoos-loading';
	var TIP_MS = 4200;
	var SAFETY_MS = 120000;

	function $(id) { return document.getElementById(id); }

	function buildOverlay() {
		var host = $(OVERLAY_ID);
		if (!host) return null;
		if (host.dataset.built === '1') return host;
		host.dataset.built = '1';
		var cover = host.dataset.cover || '';
		var title = host.dataset.title || 'Awtsmoos';
		var tips = (host.dataset.tips || '').split('|').filter(Boolean);
		host.innerHTML =
			(cover ? '<img class="awtsmoos-loading-cover" src="' + cover + '" alt="" draggable="false">' : '') +
			'<div class="awtsmoos-loading-scrim"></div>' +
			'<div class="awtsmoos-loading-card">' +
			'<h1 class="awtsmoos-loading-title">' + title + '</h1>' +
			'<div class="awtsmoos-loading-bar"><i id="awtsmoos-loading-fill"></i></div>' +
			'<p class="awtsmoos-loading-tip" id="awtsmoos-loading-tip"></p>' +
			'</div>';
		return { host: host, tips: tips };
	}

	var built = buildOverlay();
	if (!built) return;
	var host = built.host;
	var tips = built.tips;
	var fill = $('awtsmoos-loading-fill');
	var tipEl = $('awtsmoos-loading-tip');
	var tipIndex = 0;
	var tipTimer = null;
	var finished = false;
	var loadedResources = 0;

	function showTip(index) {
		if (!tips.length || !tipEl) return;
		tipEl.classList.add('awtsmoos-loading-tip-fade');
		setTimeout(function () {
			tipEl.textContent = tips[index % tips.length];
			tipEl.classList.remove('awtsmoos-loading-tip-fade');
		}, 380);
	}

	function rotateTips() {
		if (!tips.length) return;
		showTip(tipIndex++);
		tipTimer = setTimeout(rotateTips, TIP_MS);
	}

	// B"H: real progress — every resource the browser actually finishes loading
	// advances the bar toward 90%; done() carries it to 100%.
	function setProgress(ratio) {
		if (!fill || finished) return;
		var pct = Math.max(0, Math.min(90, ratio * 90));
		fill.style.width = pct.toFixed(1) + '%';
	}

	function observeResources() {
		if (typeof PerformanceObserver === 'undefined') return;
		try {
			var observer = new PerformanceObserver(function (list) {
				var entries = list.getEntries();
				for (var i = 0; i < entries.length; i++) {
					loadedResources += 1;
				}
				// Saturating curve: real count, never a timer.
				setProgress(1 - Math.pow(0.82, loadedResources));
			});
			observer.observe({ type: 'resource', buffered: true });
		} catch (e) { /* older browsers: bar advances on done() */ }
	}

	function done() {
		if (finished) return;
		finished = true;
		if (tipTimer) clearTimeout(tipTimer);
		if (fill) fill.style.width = '100%';
		// Let the full bar read for a beat, then fade into gameplay.
		setTimeout(function () {
			host.classList.add('awtsmoos-loading-done');
			setTimeout(function () {
				if (host.parentNode) host.parentNode.removeChild(host);
			}, 800);
		}, 350);
	}

	rotateTips();
	observeResources();
	// Safety: never trap the player behind the loader.
	setTimeout(function () { done(); }, SAFETY_MS);

	window.AwtsmoosLoading = {
		done: done,
		setProgress: function (p) { setProgress(Math.max(0, Math.min(1, p))); }
	};
})();

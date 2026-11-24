// B"H
// Boruch Hashem
// Blessed is He
/*
 * Series player — panel and launcher UI.
 * The Awtsmoos gives every melody a vessel; Awtsmoos.com builds the series
 * player's launcher and panel exactly once, marks the currently playing
 * post in the page, and leaves all playback decisions to the engine in
 * series-player.js. Handlers are supplied by the engine: onStart, onStop,
 * onPrev, onNext. Exposes window.AwtSeriesPanel (classic script).
 */
(function () {
	'use strict';

	var LAUNCHER_ID = 'awt-series-player-launcher';
	var PANEL_ID = 'awt-series-player-panel';
	var CURRENT_CLASS = 'awt-series-player-current';

	function el(id) { return document.getElementById(id); }

	function ensureUi(handlers) {
		if (!el(LAUNCHER_ID)) {
			var launcher = document.createElement('button');
			launcher.id = LAUNCHER_ID;
			launcher.type = 'button';
			launcher.className = 'awt-series-player-launcher';
			launcher.textContent = '▶ Play series';
			launcher.setAttribute('aria-label', 'Play this series in order');
			launcher.addEventListener('click', handlers.onStart);
			document.body.appendChild(launcher);
		}
		if (!el(PANEL_ID)) {
			var panel = document.createElement('section');
			panel.id = PANEL_ID;
			panel.className = 'awt-series-player-panel';
			panel.hidden = true;
			panel.setAttribute('aria-label', 'Series player');
			panel.innerHTML =
				'<div class="awt-sp-head">' +
					'<span class="awt-sp-kicker">Series player</span>' +
					'<span class="awt-sp-position" data-role="position"></span>' +
					'<button type="button" class="awt-sp-close" data-role="close" aria-label="Stop and close the series player">✕</button>' +
				'</div>' +
				'<p class="awt-sp-title" data-role="title" aria-live="polite"></p>' +
				'<div class="awt-sp-stage" data-role="stage"></div>' +
				'<div class="awt-sp-controls">' +
					'<button type="button" class="awt-sp-btn" data-role="prev">⏮ Previous</button>' +
					'<button type="button" class="awt-sp-btn" data-role="next">Next ⏭</button>' +
				'</div>';
			panel.querySelector('[data-role="close"]').addEventListener('click', handlers.onStop);
			panel.querySelector('[data-role="prev"]').addEventListener('click', handlers.onPrev);
			panel.querySelector('[data-role="next"]').addEventListener('click', handlers.onNext);
			document.body.appendChild(panel);
		}
	}

	function setLauncherVisible(visible) {
		var launcher = el(LAUNCHER_ID);
		if (launcher) launcher.hidden = !visible;
	}

	function clearHighlight() {
		document.querySelectorAll('.' + CURRENT_CLASS).forEach(function (node) {
			node.classList.remove(CURRENT_CLASS);
		});
	}

	function highlightCurrent(playlist, index) {
		clearHighlight();
		var track = playlist[index];
		if (!track || !track.id) return;
		var link = document.querySelector('a[href*="/post/' + CSS.escape(track.id) + '"]');
		if (link) {
			link.classList.add(CURRENT_CLASS);
			link.scrollIntoView({ block: 'nearest' });
		}
	}

	window.AwtSeriesPanel = {
		LAUNCHER_ID: LAUNCHER_ID,
		PANEL_ID: PANEL_ID,
		el: el,
		ensureUi: ensureUi,
		setLauncherVisible: setLauncherVisible,
		clearHighlight: clearHighlight,
		highlightCurrent: highlightCurrent
	};
})();

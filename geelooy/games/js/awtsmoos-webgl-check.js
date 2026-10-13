//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoos-webgl-check.js
 * @description Shared WebGL availability gate for all Awtsmoos 3D games.
 * When WebGL is unavailable, shows a helpful overlay instead of a cryptic error:
 * explains the problem, suggests restarting the browser, lists common causes,
 * and offers a "Try Again" button that re-checks WebGL.
 *
 * Usage (in a 3D game's entry script, before creating any renderer):
 *   <script src="/games/js/awtsmoos-webgl-check.js"></script>
 *   <script>
 *     if (!window.AwtsmoosWebGL.ensure({ gameName: 'Temple Runner' })) {
 *       // overlay is shown; stop booting the 3D scene
 *     } else {
 *       // safe to create WebGL renderer
 *     }
 *   </script>
 */

(function () {
	'use strict';

	var OVERLAY_ID = 'awtsmoos-webgl-help';

	function probeWebGL() {
		try {
			var canvas = document.createElement('canvas');
			var gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (gl) {
				// Some browsers return a context object that is actually unusable; sanity check one call.
				try { gl.getParameter(gl.VERSION); } catch (e) { return null; }
				return gl;
			}
			return null;
		} catch (e) {
			return null;
		}
	}

	function commonCauses() {
		var causes = [];
		// Heuristic: file:// or very old browsers often lack WebGL.
		if (typeof WebGLRenderingContext === 'undefined') {
			causes.push('This browser does not support WebGL at all — try the latest Chrome or Safari.');
		} else {
			causes.push('The browser may need a restart — WebGL sometimes fails until the browser is fully restarted.');
			causes.push('Hardware acceleration may be disabled in the browser settings.');
			causes.push('Another app may be using the graphics processor (try closing heavy apps or tabs).');
		}
		return causes;
	}

	function showOverlay(options) {
		options = options || {};
		var gameName = options.gameName || 'This game';
		if (document.getElementById(OVERLAY_ID)) return;

		var overlay = document.createElement('div');
		overlay.id = OVERLAY_ID;
		overlay.setAttribute('role', 'alertdialog');
		overlay.setAttribute('aria-label', 'WebGL unavailable');

		var causesHtml = commonCauses().map(function (c) {
			return '<li>' + c.replace(/</g, '&lt;') + '</li>';
		}).join('');

		overlay.innerHTML =
			'<div class="awgl-card">' +
				'<p class="awgl-kicker">B"H · Awtsmoos Games</p>' +
				'<h1 class="awgl-title">WebGL isn\'t available</h1>' +
				'<p class="awgl-copy"><strong>' + gameName.replace(/</g, '&lt;') + '</strong> needs WebGL to render its 3D world, and your browser could not provide it right now.</p>' +
				'<p class="awgl-copy"><strong>Please restart your browser and try again.</strong> A fresh browser session fixes this most of the time.</p>' +
				'<p class="awgl-sub">Common causes:</p>' +
				'<ul class="awgl-causes">' + causesHtml + '</ul>' +
				'<div class="awgl-actions">' +
					'<button type="button" class="awgl-btn awgl-btn-primary" id="awgl-retry">Try Again</button>' +
					'<a class="awgl-btn awgl-btn-ghost" href="/games/">All Games</a>' +
				'</div>' +
			'</div>';

		document.body.appendChild(overlay);

		document.getElementById('awgl-retry').addEventListener('click', function () {
			if (probeWebGL()) {
				overlay.remove();
				if (typeof options.onRecovered === 'function') options.onRecovered();
				else window.location.reload();
			} else {
				var copy = overlay.querySelector('.awgl-copy');
				if (copy) copy.innerHTML = '<strong>Still no WebGL.</strong> Please restart your browser completely (close every window) and try again.';
			}
		});
	}

	/**
	 * Ensures WebGL is available. Shows the help overlay and returns false when it is not.
	 * @param {object} options { gameName: string, onRecovered?: function }
	 * @returns {boolean} true when WebGL is available.
	 */
	function ensure(options) {
		if (probeWebGL()) return true;
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function () { showOverlay(options); }, { once: true });
		} else {
			showOverlay(options);
		}
		return false;
	}

	window.AwtsmoosWebGL = {
		ensure: ensure,
		probe: probeWebGL
	};
})();

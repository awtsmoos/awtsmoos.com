// B"H
// Boruch Hashem
// Blessed be He

/**
 * @file awt-loading-screen.js
 * @description Shared Awtsmoos game loading screen. Include as the FIRST script
 * inside <body>, synchronously, with data- config:
 *
 * <script src="/games/shared/awt-loading-screen.js"
 *   data-cover="https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/games/game-dove.webp"
 *   data-title="Noah's Dove Jump"
 *   data-kicker="B&quot;H · Awtsmoos Games"
 *   data-tips="Tip one|Tip two|Tip three"
 *   data-accent="#8fd0ff"><\/script>
 *
 * Progress is REAL, never a fake timer:
 *  - 0.00–0.70: tracked from actual resource loads (scripts, styles, images)
 *    observed on document with capture-phase load/error listeners.
 *  - 0.70–1.00: game boot. Games report milestones via
 *      window.AwtLoading.progress(0.85, "Building world…")
 *    and finish with
 *      window.AwtLoading.ready()
 *    or  window.dispatchEvent(new CustomEvent("awt:game-ready")).
 * Fallbacks: window "load" pushes progress to >= 0.9; a 15s watchdog always
 * fades the overlay out so it can never trap the player. Minimum display 700ms
 * keeps the fade from flashing.
 */
(function () {
	'use strict';
	if (typeof document === 'undefined') return;
	if (window.AwtLoading) return; // already installed

	var scriptEl = document.currentScript || (function () {
		var scripts = document.getElementsByTagName('script');
		return scripts[scripts.length - 1];
	})();
	function data(name, fallback) {
		var v = scriptEl && scriptEl.getAttribute('data-' + name);
		return v == null || v === '' ? fallback : v;
	}

	var COVER = data('cover', '');
	var TITLE = data('title', 'Awtsmoos');
	var KICKER = data('kicker', 'B"H · Awtsmoos Games');
	var ACCENT = data('accent', '#f5d97e');
	var TIPS = data('tips', '').split('|').map(function (t) { return t.trim(); }).filter(Boolean);

	var MIN_MS = 700;
	var MAX_MS = 15000;
	var shownAt = Date.now();
	var progress = 0;
	var label = 'Loading…';
	var done = false;
	var tipIndex = 0;
	var tipTimer = null;

	// ---- DOM ----
	var style = document.createElement('style');
	style.setAttribute('data-awt-loading', '1');
	style.textContent = [
		'.awt-loading{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
		'background:#06090f;color:#f3ead2;font-family:"Courier New",ui-monospace,monospace;overflow:hidden;',
		'transition:opacity .6s ease;}',
		'.awt-loading.awtdone{opacity:0;pointer-events:none;}',
		'.awt-loading .awtbg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.1);}',
		'.awt-loading .awtveil{position:absolute;inset:0;',
		'background:radial-gradient(120% 90% at 50% 20%,rgba(6,9,15,.25) 0%,rgba(6,9,15,.78) 70%,rgba(6,9,15,.94) 100%);}',
		'.awt-loading .awtcard{position:relative;text-align:center;max-width:min(92vw,34rem);padding:2rem 1.5rem;}',
		'.awt-loading .awtkicker{font-size:.8rem;letter-spacing:.35em;color:' + ACCENT + ';margin:0 0 .9rem;}',
		'.awt-loading h1{font-size:clamp(1.6rem,5vw,2.6rem);margin:0 0 1.4rem;letter-spacing:.12em;color:#f7efdc;',
		'text-shadow:0 2px 24px rgba(0,0,0,.7);}',
		'.awt-loading .awtbarwrap{height:.55rem;border:1px solid rgba(245,217,126,.4);border-radius:999px;overflow:hidden;',
		'background:rgba(255,255,255,.07);margin:0 auto;max-width:26rem;}',
		'.awt-loading .awtbar{height:100%;width:0%;border-radius:999px;',
		'background:linear-gradient(90deg,' + ACCENT + ',#fff8e1);transition:width .25s ease;}',
		'.awt-loading .awtlabel{margin:.8rem 0 0;font-size:.85rem;color:#d9cba4;min-height:1.2em;}',
		'.awt-loading .awttip{margin:1.6rem 0 0;font-size:.9rem;color:#bfae7f;font-style:italic;min-height:2.6em;',
		'transition:opacity .4s ease;}',
		'.awt-loading .awttip.owtfade{opacity:0;}',
		'.awt-loading .awtspark{position:absolute;border-radius:50%;background:' + ACCENT + ';opacity:.5;pointer-events:none;',
		'animation:awtfloat 7s linear infinite;}',
		'@keyframes awtfloat{0%{transform:translateY(10vh);}100%{transform:translateY(-110vh);}}',
		'@media (prefers-reduced-motion:reduce){.awt-loading .awtspark{display:none;}}'
	].join('\n');
	(document.head || document.documentElement).appendChild(style);

	var root = document.createElement('div');
	root.className = 'awt-loading';
	root.setAttribute('role', 'status');
	root.setAttribute('aria-label', TITLE + ' is loading');
	var bg = document.createElement('div');
	bg.className = 'awtbg';
	if (COVER) bg.style.backgroundImage = 'url("' + COVER.replace(/"/g, '') + '")';
	var veil = document.createElement('div');
	veil.className = 'awtveil';
	var card = document.createElement('div');
	card.className = 'awtcard';
	var kicker = document.createElement('p');
	kicker.className = 'awtkicker';
	kicker.textContent = KICKER;
	var h1 = document.createElement('h1');
	h1.textContent = TITLE;
	var barWrap = document.createElement('div');
	barWrap.className = 'awtbarwrap';
	var bar = document.createElement('div');
	bar.className = 'awtbar';
	barWrap.appendChild(bar);
	var labelEl = document.createElement('p');
	labelEl.className = 'awtlabel';
	labelEl.textContent = label;
	var tipEl = document.createElement('p');
	tipEl.className = 'awttip';
	tipEl.textContent = TIPS.length ? TIPS[0] : '';
	card.appendChild(kicker);
	card.appendChild(h1);
	card.appendChild(barWrap);
	card.appendChild(labelEl);
	card.appendChild(tipEl);
	root.appendChild(bg);
	root.appendChild(veil);
	root.appendChild(card);
	// ambient sparks (pure CSS, cheap)
	for (var i = 0; i < 14; i++) {
		var s = document.createElement('i');
		s.className = 'awtspark';
		var size = 2 + Math.random() * 4;
		s.style.width = size + 'px';
		s.style.height = size + 'px';
		s.style.left = (Math.random() * 100) + 'vw';
		s.style.top = (60 + Math.random() * 50) + 'vh';
		s.style.animationDelay = (-Math.random() * 7) + 's';
		s.style.animationDuration = (5 + Math.random() * 6) + 's';
		root.appendChild(s);
	}
	// Insert as the very first node in body so it paints before game UI.
	if (document.body) document.body.insertBefore(root, document.body.firstChild);
	else document.documentElement.appendChild(root);

	function render() {
		bar.style.width = Math.round(progress * 100) + '%';
		labelEl.textContent = label;
	}
	function setProgress(p, text) {
		if (done) return;
		progress = Math.max(progress, Math.min(1, p));
		if (text) label = text;
		render();
	}
	function rotateTip() {
		if (done || TIPS.length < 2) return;
		tipEl.classList.add('owtfade');
		setTimeout(function () {
			if (done) return;
			tipIndex = (tipIndex + 1) % TIPS.length;
			tipEl.textContent = TIPS[tipIndex];
			tipEl.classList.remove('owtfade');
		}, 400);
	}
	if (TIPS.length > 1) tipTimer = setInterval(rotateTip, 3500);

	function finish() {
		if (done) return;
		done = true;
		setProgress(1, 'Ready');
		if (tipTimer) clearInterval(tipTimer);
		var wait = Math.max(0, MIN_MS - (Date.now() - shownAt));
		setTimeout(function () {
			root.classList.add('awtdone');
			setTimeout(function () { if (root.parentNode) root.parentNode.removeChild(root); }, 700);
		}, wait);
	}

	// ---- real resource-load tracking (0 → 0.7) ----
	var pending = 0;
	var total = 0;
	function bump(loaded) {
		if (done) return;
		if (loaded) pending = Math.max(0, pending - 1);
		var frac = total === 0 ? 0 : (total - pending) / total;
		setProgress(0.08 + frac * 0.62, total ? ('Loading assets ' + (total - pending) + '/' + total + '…') : 'Loading…');
		if (total > 0 && pending === 0) setProgress(0.7, 'Starting…');
	}
	function watch(el) {
		total++;
		pending++;
		var settled = false;
		var onSettle = function () { if (!settled) { settled = true; bump(true); } };
		el.addEventListener('load', onSettle);
		el.addEventListener('error', onSettle);
		// already-complete resources (cached) settle on next tick
		setTimeout(function () {
			if (el.tagName === 'IMG' && el.complete) onSettle();
			else if ((el.tagName === 'SCRIPT' || el.tagName === 'LINK') && el.sheet === undefined) { /* wait for events */ }
		}, 0);
	}
	function scan() {
		var els = document.querySelectorAll('script[src], link[rel="stylesheet"], img[src]');
		for (var i = 0; i < els.length; i++) {
			if (!els[i].__awtWatched) { els[i].__awtWatched = true; watch(els[i]); }
		}
		if (total === 0) setProgress(0.08, 'Loading…');
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', scan);
	} else {
		scan();
	}
	// catch resources added later (game-injected)
	// B"H: the observer callback is guarded — if a DOM shim throws inside scan(),
	// disconnect instead of letting the error escape (real browsers never throw here).
	if (typeof MutationObserver !== 'undefined' && document.body) {
		var mo = new MutationObserver(function () {
			if (done) { try { mo.disconnect(); } catch (e) {} return; }
			try { scan(); } catch (e) { try { mo.disconnect(); } catch (e2) {} }
		});
		mo.observe(document.documentElement, { childList: true, subtree: true });
	}

	window.addEventListener('load', function () {
		setProgress(Math.max(progress, 0.9), 'Almost there…');
		// if the game never signals ready, don't trap the player
		setTimeout(function () { if (!done) finish(); }, 2500);
	});
	// absolute watchdog: never trap the player behind the overlay
	setTimeout(function () { if (!done) finish(); }, MAX_MS);

	window.addEventListener('awt:game-ready', finish);
	window.AwtLoading = {
		progress: setProgress,
		ready: finish,
		isDone: function () { return done; }
	};
	render();
})();

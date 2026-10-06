/* B"H
 * topnavMotion.js — motion controller for the app shell's
 * vivid-extreme-professional layer.
 *
 * Companion to topnav-refinements.css (which owns all visuals; this file
 * only toggles classes, positions the ink indicator, and exposes the dim
 * API). Runs AFTER ensureAppShell() — it watches briefly for .g-shell and
 * stops, so load it with defer anywhere after the shell boot, or call
 * window.__topnavMotionBoot() manually.
 *
 * Loaded universally: boot.js dynamic-imports this module after the shell
 * boots (skipped under prefers-reduced-motion, where boot.js marks .is-ready
 * directly), so every shell page gets the motion layer with zero per-page tags.
 * The import is fire-and-forget with a catch — if this file ever fails to
 * load, the shell is unaffected.
 *
 * Verified hook points (Mac repo, native reads 2026-09-28):
 *  - .g-shell div with data-g-shell="true" (ensureAppShell, appShell.js)
 *  - nav.g-dock built by createAppShellDock (AppShellRouteLinks.js)
 *  - a[aria-current="page"] set by markAppShellCurrentLinks — real semantics,
 *    no invented classes
 *  - brand one-tap home: header a[href="/"] (createUnusualHeader)
 *
 * What it does:
 *   1. Adds .is-ready to .g-shell so the CSS entrance plays, and removes
 *      data-state="loading" so the skeleton shimmer lifts (no-JS: the class
 *      is never added and the shell simply appears — never hidden
 *      behind a JS gate).
 *   2. Injects the sliding ink indicator (.gnav-ink) into nav.g-dock and
 *      glides it under the active route; follows hover/focus for delight,
 *      snaps back on leave/blur. RTL-aware via computed direction.
 *   3. Exposes window.__topnavDim(on) + window.__topnavReaderDim(options)
 *      implementing the reader proposal's auto-dim behavior.
 *   4. Under prefers-reduced-motion: entrance still marks ready (harmless),
 *      but no ink gliding and no 3D transforms are driven from JS.
 *
 * Mission laws: tabs, no minify, no layout thrash (rAF-batched reads),
 * keyboard-safe, RTL/LTR via logical properties + direction checks.
 */
(function () {
	'use strict';

	var SHELL_SELECTOR = '.g-shell';
	var DOCK_SELECTOR = 'nav.g-dock';
	var READY_CLASS = 'is-ready';
	var INK_CLASS = 'gnav-ink';
	var DIM_CLASS = 'is-dim';

	var reduceMotionQuery = null;
	try {
		reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	} catch (err) {
		reduceMotionQuery = null;
	}

	function prefersReducedMotion() {
		return !!(reduceMotionQuery && reduceMotionQuery.matches);
	}

	function getShell() {
		try {
			return document.querySelector(SHELL_SELECTOR);
		} catch (err) {
			return null;
		}
	}

	/* ------------------------------------------------------------------
	 * Ink indicator — route continuity.
	 * ------------------------------------------------------------------ */
	function findActiveLink(dock) {
		/* aria-current is the contract (markAppShellCurrentLinks). */
		var current = null;
		try {
			current = dock.querySelector('a[aria-current="page"]');
		} catch (err) {
			current = null;
		}
		if (current) {
			return current;
		}
		/* Fallback: exact pathname match against the dock hrefs. Never guess
		 * on prefix — /mawgawl must not light up Search (/mawgawl/sefarim). */
		var links = dock.querySelectorAll('a[href]');
		var path = window.location.pathname;
		for (var i = 0; i < links.length; i++) {
			var href = links[i].getAttribute('href');
			if (href && href.charAt(0) === '/' && path === href) {
				return links[i];
			}
		}
		return null;
	}

	function placeInk(dock, ink, link) {
		if (!link) {
			ink.style.opacity = '0';
			return;
		}
		var dockRect = dock.getBoundingClientRect();
		var linkRect = link.getBoundingClientRect();
		if (dockRect.width === 0 || linkRect.width === 0) {
			return;
		}
		var isRtl = false;
		try {
			isRtl = window.getComputedStyle(dock).direction === 'rtl';
		} catch (err) {
			isRtl = false;
		}
		/* Logical inset-inline-start from physical rects. */
		var start = isRtl
			? dockRect.right - linkRect.right
			: linkRect.left - dockRect.left;
		/* Batch the writes; callers rAF-throttle. */
		ink.style.opacity = '1';
		ink.style.insetInlineStart = start + 'px';
		ink.style.width = linkRect.width + 'px';
	}

	function initInk(shell) {
		var dock = null;
		try {
			dock = shell.querySelector(DOCK_SELECTOR);
		} catch (err) {
			dock = null;
		}
		if (!dock || prefersReducedMotion()) {
			return;
		}
		/* The ink is absolutely positioned; ensure a positioning context
		 * without overriding an explicit one the shell may set. */
		var positioned = false;
		try {
			positioned = window.getComputedStyle(dock).position !== 'static';
		} catch (err) {
			positioned = false;
		}
		if (!positioned) {
			/* B"H: guard against a stylesheet race. dock.css positions
			 * .g-dock fixed on narrow viewports; if this runs before that
			 * rule applies, computed position reads 'static' and an inline
			 * 'relative' would permanently override the fixed rule (inline
			 * beats stylesheet), stranding the dock in-flow at the top of
			 * the page. 'fixed' already contains absolutely-positioned
			 * descendants, so only add a positioning context where the dock
			 * is not meant to be fixed. */
			var narrow = false;
			try { narrow = window.matchMedia('(max-width: 54rem)').matches; } catch (err) { narrow = false; }
			if (!narrow) {
				dock.style.position = 'relative';
			}
		}

		var ink = document.createElement('span');
		ink.className = INK_CLASS;
		ink.setAttribute('aria-hidden', 'true');
		dock.appendChild(ink);

		var activeLink = findActiveLink(dock);
		var scheduled = false;

		function render(target) {
			if (scheduled) {
				return;
			}
			scheduled = true;
			window.requestAnimationFrame(function () {
				scheduled = false;
				placeInk(dock, ink, target === undefined ? activeLink : target);
			});
		}

		render();

		/* Keep the ink honest across resize / font load / orientation. */
		if (typeof window.ResizeObserver === 'function') {
			var ro = new window.ResizeObserver(function () {
				render();
			});
			ro.observe(dock);
		} else {
			window.addEventListener('resize', render, { passive: true });
		}

		/* Delight: the ink follows hover/focus, then snaps home. */
		var links = dock.querySelectorAll('a[href]');
		for (var i = 0; i < links.length; i++) {
			(function (link) {
				link.addEventListener('pointerenter', function () {
					render(link);
				});
				link.addEventListener('focus', function () {
					render(link);
				});
				link.addEventListener('pointerleave', function () {
					render();
				});
				link.addEventListener('blur', function () {
					render();
				});
			})(links[i]);
		}
	}

	/* ------------------------------------------------------------------
	 * Dim API — reader-respecting persistent nav.
	 * ------------------------------------------------------------------ */
	function setDim(shell, on) {
		if (!shell) {
			return;
		}
		shell.classList.toggle(DIM_CLASS, !!on);
	}

	/**
	 * window.__topnavReaderDim(options) — auto-dim per the reader spec:
	 * dims after `idleMs` without interaction; restores on upward scroll,
	 * pointer in the top `zonePx`, focus entering the header, or tap in
	 * the top zone. Returns a teardown function.
	 */
	function startReaderDim(userOptions) {
		var shell = getShell();
		if (!shell) {
			return function () {};
		}
		var options = userOptions || {};
		var idleMs = typeof options.idleMs === 'number' ? options.idleMs : 2500;
		var zonePx = typeof options.zonePx === 'number' ? options.zonePx : 64;

		var idleTimer = null;
		var lastScrollY = window.scrollY || 0;
		var tornDown = false;

		function armIdleTimer() {
			clearTimeout(idleTimer);
			idleTimer = setTimeout(function () {
				if (!tornDown) {
					setDim(shell, true);
				}
			}, idleMs);
		}

		function wake() {
			if (tornDown) {
				return;
			}
			setDim(shell, false);
			armIdleTimer();
		}

		function onScroll() {
			var y = window.scrollY || 0;
			/* Upward scroll reversals wake the bar; downward keeps reading. */
			if (y < lastScrollY - 4) {
				wake();
			}
			lastScrollY = y;
		}

		function onPointerMove(ev) {
			if (ev && ev.clientY <= zonePx) {
				wake();
			}
		}

		function onPointerDown(ev) {
			if (ev && ev.clientY <= zonePx) {
				wake();
			} else {
				armIdleTimer();
			}
		}

		function onFocusIn(ev) {
			var header = null;
			try {
				header = shell.querySelector(':scope > header');
			} catch (err) {
				header = null;
			}
			if (header && ev.target && header.contains(ev.target)) {
				wake();
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerdown', onPointerDown, { passive: true });
		document.addEventListener('focusin', onFocusIn);

		armIdleTimer();

		return function teardown() {
			tornDown = true;
			clearTimeout(idleTimer);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('focusin', onFocusIn);
			setDim(shell, false);
		};
	}

	/* ------------------------------------------------------------------
	 * Boot.
	 * ------------------------------------------------------------------ */
	function boot() {
		var shell = getShell();
		if (!shell) {
			return false;
		}
		shell.classList.add(READY_CLASS);
		shell.removeAttribute('data-state');
		initInk(shell);

		window.__topnavDim = function (on) {
			setDim(getShell(), on);
		};
		window.__topnavReaderDim = startReaderDim;
		return true;
	}

	function bootWhenReady() {
		if (boot()) {
			return;
		}
		/* The shell may boot after this file (defer order, dynamic boot).
		 * Watch briefly, then stop — never spin forever. */
		var attempts = 0;
		var timer = setInterval(function () {
			attempts++;
			if (boot() || attempts >= 40) {
				clearInterval(timer);
			}
		}, 250);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bootWhenReady);
	} else {
		bootWhenReady();
	}

	/* Manual boot for pages that inject the shell dynamically. */
	window.__topnavMotionBoot = bootWhenReady;
})();

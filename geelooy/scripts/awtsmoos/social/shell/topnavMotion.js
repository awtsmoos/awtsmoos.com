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
	var navDiagInstalled = false;

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
	 * Nav diagnostic — B"H social fix 19 (defects 1, 2).
	 * Four investigations found no mechanism in the served code for the
	 * rendered-check observations (global nav scrolling away; chat button
	 * and Mail link doing nothing), and the checker tools cannot run JS.
	 * So the live values are written INTO the DOM where the checker can
	 * read them: a visually-hidden div (#awtsmoos-nav-diag) plus a
	 * data-nav-diag attribute on <html>, holding a compact JSON snapshot
	 * (header computed position + bounding rect, scrollY, the element at
	 * the chat button's and Mail link's centers, and whether a click ever
	 * reached either control). Read-only: it never touches the header,
	 * the buttons, or any handler, never prevents default, never stops
	 * propagation, and every step is try/catch-guarded so a failure
	 * cannot affect the shell. Remove once defects 1-2 are resolved.
	 * ------------------------------------------------------------------ */
	function snapshotNavDiag(shell, clicks) {
		try {
			var header = null;
			try { header = shell.querySelector(':scope > header'); } catch (err) { header = null; }
			if (!header) { try { header = document.querySelector('.g-unusual-header'); } catch (err) { header = null; } }
			var cs = null; var rect = null;
			if (header) {
				try { cs = window.getComputedStyle(header); } catch (err) { cs = null; }
				try { rect = header.getBoundingClientRect(); } catch (err) { rect = null; }
			}
			var chat = null; var mail = null;
			try { chat = document.querySelector('.universal-chat-launcher'); } catch (err) { chat = null; }
			try { mail = document.querySelector('.g-mail-portal'); } catch (err) { mail = null; }
			var snap = {
				y: Math.round(window.scrollY || 0),
				h: (header && cs && rect) ? {
					pos: cs.position, top: Math.round(rect.top), h: Math.round(rect.height),
					z: cs.zIndex, o: cs.opacity, d: cs.display
				} : null,
				c: navDiagAtPoint(chat),
				m: navDiagAtPoint(mail),
				k: clicks,
				ev: diagEvents.slice(),
				mut: diagMutations.slice(),
				sc: diagScrolls.slice(),
				anc: navDiagAncestors(header),
				pt: diagPointer.slice()
			};
			var json = JSON.stringify(snap);
			var el = document.getElementById('awtsmoos-nav-diag');
			if (el) el.textContent = json;
			try { document.documentElement.setAttribute('data-nav-diag', json); } catch (err) {}
		} catch (err) { /* diagnostic only; never touches the shell */ }
	}

	function navDiagAtPoint(node) {
		if (!node) return null;
		try {
			var b = node.getBoundingClientRect();
			var cx = b.left + b.width / 2; var cy = b.top + b.height / 2;
			var hit = document.elementFromPoint(cx, cy);
			var hitName = null;
			if (hit) {
				hitName = (hit.tagName || '').toLowerCase();
				var cls = String(hit.className || '').split(' ')[0];
				if (cls) hitName += '.' + cls;
			}
			return {
				cx: Math.round(cx), cy: Math.round(cy),
				hit: hitName, self: hit === node || (node.contains ? node.contains(hit) : false)
			};
		} catch (err) { return null; }
	}

	/* B"H social fix 20 (defect 1): the Fix 19 check proved the click
	 * reaches the document (total increments) but its target is <html>
	 * (chat/mail stay 0, last "html@0"), scrollY resets to 0, and after
	 * a click the header stops staying fixed (top -2608 at y 2619) —
	 * and four static investigations found NO code that does any of
	 * that. The snapshot alone cannot distinguish the three live
	 * possibilities (a real pointer click retargeted mid-click, a
	 * synthetic click dispatched on <html>, the button detached
	 * between mousedown and mouseup), so the diagnostic now also
	 * records the full pointer-event sequence, focus moves, scroll
	 * positions with timestamps, and every class/style/hidden/inert
	 * change on html/body/.g-shell/header. Still read-only: no
	 * preventDefault, no stopPropagation, no DOM writes except the
	 * diag div + data attribute; every step try/catch-guarded.
	 * Buffers are rings (ev 12, mut 8, sc 8) so the JSON stays short
	 * enough to read from the page text. */
	var DIAG_EV_MAX = 12;
	var DIAG_MUT_MAX = 8;
	var DIAG_SC_MAX = 8;
	var diagEvents = [];
	var diagMutations = [];
	var diagScrolls = [];
	var diagT0 = 0;
	try { diagT0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0; } catch (err) { diagT0 = 0; }

	function navDiagMs() {
		try {
			if (typeof performance !== 'undefined' && performance.now) return Math.round(performance.now() - diagT0);
		} catch (err) {}
		return 0;
	}

	function navDiagDescribeTarget(t) {
		if (!t) return '?';
		try {
			if (t === document) return 'document';
			if (t === window) return 'window';
			if (t.closest) {
				if (t.closest('.universal-chat-launcher')) return 'chat';
				if (t.closest('.g-mail-portal')) return 'mail';
			}
			var tag = (t.tagName || '?').toLowerCase();
			var cls = String(t.className || '').split(' ')[0];
			if (cls) return tag + '.' + cls;
			return tag;
		} catch (err) { return '?'; }
	}

	function navDiagPush(list, item, max) {
		try {
			list.push(item);
			while (list.length > max) list.shift();
		} catch (err) {}
	}

	/* One pointer/focus event: [ms, kind, target, scrollY, chatConnected, mailConnected].
	 * kind: pd pointerdown, md mousedown, mu mouseup, pu pointerup, ck click,
	 * fi focusin, fo focus. Connected: 1 still in the document, 0 detached,
	 * -1 not found — a 0 at mousedown/mouseup would prove the button was
	 * detached mid-click (the classic click-retarget-to-<html> cause). */
	function navDiagRecordEvent(kind, ev) {
		try {
			var chat = null; var mail = null;
			try { chat = document.querySelector('.universal-chat-launcher'); } catch (err) { chat = null; }
			try { mail = document.querySelector('.g-mail-portal'); } catch (err) { mail = null; }
			var chatConn = chat ? (document.contains ? (document.contains(chat) ? 1 : 0) : 1) : -1;
			var mailConn = mail ? (document.contains ? (document.contains(mail) ? 1 : 0) : 1) : -1;
			navDiagPush(diagEvents, [
				navDiagMs(), kind, navDiagDescribeTarget(ev ? ev.target : null),
				Math.round(window.scrollY || 0), chatConn, mailConn
			], DIAG_EV_MAX);
		} catch (err) {}
	}

	/* One DOM mutation on html/body/.g-shell/header: [ms, type, target, detail].
	 * type: 'at' attribute (class/style/hidden/inert only — data-nav-diag is
	 * excluded from the filter so the diagnostic's own writes never
	 * self-trigger), 'cl' childList add/remove. The diag div itself is
	 * filtered out; its textContent writes are characterData, unobserved. */
	function navDiagRecordMutation(m) {
		try {
			var detail = '';
			if (m.type === 'attributes') {
				var name = m.attributeName || '';
				if (name === 'class') detail = 'class:' + String(m.target.className || '').slice(0, 60);
				else if (name === 'style') detail = 'style:' + String(m.target.getAttribute ? (m.target.getAttribute('style') || '') : '').slice(0, 60);
				else detail = name + ':' + String(m.target.getAttribute ? (m.target.getAttribute(name) || '') : '').slice(0, 40);
			} else if (m.type === 'childList') {
				var names = [];
				var nodes = [];
				try { nodes = Array.prototype.slice.call(m.addedNodes || []); } catch (err) { nodes = []; }
				for (var i = 0; i < nodes.length && names.length < 3; i++) {
					var n = nodes[i];
					if (n && n.id === 'awtsmoos-nav-diag') continue;
					names.push('+' + navDiagDescribeTarget(n));
				}
				try { nodes = Array.prototype.slice.call(m.removedNodes || []); } catch (err) { nodes = []; }
				for (var j = 0; j < nodes.length && names.length < 3; j++) {
					var n2 = nodes[j];
					if (n2 && n2.id === 'awtsmoos-nav-diag') continue;
					names.push('-' + navDiagDescribeTarget(n2));
				}
				if (!names.length) return;
				detail = names.join(',');
			} else { return; }
			navDiagPush(diagMutations, [navDiagMs(), m.type === 'attributes' ? 'at' : 'cl', navDiagDescribeTarget(m.target), detail], DIAG_MUT_MAX);
		} catch (err) {}
	}

	/* B"H social fix 21 (defects 1, 2): the Fix 20 check proved the click
	 * retargets BETWEEN pointerdown and pointerup — pd/md/focus target
	 * 'chat'/'mail' (connected), then pu/mu/ck target
	 * 'html.geelooy-route-ready' — and the header's rect top is exactly
	 * 11 - scrollY (it scrolls with the page although computed position
	 * reads "fixed"). Six static investigations found NO code that does
	 * either (no containing-block property on any header ancestor in the
	 * served CSS chain; no re-render trigger in the served JS). The
	 * snapshot alone cannot name the ancestor that makes the fixed header
	 * scroll, nor prove whether the button moved, was replaced, or was
	 * covered mid-click, so the diagnostic now also records (a) an
	 * ancestor walk — every header ancestor's computed containing-block
	 * properties plus its rect top; (b) pointer forensics — coordinates,
	 * the buttons' rects, whether the button is the SAME object as at
	 * install, and elementFromPoint at the pointerup coordinates; (c) a
	 * header-subtree childList observer that only fires when the launcher
	 * or mail portal is added/removed. Still read-only: no
	 * preventDefault, no stopPropagation, no DOM writes except the diag
	 * div + data attribute; every step try/catch-guarded. Buffers are
	 * rings (pt 6) so the JSON stays short enough to read from the page
	 * text. */
	var DIAG_PT_MAX = 6;
	var diagPointer = [];
	var diagChatEl = null;
	var diagMailEl = null;

	/* One ancestor walk: [tag.class, rectTop, {non-default computed props}].
	 * A fixed header scrolls with the page only when an ancestor creates a
	 * containing block (transform/filter/backdrop-filter/will-change/
	 * contain/perspective/clip-path/content-visibility). The walk names the
	 * exact ancestor and property; rectTop shows which ancestors scroll
	 * with the page (rectTop ~ 11 - scrollY) and which stay put. */
	function navDiagAncestors(header) {
		var out = [];
		try {
			var el = header;
			var guard = 0;
			while (el && el.nodeType === 1 && guard < 8) {
				guard++;
				var props = {};
				try {
					var cs = window.getComputedStyle(el);
					if (cs) {
						if (cs.transform && cs.transform !== 'none') props.tr = String(cs.transform).slice(0, 40);
						if (cs.filter && cs.filter !== 'none') props.fl = String(cs.filter).slice(0, 40);
						var bf = null;
						try { bf = cs.getPropertyValue('backdrop-filter'); } catch (err) { bf = null; }
						if (bf && bf !== 'none') props.bf = String(bf).slice(0, 40);
						if (cs.willChange && cs.willChange !== 'auto') props.wc = String(cs.willChange).slice(0, 40);
						if (cs.contain && cs.contain !== 'none') props.cn = String(cs.contain).slice(0, 40);
						if (cs.perspective && cs.perspective !== 'none') props.pe = String(cs.perspective).slice(0, 40);
						var cp = null;
						try { cp = cs.getPropertyValue('clip-path'); } catch (err) { cp = null; }
						if (cp && cp !== 'none') props.cp = String(cp).slice(0, 40);
						var cv = null;
						try { cv = cs.getPropertyValue('content-visibility'); } catch (err) { cv = null; }
						if (cv && cv !== 'visible') props.cv = String(cv).slice(0, 40);
						if (cs.position && cs.position !== 'static') props.pos = cs.position;
						if (cs.overflow && cs.overflow !== 'visible') props.ov = String(cs.overflow).slice(0, 20);
					}
				} catch (err) {}
				var top = null;
				try { top = Math.round(el.getBoundingClientRect().top); } catch (err) { top = null; }
				out.push([navDiagDescribeTarget(el), top, props]);
				if (el === document.documentElement) break;
				el = el.parentElement;
			}
		} catch (err) {}
		return out;
	}

	/* One pointer/mouse event with forensics: [ms, kind, target, cx, cy,
	 * chatRect, mailRect, chatSame, mailSame, hitAt].
	 * cx/cy: pointer coordinates (-1 when absent). chatRect/mailRect:
	 * [left, top, width, height] or null. chatSame/mailSame: 1 the button
	 * is the SAME object as at install, 0 a different object (re-rendered),
	 * -1 not found. hitAt (pu/mu/ck only): elementFromPoint at the pointer
	 * coordinates — if it returns the button while the event target is
	 * html, the event was dispatched with a different target; if it
	 * returns html too, the button is genuinely not under the pointer. */
	function navDiagRecordPointer(kind, ev) {
		try {
			if (kind !== 'pd' && kind !== 'md' && kind !== 'mu' && kind !== 'pu' && kind !== 'ck') return;
			var cx = -1; var cy = -1;
			try {
				if (ev && typeof ev.clientX === 'number') cx = Math.round(ev.clientX);
				if (ev && typeof ev.clientY === 'number') cy = Math.round(ev.clientY);
			} catch (err) {}
			var chat = null; var mail = null;
			try { chat = document.querySelector('.universal-chat-launcher'); } catch (err) { chat = null; }
			try { mail = document.querySelector('.g-mail-portal'); } catch (err) { mail = null; }
			if (!diagChatEl && chat) diagChatEl = chat;
			if (!diagMailEl && mail) diagMailEl = mail;
			var chatRect = null; var mailRect = null;
			try {
				if (chat) { var b = chat.getBoundingClientRect(); chatRect = [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }
			} catch (err) {}
			try {
				if (mail) { var b2 = mail.getBoundingClientRect(); mailRect = [Math.round(b2.left), Math.round(b2.top), Math.round(b2.width), Math.round(b2.height)]; }
			} catch (err) {}
			var chatSame = chat ? (chat === diagChatEl ? 1 : 0) : -1;
			var mailSame = mail ? (mail === diagMailEl ? 1 : 0) : -1;
			var hitAt = '';
			if ((kind === 'pu' || kind === 'mu' || kind === 'ck') && cx >= 0 && cy >= 0) {
				try {
					var hit = document.elementFromPoint(cx, cy);
					hitAt = navDiagDescribeTarget(hit);
				} catch (err) { hitAt = '?'; }
			}
			navDiagPush(diagPointer, [navDiagMs(), kind, navDiagDescribeTarget(ev ? ev.target : null), cx, cy, chatRect, mailRect, chatSame, mailSame, hitAt], DIAG_PT_MAX);
		} catch (err) {}
	}

	function installNavDiag(shell) {
		try {
			if (navDiagInstalled) return;
			navDiagInstalled = true;
			var el = document.getElementById('awtsmoos-nav-diag');
			if (!el) {
				el = document.createElement('div');
				el.id = 'awtsmoos-nav-diag';
				el.setAttribute('aria-hidden', 'true');
				el.style.position = 'absolute';
				el.style.left = '-9999px';
				el.style.top = '0';
				el.style.width = '1px';
				el.style.height = '1px';
				el.style.overflow = 'hidden';
				el.style.clip = 'rect(0 0 0 0)';
				el.style.whiteSpace = 'nowrap';
				(document.body || document.documentElement).appendChild(el);
			}
			var clicks = { total: 0, chat: 0, mail: 0, last: '' };
			document.addEventListener('click', function (ev) {
				try {
					navDiagRecordEvent('ck', ev);
					navDiagRecordPointer('ck', ev);
					clicks.total++;
					var t = ev.target; var label = '';
					if (t && t.closest) {
						if (t.closest('.universal-chat-launcher')) label = 'chat';
						else if (t.closest('.g-mail-portal')) label = 'mail';
						else label = (t.tagName || '').toLowerCase();
					}
					if (label === 'chat') clicks.chat++;
					if (label === 'mail') clicks.mail++;
					clicks.last = label + '@' + Math.round(window.scrollY || 0);
					snapshotNavDiag(shell, clicks);
				} catch (err) { /* diagnostic only */ }
			}, true);
			var pending = false;
			var lastDiagScrollY = -1;
			var schedule = function () {
				if (pending) return;
				pending = true;
				var afterFrame = function () {
					pending = false;
					var y = Math.round(window.scrollY || 0);
					if (y !== lastDiagScrollY) {
						lastDiagScrollY = y;
						navDiagPush(diagScrolls, [navDiagMs(), y], DIAG_SC_MAX);
					}
					snapshotNavDiag(shell, clicks);
				};
				if (typeof window.requestAnimationFrame === 'function') {
					window.requestAnimationFrame(afterFrame);
				} else {
					window.setTimeout(afterFrame, 50);
				}
			};
			window.addEventListener('scroll', schedule, { passive: true });
			window.addEventListener('resize', schedule, { passive: true });
			/* Pointer/focus sequence around every click, capture phase so
			 * the targets are seen even if a later handler stops the event.
			 * Read-only: these listeners never preventDefault or stop
			 * propagation. */
			var diagEventKinds = [
				['pointerdown', 'pd'], ['mousedown', 'md'], ['mouseup', 'mu'],
				['pointerup', 'pu'], ['focusin', 'fi'], ['focus', 'fo']
			];
			for (var ei = 0; ei < diagEventKinds.length; ei++) {
				(function (type, kind) {
					document.addEventListener(type, function (ev) {
						try { navDiagRecordEvent(kind, ev); navDiagRecordPointer(kind, ev); snapshotNavDiag(shell, clicks); } catch (err) {}
					}, true);
				})(diagEventKinds[ei][0], diagEventKinds[ei][1]);
			}
			/* Class/style/hidden/inert changes on the header's ancestors
			 * (a transform/filter/will-change on one of them is the only
			 * way a fixed header stops being viewport-fixed). Subtree is
			 * off on purpose: descendant changes (dropdown panels, ink)
			 * cannot affect the header's containing block and would flood
			 * the ring. */
			try {
				if (typeof MutationObserver === 'function') {
					var diagObserver = new MutationObserver(function (records) {
						try {
							for (var ri = 0; ri < records.length; ri++) navDiagRecordMutation(records[ri]);
							snapshotNavDiag(shell, clicks);
						} catch (err) {}
					});
					var diagAttrFilter = ['class', 'style', 'hidden', 'inert'];
					var diagTargets = [document.documentElement, document.body, shell];
					try {
						var diagHeader = shell.querySelector(':scope > header');
						if (diagHeader) diagTargets.push(diagHeader);
					} catch (err) {}
					for (var ti = 0; ti < diagTargets.length; ti++) {
						if (diagTargets[ti]) diagObserver.observe(diagTargets[ti], { attributes: true, attributeFilter: diagAttrFilter, childList: true, subtree: false });
					}
				}
			} catch (err) {}
			try { diagChatEl = document.querySelector('.universal-chat-launcher'); } catch (err) { diagChatEl = null; }
			try { diagMailEl = document.querySelector('.g-mail-portal'); } catch (err) { diagMailEl = null; }
			/* B"H social fix 21: the Fix 20 observer watches childList only
			 * on html/body/.g-shell/header with subtree off, so a re-render
			 * of the header's INNER content (launcher/mail replaced) is
			 * invisible to it. This second observer watches the header
			 * subtree, but only records when the launcher or mail portal
			 * (or a node containing one) is added or removed — the ink,
			 * dropdowns, and search suggestions are filtered out so the
			 * ring never floods. Type 'cs' (childList-subtree) distinguishes
			 * it from the direct-child 'cl'. */
			try {
				if (typeof MutationObserver === 'function') {
					var diagHeader2 = null;
					try { diagHeader2 = shell.querySelector(':scope > header'); } catch (err) { diagHeader2 = null; }
					if (diagHeader2) {
						var diagSubObserver = new MutationObserver(function (records) {
							try {
								for (var ri = 0; ri < records.length; ri++) {
									var rec = records[ri];
									if (rec.type !== 'childList') continue;
									var hit21 = false;
									var nodes21 = [];
									try { nodes21 = nodes21.concat(Array.prototype.slice.call(rec.addedNodes || [])); } catch (err) {}
									try { nodes21 = nodes21.concat(Array.prototype.slice.call(rec.removedNodes || [])); } catch (err) {}
									for (var ni = 0; ni < nodes21.length; ni++) {
										var n21 = nodes21[ni];
										if (!n21 || n21.nodeType !== 1) continue;
										try {
											if (n21.matches && (n21.matches('.universal-chat-launcher') || n21.matches('.g-mail-portal'))) { hit21 = true; break; }
											if (n21.querySelector && (n21.querySelector('.universal-chat-launcher') || n21.querySelector('.g-mail-portal'))) { hit21 = true; break; }
										} catch (err) {}
									}
									if (!hit21) continue;
									var names21 = [];
									for (var nj = 0; nj < nodes21.length && names21.length < 3; nj++) {
										var m21 = nodes21[nj];
										if (m21 && m21.id === 'awtsmoos-nav-diag') continue;
										names21.push(navDiagDescribeTarget(m21));
									}
									if (names21.length) navDiagPush(diagMutations, [navDiagMs(), 'cs', navDiagDescribeTarget(rec.target), names21.join(',')], DIAG_MUT_MAX);
								}
								snapshotNavDiag(shell, clicks);
							} catch (err) {}
						});
						diagSubObserver.observe(diagHeader2, { childList: true, subtree: true });
					}
				}
			} catch (err) {}
			navDiagPush(diagScrolls, [navDiagMs(), Math.round(window.scrollY || 0)], DIAG_SC_MAX);
			snapshotNavDiag(shell, clicks);
		} catch (err) { /* diagnostic only; never touches the shell */ }
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
		installNavDiag(shell);

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

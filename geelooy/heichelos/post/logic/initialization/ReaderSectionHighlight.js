//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Lightweight reading-line highlight for bilingual Torah.
 * The Awtsmoos joins Hebrew and English as one and never moves the page;
 * Awtsmoos.com grants native scrolling the full main-thread stage.
 */
import { findReaderPairAtViewport } from './ReaderPairViewport.js?v=reader-pair-viewport-20261112-1';
import { createReaderHighlightFrameGate } from './ReaderHighlightFrameGate.js?v=reader-smooth-20261028-1';

const LANGUAGE_SELECTOR = [
	'.meluket-phrase--he',
	'.meluket-phrase--en',
	'.awtsmoos-initial-unit-he',
	'.awtsmoos-initial-unit-en'
].join(', ');
const INTERACTIVE_SELECTOR = [
	'a', 'button', 'input', 'textarea', 'select', 'sup',
	'[contenteditable]', '[role="button"]', '[data-action]'
].join(', ');
let initialized = false;
let frameGate = null;
let selectedPair = null;
let selectedSection = null;
let selectedSubs = [];

/**
 * Toggle the reading classes; no text, dimensions, scroll or focus changes.
 * B"H 2026-11-10 — the CSS contract in meluket-law8.css expects
 * .is-reading on the section nearest the viewport middle and
 * .is-reading-sub on the active Hebrew/English phrases, but this module
 * only ever painted .is-pair-selected on the pair, so the section mark
 * the stylesheet defines never appeared. Paint all three now: the pair
 * keeps its existing selection class, its section gains .is-reading,
 * and the pair's Hebrew and English blocks gain .is-reading-sub.
 * B"H batch 55 — INLINE WASH + PADDING (the deliberate exception after
 * 6 failed cascade batches): the batch-54 check PROVED the class IS
 * applied (the gold edge shows) yet the 18% wash reads as "plain
 * cream" and the sheet padding does not reach the glyphs. The wash
 * (35% now) and the phrase padding are ALSO pinned inline on the
 * painted pair, so they show whatever sheet the browser holds. The
 * class + sheet rule stay (the law8 inset edge on .is-reading-sub is
 * a second marker). Inline paint is cleared from the old pair on
 * unpaint, same path as the class — so exactly one pair ever carries
 * it. Only the three inline properties this function sets are ever
 * cleared (backgroundColor / borderInlineStart / borderRadius on the
 * pair, paddingInline on the phrases); no other inline style is
 * touched. */
const INLINE_WASH_BG = 'rgb(212 169 78 / 0.35)';
const INLINE_WASH_EDGE = 'max(5px, 0.05em) solid #d4a94e';
const INLINE_PHRASE_PAD = 'max(14px, 0.28em)';
function clearInlinePaint(pair, subs) {
	try {
		if (pair && pair.style) {
			pair.style.backgroundColor = '';
			pair.style.borderInlineStart = '';
			pair.style.borderRadius = '';
		}
		for (const sub of subs || []) {
			if (sub && sub.style) sub.style.paddingInline = '';
		}
	} catch (_) {}
}
function setInlinePaint(pair, subs) {
	try {
		if (pair && pair.style) {
			pair.style.backgroundColor = INLINE_WASH_BG;
			pair.style.borderInlineStart = INLINE_WASH_EDGE;
			pair.style.borderRadius = '6px';
		}
		for (const sub of subs || []) {
			if (sub && sub.style) sub.style.paddingInline = INLINE_PHRASE_PAD;
		}
	} catch (_) {}
}
function paintReaderPair(pair) {
	if (selectedPair === pair) return pair;
	clearInlinePaint(selectedPair, selectedSubs);
	selectedPair?.classList.remove('is-pair-selected');
	for (const sub of selectedSubs) sub.classList.remove('is-reading-sub');
	selectedSubs = [];
	if (selectedSection) {
		selectedSection.classList.remove('is-reading');
		selectedSection = null;
	}
	selectedPair = pair;
	if (pair) {
		pair.classList.add('is-pair-selected');
		const section = pair.closest('.meluket-sefer-section, .awtsmoos-initial-unit, section[data-awtsmoos-unit]');
		if (section && section !== pair) {
			section.classList.add('is-reading');
			selectedSection = section;
		} else if (section === pair) {
			pair.classList.add('is-reading');
			selectedSection = pair;
		}
		const subs = typeof pair.querySelectorAll === 'function'
			? pair.querySelectorAll('.meluket-phrase--he, .meluket-phrase--en, .awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')
			: [];
		for (const sub of subs) {
			sub.classList.add('is-reading-sub');
			selectedSubs.push(sub);
		}
		if (!subs.length && typeof pair.matches === 'function' && pair.matches('.awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')) {
			pair.classList.add('is-reading-sub');
			selectedSubs.push(pair);
		}
		setInlinePaint(pair, selectedSubs);
	}
	/* B"H batch 54 — record that a pair is highlighted, so the page
	   (and any CSS fallback) can tell a highlight exists. Removed
	   when the selection is cleared; re-added on the next paint. */
	try {
		const root = document.getElementById('realPost');
		if (root) root.classList.toggle('has-pair-highlight', !!pair);
	} catch (_) {}
	return pair;
}

/** Selecting either language highlights the exact same bilingual parent. */
export function selectReaderPair(target, root) {
	if (!target?.closest || !root?.contains?.(target)) return null;
	if (target.closest(INTERACTIVE_SELECTOR)) return null;
	const language = target.closest(LANGUAGE_SELECTOR);
	if (!language || !root.contains(language)) return null;
	const pair = language.closest('.meluket-phrase-pair, .awtsmoos-initial-unit');
	return pair && root.contains(pair) ? paintReaderPair(pair) : null;
}

/** Preserve direct viewport tests and only repaint when pair identity changes. */
export function selectReaderPairAtViewport(viewport, root) {
	const pair = findReaderPairAtViewport(viewport, root);
	if (pair) paintReaderPair(pair);
	return pair;
}

/* B"H batch 51 — elementFromPoint is the ONLY finder, and it misses
   when the sefer has not mounted yet (the module samples before the
   pairs exist) or when the sampled point lands on a gap, a label, or
   an overlay. The check saw no gold edge at all at 144px (only a
   1-2px card-border line where a ~6px gold edge belongs), so the
   class was never reaching the pair. Fall back to a rect scan: the
   pair whose box contains the viewport's middle line, else the first
   pair intersecting the viewport. No hit-testing, no overlay can
   block it — plain geometry over the pairs already in the DOM. */
export function findReaderPairByRect(root) {
	if (!root || typeof root.querySelectorAll !== 'function') return null;
	const height = window.innerHeight || 0;
	if (!(height > 0)) return null;
	const middle = height * 0.45;
	let firstVisible = null;
	const pairs = root.querySelectorAll('.meluket-phrase-pair, .awtsmoos-initial-unit');
	for (const pair of pairs) {
		if (typeof pair.getBoundingClientRect !== 'function') continue;
		const rect = pair.getBoundingClientRect();
		if (!rect || rect.height <= 0) continue;
		if (rect.bottom < 0 || rect.top > height) continue;
		if (!firstVisible) firstVisible = pair;
		if (rect.top <= middle && rect.bottom >= middle) return pair;
	}
	return firstVisible;
}

/** Do nothing while an overlay covers the book or text is being selected. */
function shouldPauseHighlight() {
	if (document.hidden) return true;
	const info = document.getElementById('readerInfoPanel');
	if (info && !info.hidden) return true;
	const settings = document.getElementById('typographyDetails');
	if (settings && !settings.classList.contains('hidden-details')) return true;
	return Boolean(window.getSelection?.()?.toString().trim());
}

/** One sampled viewport lookup at most each 48ms; no article-wide scans. */
function updateReaderHighlight() {
	if (shouldPauseHighlight()) return;
	const root = document.getElementById('realPost');
	if (!root) return;
	if (selectedPair && !root.contains(selectedPair)) paintReaderPair(null);
	const pair = selectReaderPairAtViewport({
		width: window.innerWidth,
		height: window.innerHeight,
		elementFromPoint: document.elementFromPoint.bind(document)
	}, root);
	/* B"H batch 51 — if the hit-test found nothing (sefer mounting,
	   a gap, a label, an overlay), fall back to the rect scan so the
	   current pair is still marked. The fallback only runs when the
	   hit-test misses, so the fast path is untouched. */
	if (!pair) {
		const byRect = findReaderPairByRect(root);
		if (byRect) paintReaderPair(byRect);
	}
}

/* B"H batch 54 — correctness guard, NOT a retry timer: if no pair in
   the DOM carries .is-pair-selected (the module never painted, or a
   re-mount dropped the class and the observer's 20s window lapsed),
   paint the rect pair now. This runs only on load and when the tab
   becomes visible — events, not a loop — so a highlight can never
   silently be absent on a settled page. The template's inline script
   already paints the first pair at parse time; this guard is the
   backstop for every later state. */
function ensureReaderHighlightPainted() {
	try {
		if (shouldPauseHighlight()) return;
		const root = document.getElementById('realPost');
		if (!root) return;
		if (root.querySelector('.meluket-phrase-pair.is-pair-selected, .awtsmoos-initial-unit.is-pair-selected')) return;
		paintCurrentPairNow();
	} catch (_) {}
}

/* B"H batch 54 — adopt the pair the template's inline script already
   painted (the first pair, or the ?section= opening pair): it carries
   .is-pair-selected before this module loads, so without adoption the
   module would paint a second pair and two would be highlighted. The
   adoption only tracks the already-painted pair; the next paint moves
   the class off it through the normal path. */
function adoptInlineHighlight() {
	try {
		const root = document.getElementById('realPost');
		if (!root || selectedPair) return;
		const painted = root.querySelector('.meluket-phrase-pair.is-pair-selected, .awtsmoos-initial-unit.is-pair-selected');
		if (!painted) return;
		selectedPair = painted;
		const section = painted.closest('.meluket-sefer-section, .awtsmoos-initial-unit, section[data-awtsmoos-unit]');
		if (section && section !== painted) selectedSection = section;
		else if (section === painted) selectedSection = painted;
		const subs = typeof painted.querySelectorAll === 'function'
			? painted.querySelectorAll('.meluket-phrase--he, .meluket-phrase--en, .awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')
			: [];
		for (const sub of subs) {
			if (sub.classList.contains('is-reading-sub')) selectedSubs.push(sub);
		}
		if (!subs.length && typeof painted.matches === 'function' && painted.matches('.awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')) {
			selectedSubs.push(painted);
		}
		/* B"H batch 55 — the adopted pair may carry the class but not
		   the inline wash (the template script sets both, but if its
		   inline-style lines ever failed, adoption must still give the
		   pair the inline paint, so the wash shows). setInlinePaint
		   is idempotent; the later unpaint clears it. */
		setInlinePaint(painted, selectedSubs);
	} catch (_) {}
}

/* B"H batch 53 — the class was never reaching the pair. The wash
   rule is the ONLY rule that can paint a selected pair and nothing
   overrides it (verified over the served bundle: the :not() rule
   touches only non-selected pairs), so if the class were applied the
   wash would show. The frame-gated sample runs once at init and the
   observer only fires on DOM mutations; if that one sample runs
   before the pairs are laid out, nothing repaints until a scroll.
   Paint SYNCHRONOUSLY via the rect fallback (plain geometry, no
   hit-test, no gate) and report whether a pair was marked, so the
   caller can retry until one is. */
function paintCurrentPairNow() {
	if (shouldPauseHighlight()) return false;
	const root = document.getElementById('realPost');
	if (!root) return false;
	const byRect = findReaderPairByRect(root);
	if (byRect) {
		paintReaderPair(byRect);
		return true;
	}
	return false;
}

/** One listener for nested scroll roots, with trailing paint after inertia. */
export function initSectionHighlight() {
	if (initialized || typeof document === 'undefined') return;
	initialized = true;
	frameGate = createReaderHighlightFrameGate(updateReaderHighlight);
	document.addEventListener('click', event => {
		const root = document.getElementById('realPost');
		if (!root || window.getSelection?.()?.toString().trim()) return;
		selectReaderPair(event.target, root);
	}, { passive: true });
	document.addEventListener('scroll', frameGate.queue, {
		capture: true,
		passive: true
	});
	window.addEventListener('resize', frameGate.queue, { passive: true });
	/* B"H batch 49 — the highlight pauses while the Reading guide is
	   open (shouldPauseHighlight), so after the dialog closes the pair
	   stays unmarked until the next scroll. The dialog's close path
	   dispatches awtsmoos:reader-highlight-resume; repaint now so the
	   current pair shows its highlight the moment the guide closes. */
	window.addEventListener('awtsmoos:reader-highlight-resume', () => {
		frameGate.queue();
	});
	/* B"H batch 51 — the sefer mounts AFTER this module initializes
	   (MeluketSeferReader awakens on a later tick), so the first
	   sample runs before any pair exists and, with no scroll after
	   mount, nothing ever repaints — the highlight never appears.
	   Watch #realPost for pairs arriving (mount / re-mount) and
	   re-queue then; the watch ends after 20s so it is not a
	   permanent observer. */
	if (typeof MutationObserver !== 'undefined') {
		try {
			const root = document.getElementById('realPost');
			if (root) {
				const mo = new MutationObserver(() => {
					try {
						if (root.querySelector('.meluket-phrase-pair, .awtsmoos-initial-unit')) frameGate.queue();
					} catch (_) {}
				});
				mo.observe(root, { childList: true, subtree: true });
				setTimeout(() => { try { mo.disconnect(); } catch (_) {} }, 20000);
			}
		} catch (_) {}
	}
	/* B"H batch 52 — the highlight pauses while the tab is hidden
	   (shouldPauseHighlight), and nothing re-queues when the tab
	   becomes visible again — so a load that happened in a background
	   tab, or a back/forward-cache restore, can leave the current
	   pair unmarked until the next scroll. Re-queue on
	   visibilitychange and on pageshow so the pair paints the moment
	   the reader returns. */
	document.addEventListener('visibilitychange', () => {
		try { if (!document.hidden) frameGate.queue(); } catch (_) {}
	});
	window.addEventListener('pageshow', () => {
		try { frameGate.queue(); } catch (_) {}
	});
	/* B"H batch 54 — adopt the inline-painted pair before the first
	   sample, and run the correctness guard on load + when the tab
	   becomes visible (the visibilitychange handler above only
	   re-queues the frame gate; the guard repaints if the class is
	   actually missing). */
	adoptInlineHighlight();
	if (document.readyState === 'complete') {
		ensureReaderHighlightPainted();
	} else {
		window.addEventListener('load', ensureReaderHighlightPainted, { once: true });
	}
	document.addEventListener('visibilitychange', () => {
		try { if (!document.hidden) ensureReaderHighlightPainted(); } catch (_) {}
	});
	frameGate.queue();
	/* B"H batch 53 — load-time guarantee (see paintCurrentPairNow):
	   paint the current pair SYNCHRONOUSLY on init, and if no pair
	   is laid out yet, retry every 500ms for up to 10s. Bounded and
	   self-stopping (clears on success or after 20 tries); the frame
	   gate + observer + listeners stay as the live path. This is the
	   only path that does not depend on a scroll, a mutation, or a
	   visibility change to mark the current pair. */
	try {
		if (!paintCurrentPairNow()) {
			let tries = 0;
			const retry = setInterval(() => {
				tries += 1;
				let done = false;
				try { done = paintCurrentPairNow(); } catch (_) {}
				if (done || tries >= 20) clearInterval(retry);
			}, 500);
		}
	} catch (_) {}
}

/** Clear old paint while preserving the original Torah nodes. */
export function clearReaderPairSelection() {
	paintReaderPair(null);
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSectionHighlight, { once: true });
	} else {
		initSectionHighlight();
	}
}

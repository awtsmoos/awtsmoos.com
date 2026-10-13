// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yaakov 2026-10-13: auto-highlight the section being read.
 *
 * Watches article sections AND sub-sections (the Hebrew/English pair divs
 * inside each unit) with an IntersectionObserver. The section nearest the
 * viewport middle gets .is-reading; the sub-section (he/en pair) nearest
 * the middle gets .is-reading-sub. Styled in meluket-law8.css.
 * Self-initializing, never throws, never breaks the reader.
 */

const SECTION_CLASS = 'is-reading';
const SUB_CLASS = 'is-reading-sub';
const SECTION_SELECTOR = '.awtsmoos-initial-unit, section[data-awtsmoos-unit], .meluket-sefer-section';
const SUB_SELECTOR = '.awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en, .meluket-phrase--he, .meluket-phrase--en';

let observer = null;
let initialized = false;

/** Clears reading highlights from all sections and sub-sections. */
function clearReading() {
	try {
		const marked = document.querySelectorAll('.' + SECTION_CLASS + ', .' + SUB_CLASS);
		for (const el of marked) el.classList.remove(SECTION_CLASS, SUB_CLASS);
	} catch (e) { /* never break */ }
}

/** True when the element is a sub-section (he/en pair), not a full section. */
function isSub(el) {
	try {
		return el.matches(SUB_SELECTOR);
	} catch (e) {
		return false;
	}
}

/** Starts observing article sections and sub-sections. */
export function initSectionHighlight() {
	if (initialized) return;
	initialized = true;
	try {
		if (!('IntersectionObserver' in window)) return;

		observer = new IntersectionObserver((entries) => {
			try {
				// Best section and best sub-section nearest the viewport middle.
				let bestSection = null;
				let bestSectionDist = Infinity;
				let bestSub = null;
				let bestSubDist = Infinity;
				const centerY = window.innerHeight / 2;
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const r = entry.boundingClientRect;
					const dist = Math.abs((r.top + r.bottom) / 2 - centerY);
					if (isSub(entry.target)) {
						if (dist < bestSubDist) {
							bestSubDist = dist;
							bestSub = entry.target;
						}
					} else if (dist < bestSectionDist) {
						bestSectionDist = dist;
						bestSection = entry.target;
					}
				}
				if (bestSection || bestSub) {
					clearReading();
					if (bestSection) bestSection.classList.add(SECTION_CLASS);
					if (bestSub) {
						bestSub.classList.add(SUB_CLASS);
						// Also light the parent section so the pair reads as one.
						const parent = bestSub.closest(SECTION_SELECTOR);
						if (parent) parent.classList.add(SECTION_CLASS);
					}
				}
			} catch (e) { /* never break */ }
		}, {
			// A section counts as "being read" while it crosses the middle band
			rootMargin: '-35% 0px -35% 0px',
			threshold: 0
		});

		const observeAll = () => {
			try {
				const els = document.querySelectorAll(SECTION_SELECTOR + ', ' + SUB_SELECTOR);
				for (const el of els) {
					if (!el.__awtsmoosHighlightObserved) {
						el.__awtsmoosHighlightObserved = true;
						observer.observe(el);
					}
				}
			} catch (e) { /* never break */ }
		};
		observeAll();
		// Re-scan when the sefer mounts late (JS reader replaces server HTML)
		setTimeout(observeAll, 1500);
		setTimeout(observeAll, 4000);
	} catch (e) { /* never break the reader */ }
}

// Self-init: run now or on DOM ready, whichever comes first.
try {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSectionHighlight, { once: true });
	} else {
		initSectionHighlight();
	}
} catch (e) { /* never break */ }

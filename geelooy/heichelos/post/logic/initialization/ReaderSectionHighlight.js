// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yaakov 2026-10-13: auto-highlight the section being read.
 *
 * Watches article sections with an IntersectionObserver and marks the one
 * in the middle of the viewport with .is-reading (styled in meluket-law8.css).
 * Self-initializing, never throws, never breaks the reader.
 */

const READING_CLASS = 'is-reading';
const SECTION_SELECTOR = '.awtsmoos-initial-unit, section[data-awtsmoos-unit], .meluket-sefer-section';

let observer = null;
let initialized = false;

/** Clears the reading highlight from all sections. */
function clearReading() {
	try {
		const marked = document.querySelectorAll('.' + READING_CLASS);
		for (const el of marked) el.classList.remove(READING_CLASS);
	} catch (e) { /* never break */ }
}

/** Starts observing article sections for the reading highlight. */
export function initSectionHighlight() {
	if (initialized) return;
	initialized = true;
	try {
		if (!('IntersectionObserver' in window)) return;
		const sections = document.querySelectorAll(SECTION_SELECTOR);
		if (!sections.length) return;

		observer = new IntersectionObserver((entries) => {
			try {
				// Pick the entry closest to viewport center among intersecting
				let best = null;
				let bestDist = Infinity;
				const centerY = window.innerHeight / 2;
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const r = entry.boundingClientRect;
					const dist = Math.abs((r.top + r.bottom) / 2 - centerY);
					if (dist < bestDist) {
						bestDist = dist;
						best = entry.target;
					}
				}
				if (best) {
					clearReading();
					best.classList.add(READING_CLASS);
				}
			} catch (e) { /* never break */ }
		}, {
			// A section counts as "being read" while it crosses the middle band
			rootMargin: '-35% 0px -35% 0px',
			threshold: 0
		});

		for (const s of sections) observer.observe(s);

		// Re-scan when the sefer mounts late (JS reader replaces server HTML)
		const recheck = () => {
			try {
				const fresh = document.querySelectorAll(SECTION_SELECTOR);
				for (const s of fresh) {
					if (!s.__awtsmoosHighlightObserved) {
						s.__awtsmoosHighlightObserved = true;
						observer.observe(s);
					}
				}
			} catch (e) { /* never break */ }
		};
		// Mark already-observed so recheck only picks up new ones
		for (const s of sections) s.__awtsmoosHighlightObserved = true;
		setTimeout(recheck, 1500);
		setTimeout(recheck, 4000);
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

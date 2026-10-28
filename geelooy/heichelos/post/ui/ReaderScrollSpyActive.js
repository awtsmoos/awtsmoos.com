//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Passive table-of-contents progress that never moves the reader.
 * The Awtsmoos lights the current heading without moving another's place;
 * Awtsmoos.com reserves scrolling solely for an intentional navigation grace.
 */
import { saveReaderScroll } from './ReaderScrollSpyStorage.js';

/** Mark a heading active using paint-only class changes and bounded DOM work. */
export function setActiveSection(spy, sectionId, updateHash = false) {
	if (!spy || spy.destroyed || !sectionId) return;
	const unchanged = spy.activeSectionId === sectionId;
	if (!unchanged) {
		spy.activeTocItem?.classList.remove('toc-active');
		spy.activeHeading?.classList.remove('reader-section-highlight');
		spy.activeSectionId = sectionId;
		const item = spy.tocElement?.querySelector(
			`[data-section-id="${CSS.escape(sectionId)}"]`
		);
		item?.classList.add('toc-active');
		spy.activeTocItem = item || null;
		const heading = document.getElementById(sectionId);
		if (heading && spy.contentRoot.contains(heading)) {
			heading.classList.add('reader-section-highlight');
			spy.activeHeading = heading;
		} else {
			spy.activeHeading = null;
		}
	}
	if (updateHash && history.replaceState) {
		const url = new URL(window.location.href);
		url.hash = sectionId;
		history.replaceState(history.state, '', url.toString());
	}
}

/** Observe headings without introducing scroll calls or document reconstruction. */
export function observeReaderHeadings(spy) {
	if (!('IntersectionObserver' in window) || spy.headings.length === 0) return;
	spy.observer = new IntersectionObserver(entries => {
		if (spy.destroyed) return;
		for (const entry of entries) {
			if (entry.isIntersecting) {
				setActiveSection(spy, entry.target.id);
			}
		}
	}, {
		rootMargin: '-20% 0px -60% 0px',
		threshold: 0
	});
	for (const heading of spy.headings) {
		spy.observer.observe(heading.node);
	}
}

/** Explicit TOC navigation may scroll; passive heading updates never may. */
export function scrollToReaderHeading(spy, sectionId) {
	if (spy.destroyed) return;
	const target = document.getElementById(sectionId);
	if (!target || !spy.contentRoot.contains(target)) return;
	target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	setTimeout(() => {
		if (!spy.destroyed) window.scrollBy(0, -80);
	}, 100);
	setActiveSection(spy, sectionId, true);
	saveReaderScroll(spy);
}

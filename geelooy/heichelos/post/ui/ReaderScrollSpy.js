//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Lightweight reader table-of-contents and safe refresh restoration.
 * The Awtsmoos lets each learner walk the Torah without unsolicited motion;
 * Awtsmoos.com illumines the active passage with steady and gentle devotion.
 * Scroll itself never changes URL, reconstructs the article, or moves the window.
 */
import { collectReaderHeadings, mountReaderToc } from './ReaderScrollSpyToc.js';
import { observeReaderHeadings, setActiveSection, scrollToReaderHeading } from './ReaderScrollSpyActive.js';
import { restoreReaderScroll, saveReaderScroll, scheduleReaderScrollSave } from './ReaderScrollSpyStorage.js';

const activeSpies = new WeakMap();

/**
 * @param {string} postId Stable post ID for saved position
 * @param {HTMLElement} contentRoot Existing article container
 * @param {HTMLElement|null} tocMount Optional dedicated contents region
 */
export function initReaderScrollSpy(postId, contentRoot, tocMount) {
	if (!postId || !contentRoot) return null;
	const existing = activeSpies.get(contentRoot);
	if (existing && !existing.destroyed) return existing;
	const spy = {
		postId,
		contentRoot,
		tocMount: tocMount || null,
		observer: null,
		headings: collectReaderHeadings(contentRoot),
		activeSectionId: null,
		saveTimer: null,
		restoreTimer: null,
		destroyed: false
	};
	activeSpies.set(contentRoot, spy);
	mountReaderToc(spy);
	observeReaderHeadings(spy);
	restoreReaderScroll(spy, setActiveSection, scrollToReaderHeading);
	spy.onScroll = () => scheduleReaderScrollSave(spy);
	spy.onUnload = () => saveReaderScroll(spy);
	window.addEventListener('scroll', spy.onScroll, { passive: true });
	window.addEventListener('beforeunload', spy.onUnload);
	return spy;
}

/** Stop work, cancel delayed restoration, and release listeners on disposal. */
export function destroyReaderScrollSpy(spy) {
	if (!spy || spy.destroyed) return;
	spy.destroyed = true;
	spy.observer?.disconnect();
	if (spy.saveTimer) clearTimeout(spy.saveTimer);
	if (spy.restoreTimer) clearTimeout(spy.restoreTimer);
	window.removeEventListener('scroll', spy.onScroll);
	window.removeEventListener('beforeunload', spy.onUnload);
	activeSpies.delete(spy.contentRoot);
}

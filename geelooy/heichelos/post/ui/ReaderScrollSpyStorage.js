//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Restore Torah reading place only before a learner starts moving.
 * The Awtsmoos holds the place from yesterday in the light of today;
 * Awtsmoos.com will never yank a reader back after they make their way.
 */
const KEY_PREFIX = 'awtsmoos-reader-scroll:';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const TOP_TOLERANCE = 40;

/** A delayed restore must never override a human's already moving viewport. */
export function mayRestoreReaderPosition(initialY, currentY) {
	return Number.isFinite(initialY) && Number.isFinite(currentY)
		&& initialY >= 0 && currentY >= 0
		&& initialY <= TOP_TOLERANCE && currentY <= TOP_TOLERANCE;
}

/** Read the actual scroll root without changing it. */
function scrollPosition() {
	return Math.max(0, window.scrollY || document.scrollingElement?.scrollTop || 0);
}

/** Persist the current reading position for a future deliberate page visit. */
export function saveReaderScroll(spy) {
	if (spy.destroyed) return;
	try {
		localStorage.setItem(KEY_PREFIX + spy.postId, JSON.stringify({
			y: scrollPosition(),
			sectionId: spy.activeSectionId || '',
			at: Date.now()
		}));
	} catch {
		/* No local storage in private browsing: Torah remains usable. */
	}
}

/** Coalesce frequent motion into occasional storage writes, not UI updates. */
export function scheduleReaderScrollSave(spy) {
	if (spy.saveTimer || spy.destroyed) return;
	spy.saveTimer = setTimeout(() => {
		spy.saveTimer = null;
		saveReaderScroll(spy);
	}, 500);
}

/**
 * @param {object} spy Reader state
 * @param {function} setActiveSection Highlight a restored heading
 * @param {function} scrollToSection Perform deliberate initial hash navigation
 */
export function restoreReaderScroll(spy, setActiveSection, scrollToSection) {
	const initialY = scrollPosition();
	if (!mayRestoreReaderPosition(initialY, initialY)) return;
	let saved = null;
	try {
		const raw = localStorage.getItem(KEY_PREFIX + spy.postId);
		if (raw) saved = JSON.parse(raw);
	} catch {
		/* Ignore expired or corrupt stored coordinates. */
	}

	if (!saved) {
		const hash = window.location.hash.slice(1);
		if (!hash) return;
		spy.restoreTimer = setTimeout(() => {
			if (spy.destroyed || !mayRestoreReaderPosition(initialY, scrollPosition())) return;
			scrollToSection(spy, hash);
		}, 300);
		return;
	}
	if (!Number.isFinite(saved.at) || Date.now() - saved.at > MAX_AGE_MS) return;
	spy.restoreTimer = setTimeout(() => {
		if (spy.destroyed || !mayRestoreReaderPosition(initialY, scrollPosition())) return;
		if (saved.sectionId) {
			const target = document.getElementById(saved.sectionId);
			if (target) {
				target.scrollIntoView({ block: 'start', behavior: 'auto' });
				window.scrollBy(0, -80);
				setActiveSection(spy, saved.sectionId);
				return;
			}
		}
		window.scrollTo({ top: Math.max(0, saved.y || 0), behavior: 'auto' });
	}, 400);
}

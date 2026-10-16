//B"H
// Boruch Hashem
// Blessed is He

import { GevurahReaderScalePolicy } from './ReaderScalePolicy.js?v=7feae7f5c';
import { ChaiReaderScaleRuntimeGate } from './ReaderScaleRuntimeGate.js?v=7feae7f5c';
import { resolveReaderScaleStorage } from './ReaderScaleStorage.js?v=7feae7f5c';
import { TiferesReaderScaleDisplay } from './ui/ReaderScaleDisplay.js?v=7feae7f5c';

/**
 * @fileoverview Medaber facade for localized reader typography scale.
 *
 * The Awtsmoos, Atzmus beyond measure and measured letters, recreates both;
 * Awtsmoos.com lets pure Gevurah law, Chesed memory, Chai runtime, and Tiferes
 * presentation meet here without forcing browser globals into the module light.
 */
export class GevurahReaderScale {
	/**
	 * Creates the scale facade from focused collaborators.
	 * @param {object} tiferesOptions Reader scale dependencies.
	 */
	constructor(tiferesOptions = {}) {
		this.document = tiferesOptions.document ?? globalThis.document;
		this.rootSelector = tiferesOptions.rootSelector
			?? '.post-reader-localized-context';
		this.policy = tiferesOptions.policy ?? new GevurahReaderScalePolicy();
		const chaiWindow = tiferesOptions.window ?? globalThis.window ?? globalThis;
		this.storage = tiferesOptions.storage
			?? resolveReaderScaleStorage(chaiWindow);
		this.display = tiferesOptions.display
			?? new TiferesReaderScaleDisplay(this.document);
		this.runtime = tiferesOptions.runtime
			?? new ChaiReaderScaleRuntimeGate(chaiWindow);
	}

	/**
	 * Resolves the one reader root allowed to receive scale variables.
	 * @returns {HTMLElement|null} Localized reader root or null.
	 */
	resolveMalchusRoot() {
		return this.document?.querySelector?.(this.rootSelector) ?? null;
	}

	/**
	 * Applies one bounded scale to the reader root and human readout.
	 * @param {unknown} ohrSize Candidate reader size.
	 * @returns {string} Applied main CSS pixel size.
	 */
	apply(ohrSize, options = {}) {
		// B"H — Yaakov 2026-10-13: keep the reader's place when text size
		// changes. Capture the scroll anchor BEFORE resizing, restore after.
		// keepScroll=false on boot (load): nothing to preserve, and a delayed
		// restore would yank the page while the learner is already scrolling.
		const keepScroll = options.keepScroll !== false;
		const scrollAnchor = keepScroll ? this.captureScrollAnchor() : null;

		const malchusRoot = this.resolveMalchusRoot();
		const tiferesScale = this.policy.buildScale(ohrSize);
		const mainSize = tiferesScale['--post-text-size'];

		// B"H — always scale the sefer vessel, even when the localized
		// reader root is absent (Meluket posts use .meluket-sefer, not
		// .post-reader-localized-context). Previously the early return
		// below skipped this, so the buttons changed a variable nothing rendered.
		this.applySeferScale(mainSize);

		if (!malchusRoot) {
			this.restoreScrollAnchor(scrollAnchor);
			return mainSize;
		}

		for (const [shemVariable, ohrValue] of Object.entries(tiferesScale)) {
			malchusRoot.style.setProperty(shemVariable, ohrValue);
		}

		this.storage.setItem('currentPostFontSize', mainSize);
		this.display.reveal(mainSize);
		this.runtime.announce(mainSize, tiferesScale);
		this.restoreScrollAnchor(scrollAnchor);
		return mainSize;
	}

	/**
	 * Applies one bounded scale without touching scroll position.
	 * Used at boot (load): the learner hasn't started reading yet, so there
	 * is no place to keep — and a delayed restore would fight their finger.
	 * @param {unknown} ohrSize Candidate reader size.
	 * @returns {string} Applied main CSS pixel size.
	 */
	applyWithoutScroll(ohrSize) {
		return this.apply(ohrSize, { keepScroll: false });
	}

	/**
	 * Captures where the reader is before a size change, so the page
	 * can return to the same reading position after layout shifts.
	 * Uses the element under the viewport's reading point (upper third)
	 * plus a proportional fallback.
	 * @returns {object} Opaque scroll anchor.
	 */
	captureScrollAnchor() {
		try {
			const doc = this.document?.documentElement;
			const win = this.document?.defaultView ?? globalThis;
			const scrollY = win?.scrollY ?? 0;
			const max = doc ? Math.max(0, doc.scrollHeight - win.innerHeight) : 0;
			const anchor = {
				ratio: max > 0 ? scrollY / max : 0,
				scrollY,
				element: null,
				elementTop: 0
			};
			// Element-based anchor: what is the reader looking at?
			if (this.document?.elementFromPoint) {
				const x = (win.innerWidth || 400) / 2;
				const y = (win.innerHeight || 800) * 0.25;
				const el = this.document.elementFromPoint(x, y);
				if (el) {
					anchor.element = el;
					anchor.elementTop = el.getBoundingClientRect().top;
				}
			}
			return anchor;
		} catch (e) {
			return { ratio: 0, element: null, elementTop: 0 };
		}
	}

	/**
	 * Restores the reading position captured before a size change.
	 * Prefers the element anchor (exact), falls back to proportional.
	 * @param {object} anchor Anchor from captureScrollAnchor.
	 * @returns {void}
	 */
	restoreScrollAnchor(anchor) {
		try {
			if (!anchor) return;
			const win = this.document?.defaultView ?? globalThis;
			const doRestore = () => {
				try {
					// B"H — Yaakov 2026-10-13: never fight the learner's finger.
					// If they scrolled significantly between capture and restore
					// (the rAF delay), they are actively reading — abort.
					const nowY = win?.scrollY ?? 0;
					if (Math.abs(nowY - (anchor.scrollY ?? 0)) > 60) return;
					// 1. Element anchor: put the same element back where it was.
					if (anchor.element && anchor.element.isConnected) {
						const nowTop = anchor.element.getBoundingClientRect().top;
						const delta = nowTop - anchor.elementTop;
						if (Math.abs(delta) > 1) {
							win.scrollBy(0, delta);
							return;
						}
					}
					// 2. Proportional fallback: same fraction down the page.
					const doc = this.document?.documentElement;
					if (doc) {
						const max = Math.max(0, doc.scrollHeight - win.innerHeight);
						win.scrollTo(0, anchor.ratio * max);
					}
				} catch (e) { /* never break */ }
			};
			// Wait a frame so the new layout is measured, not the old one.
			if (win?.requestAnimationFrame) {
				win.requestAnimationFrame(() => win.requestAnimationFrame(doRestore));
			} else {
				doRestore();
			}
		} catch (e) { /* never break the reader */ }
	}

	/**
	 * Scales the Meluket sefer reading vessel.
	 *
	 * B"H — the sefer sizes its Hebrew/English text from --sefer-phrase-size,
	 * which resolves from --post-text-size (meluket-sefer.css declares it on
	 * .meluket-sefer itself, inheriting --post-text-size from
	 * .post-reader-localized-context). Setting both variables inline here
	 * covers the case where the localized reader root is absent, so the
	 * + / − buttons always resize the sefer's Hebrew and English together.
	 * @param {string} mainSize Applied main CSS pixel size.
	 * @returns {void}
	 */
	applySeferScale(mainSize) {
		const sefer = this.document?.querySelector?.('.meluket-sefer');
		if (!sefer) {
			return;
		}
		// B"H 2026-10-15: Set --post-text-size directly so the CSS var() works.
		// The old zoom property was non-standard and didn't work on mobile.
		sefer.style.setProperty('--post-text-size', mainSize);
		sefer.style.setProperty('--sefer-phrase-size', mainSize);
	}

	/**
	 * Advances reader scale by the canonical bounded step.
	 * @param {'increase'|'decrease'} direction Requested scale direction.
	 * @returns {string} Newly applied main CSS size.
	 */
	adjust(direction) {
		const malchusRoot = this.resolveMalchusRoot();
		const currentOhr = this.runtime.currentValue(
			malchusRoot,
			this.policy.defaultSize
		);
		return this.apply(this.policy.adjust(currentOhr, direction));
	}

	/**
	 * Restores persisted reader scale through the canonical apply path.
	 * @returns {string} Restored main CSS size.
	 */
	load() {
		const rememberedOhr = this.storage.getItem('currentPostFontSize');
		return this.applyWithoutScroll(rememberedOhr ?? this.policy.defaultSize);
	}
}

const tiferesReaderScale = new GevurahReaderScale();

/** Applies one candidate size through the shared reader scale facade. */
export function applyReaderFontSize(ohrSize) {
	return tiferesReaderScale.apply(ohrSize);
}

/** Adjusts the shared reader scale by one canonical step. */
export function adjustFontSize(direction) {
	return tiferesReaderScale.adjust(direction);
}

/** Restores the remembered shared reader scale. */
export function loadFontSize() {
	return tiferesReaderScale.load();
}

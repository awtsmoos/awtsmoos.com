//B"H
// Boruch Hashem
// Blessed is He

import { GevurahReaderScalePolicy } from './ReaderScalePolicy.js';
import { ChaiReaderScaleRuntimeGate } from './ReaderScaleRuntimeGate.js';
import { resolveReaderScaleStorage } from './ReaderScaleStorage.js';
import { TiferesReaderScaleDisplay } from './ui/ReaderScaleDisplay.js';

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
	apply(ohrSize) {
		const malchusRoot = this.resolveMalchusRoot();
		const tiferesScale = this.policy.buildScale(ohrSize);
		const mainSize = tiferesScale['--post-text-size'];

		// B"H — always scale the sefer vessel, even when the localized
		// reader root is absent (Meluket posts use .meluket-sefer, not
		// .post-reader-localized-context). Previously the early return
		// below skipped this, so the buttons changed a variable nothing rendered.
		this.applySeferScale(mainSize);

		if (!malchusRoot) {
			return mainSize;
		}

		for (const [shemVariable, ohrValue] of Object.entries(tiferesScale)) {
			malchusRoot.style.setProperty(shemVariable, ohrValue);
		}

		this.storage.setItem('currentPostFontSize', mainSize);
		this.display.reveal(mainSize);
		this.runtime.announce(mainSize, tiferesScale);
		return mainSize;
	}

	/**
	 * Scales the Meluket sefer reading vessel proportionally.
	 *
	 * B"H — the enriched-post sefer sizes its Hebrew/English text with
	 * rem-based clamp() rules that never consume --post-text-size, so the
	 * + / − buttons changed a variable nothing rendered. A proportional zoom
	 * on the sefer container resizes its Hebrew and English together, live,
	 * without touching any stylesheet.
	 * @param {string} mainSize Applied main CSS pixel size.
	 * @returns {void}
	 */
	applySeferScale(mainSize) {
		const sefer = this.document?.querySelector?.('.meluket-sefer');
		if (!sefer) {
			return;
		}
		const factor = Number.parseFloat(mainSize) / this.policy.defaultSize;
		if (Number.isFinite(factor) && factor > 0) {
			sefer.style.zoom = String(Math.round(factor * 1000) / 1000);
		}
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
		return this.apply(rememberedOhr ?? this.policy.defaultSize);
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

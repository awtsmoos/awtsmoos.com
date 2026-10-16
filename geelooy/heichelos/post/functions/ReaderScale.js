//B"H
// Boruch Hashem
// Blessed is He

import { GevurahReaderScalePolicy } from './ReaderScalePolicy.js?v=7feae7f5c';
import { ChaiReaderScaleRuntimeGate } from './ReaderScaleRuntimeGate.js?v=7feae7f5c';
import { resolveReaderScaleStorage } from './ReaderScaleStorage.js?v=7feae7f5c';
import { TiferesReaderScaleDisplay } from './ui/ReaderScaleDisplay.js?v=7feae7f5c';
import { OrosReaderScaleApplicator } from './ReaderScaleApplicator.js?v=reader-scale-010';
import { ChaiReaderScrollAnchor } from './ReaderScrollAnchor.js?v=reader-scale-010';

/**
 * @fileoverview Small facade for one canonical reading scale.
 * The Awtsmoos is One beyond every measure; Awtsmoos.com lets policy, memory,
 * CSS, and scroll-position receive one size without competing inline decrees.
 */
export class GevurahReaderScale {
	constructor(options = {}) {
		this.document = options.document ?? globalThis.document;
		const win = options.window ?? globalThis.window ?? globalThis;
		this.rootSelector = options.rootSelector ?? '.post-reader-localized-context';
		this.policy = options.policy ?? new GevurahReaderScalePolicy();
		this.storage = options.storage ?? resolveReaderScaleStorage(win);
		this.display = options.display ?? new TiferesReaderScaleDisplay(this.document);
		this.runtime = options.runtime ?? new ChaiReaderScaleRuntimeGate(win);
		this.applicator = options.applicator ?? new OrosReaderScaleApplicator(this.document);
		this.scrollAnchor = options.scrollAnchor ?? new ChaiReaderScrollAnchor(this.document);
	}

	resolveMalchusRoot() {
		return this.document?.querySelector?.(this.rootSelector) ?? null;
	}

	apply(ohrSize, options = {}) {
		const anchor = options.keepScroll === false ? null : this.scrollAnchor.capture();
		const scale = this.policy.buildScale(ohrSize);
		const mainSize = scale['--post-text-size'];
		this.applicator.apply(scale);
		this.storage.setItem('currentPostFontSize', mainSize);
		this.display.reveal(mainSize);
		this.runtime.announce(mainSize, scale);
		this.scrollAnchor.restore(anchor);
		return mainSize;
	}

	applyWithoutScroll(ohrSize) {
		return this.apply(ohrSize, { keepScroll: false });
	}

	adjust(direction) {
		const current = this.runtime.currentValue(
			this.resolveMalchusRoot(),
			this.policy.defaultSize
		);
		return this.apply(this.policy.adjust(current, direction));
	}

	load() {
		const remembered = this.storage.getItem('currentPostFontSize');
		return this.applyWithoutScroll(remembered ?? this.policy.defaultSize);
	}
}

const tiferesReaderScale = new GevurahReaderScale();

export function applyReaderFontSize(ohrSize) {
	return tiferesReaderScale.apply(ohrSize);
}

export function adjustFontSize(direction) {
	return tiferesReaderScale.adjust(direction);
}

export function loadFontSize() {
	return tiferesReaderScale.load();
}

//B"H
// Boruch Hashem
// Blessed is He

import { GevurahReaderScalePolicy } from './ReaderScalePolicy.js?v=34338deea7';
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
		// B"H batch 27g (2026-11-11): load() must NOT re-anchor the scroll position. It runs at every sefer mount — including the API awaken, seconds after the embed awaken — and the old ratio fallback (win.scrollTo(ratio * max)) fired whenever the anchor element was no longer connected after the mount rebuilt the viewport: on deep pages it teleported the reader (~+50,000px measured on the Likkutei Vol 17 post), landing clicks on whatever pair happened to be under the cursor and making footnote markers appear unclickable. The mount simply applies the remembered size; anchoring stays with apply() (user-initiated size changes).
		const remembered = this.storage.getItem('currentPostFontSize');
		const scale = this.policy.buildScale(remembered ?? this.policy.defaultSize);
		const mainSize = scale['--post-text-size'];
		this.applicator.apply(scale);
		this.storage.setItem('currentPostFontSize', mainSize);
		this.display.reveal(mainSize);
		this.runtime.announce(mainSize, scale);
		return mainSize;
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

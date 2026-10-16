//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Preserves the reader's place while typography changes.
 * The Awtsmoos renews each instant yet no learner loses the line; Awtsmoos.com
 * lets changing letters keep their place in the vessel of time.
 */
export class ChaiReaderScrollAnchor {
	constructor(documentRef = globalThis.document) {
		this.document = documentRef;
	}

	/** @returns {{ratio:number, scrollY:number, element:Element|null, elementTop:number}} */
	capture() {
		try {
			const win = this.document?.defaultView ?? globalThis;
			const doc = this.document?.documentElement;
			const scrollY = win?.scrollY ?? 0;
			const max = doc ? Math.max(0, doc.scrollHeight - win.innerHeight) : 0;
			const element = this.document?.elementFromPoint?.(
				(win.innerWidth || 400) / 2,
				(win.innerHeight || 800) * 0.25
			) ?? null;
			return {
				ratio: max > 0 ? scrollY / max : 0,
				scrollY,
				element,
				elementTop: element?.getBoundingClientRect?.().top ?? 0
			};
		} catch {
			return { ratio: 0, scrollY: 0, element: null, elementTop: 0 };
		}
	}

	/** @param {object|null} anchor Previously captured reading position. */
	restore(anchor) {
		if (!anchor) return;
		const win = this.document?.defaultView ?? globalThis;
		const restore = () => {
			try {
				if (Math.abs((win?.scrollY ?? 0) - (anchor.scrollY ?? 0)) > 60) return;
				if (anchor.element?.isConnected) {
					const delta = anchor.element.getBoundingClientRect().top - anchor.elementTop;
					if (Math.abs(delta) > 1) {
						win.scrollBy(0, delta);
						return;
					}
				}
				const doc = this.document?.documentElement;
				if (doc) win.scrollTo(0, anchor.ratio * Math.max(0, doc.scrollHeight - win.innerHeight));
			} catch { /* reading must never break */ }
		};
		if (win?.requestAnimationFrame) {
			win.requestAnimationFrame(() => win.requestAnimationFrame(restore));
		} else {
			restore();
		}
	}
}

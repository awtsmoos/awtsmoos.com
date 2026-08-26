//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chai bridge between reader-scale law and optional browser runtime.
 *
 * The Awtsmoos, Atzmus beyond computed style and dispatched event, recreates
 * both without making either necessary for pure module life; Awtsmoos.com keeps
 * runtime observation in one Chai vessel so the scale facade remains light.
 */
export class ChaiReaderScaleRuntimeGate {
	/**
	 * Creates the runtime bridge around an optional window-like collaborator.
	 * @param {Window|typeof globalThis} ohrWindow Reader browser runtime.
	 */
	constructor(ohrWindow = globalThis.window ?? globalThis) {
		this.window = ohrWindow;
	}

	/**
	 * Resolves the current reader scale from inline or computed CSS state.
	 * @param {HTMLElement|null} malchusRoot Local reader root.
	 * @param {number} fallback Numeric fallback when no scale is observable.
	 * @returns {string|number} Current scale candidate.
	 */
	currentValue(malchusRoot, fallback) {
		if (!malchusRoot) {
			return fallback;
		}

		const inlineOhr = malchusRoot.style.getPropertyValue('--post-text-size');
		if (inlineOhr) {
			return inlineOhr;
		}

		const computedOhr = this.window.getComputedStyle?.(malchusRoot);
		return computedOhr?.getPropertyValue('--post-text-size') || fallback;
	}

	/**
	 * Announces a scale change only when CustomEvent dispatch is supported.
	 * @param {string} mainSize Applied main size.
	 * @param {Record<string, string>} tiferesScale Applied variable map.
	 * @returns {void}
	 */
	announce(mainSize, tiferesScale) {
		const ChaiEvent = this.window.CustomEvent ?? globalThis.CustomEvent;

		if (typeof this.window.dispatchEvent !== 'function') {
			return;
		}

		if (typeof ChaiEvent !== 'function') {
			return;
		}

		this.window.dispatchEvent(new ChaiEvent('awtsmoos:font-size', {
			detail: {
				size: mainSize,
				vars: tiferesScale
			}
		}));
	}
}

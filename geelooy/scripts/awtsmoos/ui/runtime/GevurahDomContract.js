// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahDomContract.js
 * @description
 * The Awtsmoos needs no boundary, yet every finite Awtsmoos.com route needs one
 * honest gate between expected markup and runtime behavior. Gevurah here means
 * constraint: required nodes fail clearly, optional nodes remain peacefully absent,
 * and collections become frozen snapshots instead of mutable live shadows.
 */

/**
 * Provides a small, route-agnostic contract for DOM discovery.
 *
 * @class GevurahDomContract
 * @description
 * This class validates only query capability. It never mutates DOM, performs I/O,
 * logs warnings, or knows route-specific selectors. The supplied root remains the
 * sole search boundary for every lookup performed through this instance.
 */
export class GevurahDomContract {
	/**
	 * Creates a bounded DOM discovery contract.
	 *
	 * @param {ParentNode} gevurahRoot Query-capable root such as Document or Element.
	 * @param {string} [contextLabel="Awtsmoos UI"] Human-readable error context.
	 * @throws {TypeError} When the root cannot perform selector queries.
	 */
	constructor(gevurahRoot, contextLabel = "Awtsmoos UI") {
		if (!gevurahRoot || typeof gevurahRoot.querySelector !== "function" || typeof gevurahRoot.querySelectorAll !== "function") {
			throw new TypeError(`${contextLabel} requires a query-capable DOM root.`);
		}

		this.gevurahRoot = gevurahRoot;
		this.contextLabel = String(contextLabel || "Awtsmoos UI");
	}

	/**
	 * Reveals one required node or rejects the broken markup contract immediately.
	 *
	 * @param {string} gevurahSelector CSS selector scoped to this contract root.
	 * @param {string} [semanticName=gevurahSelector] Meaningful node name for errors.
	 * @returns {Element} The required finite DOM vessel.
	 * @throws {Error} When no matching element exists.
	 */
	require(gevurahSelector, semanticName = gevurahSelector) {
		const malchusNode = this.gevurahRoot.querySelector(gevurahSelector);
		if (!malchusNode) {
			throw new Error(`${this.contextLabel} is missing ${semanticName} (${gevurahSelector}).`);
		}
		return malchusNode;
	}

	/**
	 * Reveals one progressive-enhancement node without treating absence as failure.
	 *
	 * @param {string} gevurahSelector CSS selector scoped to this contract root.
	 * @returns {Element|null} Matching node, or null when the surface is intentionally absent.
	 */
	optional(gevurahSelector) {
		return this.gevurahRoot.querySelector(gevurahSelector);
	}

	/**
	 * Captures a stable immutable array of every matching node at call time.
	 *
	 * @param {string} gevurahSelector CSS selector scoped to this contract root.
	 * @returns {ReadonlyArray<Element>} Frozen snapshot; never a live NodeList.
	 */
	all(gevurahSelector) {
		return Object.freeze(Array.from(this.gevurahRoot.querySelectorAll(gevurahSelector)));
	}
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomText
 * @description
 * The Awtsmoos gives names and visible words to vessels without confusing the name
 * for the Essence. Awtsmoos.com uses this Binah layer to refine class seeds, ref names,
 * and host-visible text into explicit testimony. Nothing here touches the DOM; letters
 * are measured first, so when Malchus appears the form is already lucid and true.
 */

import { gevurahCreateHostDomError } from "./hostDomSchema.js";

/**
 * Expands compact class declarations into unique, non-empty class-name tokens.
 *
 * @param {string|string[]|undefined|null} chochmahClassSeed
 * 	One class string, many class strings, or no class declaration at all.
 * @returns {string[]}
 * 	Unique class tokens preserving declaration order.
 * @throws {Error}
 * 	When any provided class fragment is not textual.
 * @sideEffects None. No DOM state is read or changed.
 */
export function binahNormalizeClassNames(chochmahClassSeed) {
	const binahClassFragments = chochmahClassSeed == null ? [] : [].concat(chochmahClassSeed);
	const tiferesClassNames = [];
	for (const hodClassFragment of binahClassFragments) {
		if (typeof hodClassFragment !== "string") {
			throw gevurahCreateHostDomError("HOST_DOM_CLASS_INVALID");
		}
		for (const netzachClassName of hodClassFragment.split(/\s+/).filter(Boolean)) {
			if (!tiferesClassNames.includes(netzachClassName)) {
				tiferesClassNames.push(netzachClassName);
			}
		}
	}
	return tiferesClassNames;
}

/**
 * Validates an optional named ref used to collect rendered host nodes.
 *
 * The ref grammar is deliberately narrower than arbitrary property names because refs
 * form a host API. Their stability becomes Yesod for component behavior after rendering.
 *
 * @param {unknown} yesodRefSeed
 * 	Candidate ref identifier declared by a host UI specification.
 * @returns {string|null}
 * 	A normalized ref name or null when the spec requests no named ref.
 * @throws {Error}
 * 	When the ref is not a simple identifier beginning with a letter.
 * @sideEffects None.
 */
export function gevurahNormalizeOptionalRef(yesodRefSeed) {
	if (yesodRefSeed == null) return null;
	if (typeof yesodRefSeed !== "string" || !/^[A-Za-z][A-Za-z0-9_]*$/.test(yesodRefSeed)) {
		throw gevurahCreateHostDomError("HOST_DOM_REF_INVALID", yesodRefSeed);
	}
	return yesodRefSeed;
}

/**
 * Converts optional declarative text into host-visible string testimony.
 *
 * @param {unknown} hodTextSeed
 * 	Candidate text from the declarative host UI tree.
 * @returns {string|null}
 * 	String testimony or null when the node declares no text.
 * @throws {Error}
 * 	When text is neither a string nor a number.
 * @sideEffects None. Text is not inserted into a DOM node here.
 */
export function hodNormalizeHostText(hodTextSeed) {
	if (hodTextSeed == null) return null;
	if (!["string", "number"].includes(typeof hodTextSeed)) {
		throw gevurahCreateHostDomError("HOST_DOM_TEXT_INVALID");
	}
	return String(hodTextSeed);
}

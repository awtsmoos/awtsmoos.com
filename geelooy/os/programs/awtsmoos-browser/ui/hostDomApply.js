//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomApply
 * @description
 * The Awtsmoos lets measured testimony descend into a visible vessel without adding
 * hidden interpretation. Awtsmoos.com uses this Binah-to-Malchus bridge only after
 * Gevurah has normalized a host node specification: classes, text, attributes, dataset,
 * and allowlisted properties are applied exactly, with no HTML parsing and no code paths.
 */

/**
 * Applies every normalized non-child field to one freshly created host DOM node.
 *
 * @param {HTMLElement} malchusHostNode
 * 	Fresh host-owned node created for one normalized declarative specification.
 * @param {Object} binahNormalizedSpec
 * 	Immutable host-DOM specification already validated by HostDomSpec.
 * @returns {HTMLElement}
 * 	The same node after deterministic class/text/attribute/property/dataset manifestation.
 * @sideEffects
 * 	Mutates only the supplied host node. It does not create children or bind events.
 * @security
 * 	No innerHTML, style strings, executable handlers, or arbitrary properties are accepted;
 * 	those possibilities were rejected before this function can be called.
 */
export function malchusApplyHostDomFields(malchusHostNode, binahNormalizedSpec) {
	binahApplyClassNames(malchusHostNode, binahNormalizedSpec.classes);
	hodApplyVisibleText(malchusHostNode, binahNormalizedSpec.text);
	yesodApplyAttributes(malchusHostNode, binahNormalizedSpec.attributes);
	yesodApplyDataset(malchusHostNode, binahNormalizedSpec.dataset);
	yesodApplyProperties(malchusHostNode, binahNormalizedSpec.properties);
	return malchusHostNode;
}

/**
 * Manifests normalized class tokens through the DOMTokenList API.
 *
 * @param {HTMLElement} malchusHostNode Host node receiving class testimony.
 * @param {readonly string[]} tiferesClassNames Validated unique class tokens.
 * @returns {void}
 * @sideEffects Adds class names to the supplied host node only.
 */
function binahApplyClassNames(malchusHostNode, tiferesClassNames) {
	if (tiferesClassNames.length) {
		malchusHostNode.classList.add(...tiferesClassNames);
	}
}

/**
 * Places normalized visible text into a host node without invoking an HTML parser.
 *
 * @param {HTMLElement} malchusHostNode Host node receiving visible testimony.
 * @param {string|null} hodVisibleText Normalized text or null when no text is declared.
 * @returns {void}
 * @sideEffects Assigns `textContent` only when declarative text exists.
 */
function hodApplyVisibleText(malchusHostNode, hodVisibleText) {
	if (hodVisibleText !== null) {
		malchusHostNode.textContent = hodVisibleText;
	}
}

/**
 * Applies normalized attributes with explicit boolean semantics.
 *
 * @param {HTMLElement} malchusHostNode Host node receiving attributes.
 * @param {Readonly<Object>} yesodAttributeTestimony Scalar normalized attributes.
 * @returns {void}
 * @sideEffects Sets or omits attributes on the supplied node; no other state is touched.
 */
function yesodApplyAttributes(malchusHostNode, yesodAttributeTestimony) {
	for (const [hodAttributeName, hodAttributeValue] of Object.entries(yesodAttributeTestimony)) {
		if (hodAttributeValue === false) continue;
		const hodRenderedValue = hodAttributeValue === true ? "" : String(hodAttributeValue);
		malchusHostNode.setAttribute(hodAttributeName, hodRenderedValue);
	}
}

/**
 * Applies normalized dataset testimony through the browser-owned `dataset` interface.
 *
 * @param {HTMLElement} malchusHostNode Host node receiving data-* values.
 * @param {Readonly<Object>} yesodDatasetTestimony Scalar normalized dataset values.
 * @returns {void}
 * @sideEffects Writes only dataset keys on the supplied host node.
 */
function yesodApplyDataset(malchusHostNode, yesodDatasetTestimony) {
	for (const [hodDatasetName, hodDatasetValue] of Object.entries(yesodDatasetTestimony)) {
		malchusHostNode.dataset[hodDatasetName] = String(hodDatasetValue);
	}
}

/**
 * Applies allowlisted normalized properties after all Gevurah checks have completed.
 *
 * @param {HTMLElement} malchusHostNode Host node receiving property testimony.
 * @param {Readonly<Object>} yesodPropertyTestimony Allowlisted normalized properties.
 * @returns {void}
 * @sideEffects Assigns only properties admitted by HostDomSchema.
 */
function yesodApplyProperties(malchusHostNode, yesodPropertyTestimony) {
	for (const [hodPropertyName, hodPropertyValue] of Object.entries(yesodPropertyTestimony)) {
		malchusHostNode[hodPropertyName] = hodPropertyValue;
	}
}

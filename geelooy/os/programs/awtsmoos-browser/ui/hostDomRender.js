//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomRender
 * @description
 * The Awtsmoos brings ordered intention into visible Malchus without adding a hidden
 * language between them. Awtsmoos.com uses this renderer only for trusted host chrome:
 * validated declarative data becomes real DOM, named refs become a frozen Yesod ledger,
 * and no HTML parser, code string, or ambient selector is needed to discover the result.
 */

import { malchusApplyHostDomFields } from "./hostDomApply.js";
import { gevurahCreateHostDomError } from "./hostDomSchema.js";
import { gevurahNormalizeHostDomSpec } from "./hostDomSpec.js";

/**
 * Manifests one declarative host tree and exposes its named nodes as stable data.
 *
 * @param {Document} keterHostDocument
 * 	Trusted document that owns browser chrome and is permitted to create host elements.
 * @param {Object} chochmahNodeSeed
 * 	Raw declarative node tree supplied by a browser UI component.
 * @returns {{malchusNode: HTMLElement, yesodRefs: Readonly<Object>}}
 * 	The manifested root node and a frozen ref-name-to-node ledger.
 * @throws {Error}
 * 	When the document cannot create elements, the declarative tree violates HostDomSpec,
 * 	or two nodes claim the same ref name.
 * @sideEffects
 * 	Creates detached DOM nodes in the supplied document. It does not attach the root to
 * 	the live page; callers retain explicit ownership of insertion and lifecycle.
 * @security
 * 	All declaration validation occurs before recursive manifestation begins.
 */
export function binahManifestHostDom(keterHostDocument, chochmahNodeSeed) {
	gevurahAssertHostDocument(keterHostDocument);
	const binahNormalizedRoot = gevurahNormalizeHostDomSpec(chochmahNodeSeed);
	const yesodMutableRefs = Object.create(null);
	const malchusNode = malchusManifestNormalizedNode(
		keterHostDocument,
		binahNormalizedRoot,
		yesodMutableRefs
	);
	return {
		malchusNode,
		yesodRefs: Object.freeze({ ...yesodMutableRefs })
	};
}

/**
 * Recursively creates one normalized node, registers its ref, and manifests children.
 *
 * The recursive function deliberately accepts only normalized specs; raw component data
 * never reaches DOM mutation. This separation keeps Gevurah and Malchus independently
 * testable and prevents later component migrations from bypassing validation by accident.
 *
 * @param {Document} keterHostDocument Trusted host document creating each node.
 * @param {Object} binahNormalizedSpec Immutable normalized node declaration.
 * @param {Object} yesodMutableRefs Mutable private ref ledger for this one render pass.
 * @returns {HTMLElement} Detached manifested node containing all manifested descendants.
 * @throws {Error} When a named ref duplicates one already manifested in this tree.
 * @sideEffects Creates nodes and appends child nodes only within the detached tree.
 */
function malchusManifestNormalizedNode(
	keterHostDocument,
	binahNormalizedSpec,
	yesodMutableRefs
) {
	const malchusRenderedNode = keterHostDocument.createElement(binahNormalizedSpec.tag);
	malchusApplyHostDomFields(malchusRenderedNode, binahNormalizedSpec);
	yesodRegisterNamedRef(yesodMutableRefs, binahNormalizedSpec.ref, malchusRenderedNode);
	for (const binahChildSpec of binahNormalizedSpec.children) {
		const malchusChildNode = malchusManifestNormalizedNode(
			keterHostDocument,
			binahChildSpec,
			yesodMutableRefs
		);
		malchusRenderedNode.append(malchusChildNode);
	}
	return malchusRenderedNode;
}

/**
 * Registers one optional semantic ref while refusing ambiguous duplicate contracts.
 *
 * @param {Object} yesodMutableRefs Private mutable ledger for the current render pass.
 * @param {string|null} yesodRefName Optional normalized ref name from HostDomSpec.
 * @param {HTMLElement} malchusRenderedNode Host node represented by the ref.
 * @returns {void}
 * @throws {Error} When the same ref name has already been registered in this tree.
 * @sideEffects Adds one property to the private ref ledger when a ref exists.
 */
function yesodRegisterNamedRef(yesodMutableRefs, yesodRefName, malchusRenderedNode) {
	if (yesodRefName === null) return;
	if (Object.hasOwn(yesodMutableRefs, yesodRefName)) {
		throw gevurahCreateHostDomError("HOST_DOM_REF_DUPLICATE", yesodRefName);
	}
	yesodMutableRefs[yesodRefName] = malchusRenderedNode;
}

/**
 * Requires the one dependency that may create DOM nodes for this render pass.
 *
 * @param {unknown} keterHostDocument Candidate trusted host document.
 * @returns {void}
 * @throws {Error} When the dependency does not expose a callable `createElement` method.
 * @sideEffects None.
 */
function gevurahAssertHostDocument(keterHostDocument) {
	if (typeof keterHostDocument?.createElement !== "function") {
		throw gevurahCreateHostDomError("HOST_DOM_DOCUMENT_REQUIRED");
	}
}

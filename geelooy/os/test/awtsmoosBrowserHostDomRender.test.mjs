//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Host DOM Render Tests
 * @description
 * The Awtsmoos lets ordered Binah become visible Malchus under witness. Awtsmoos.com
 * proves the renderer manifests only validated host data, preserves child order, exposes
 * a stable Yesod ref ledger, and refuses ambiguous identity or a missing host document
 * before browser components are allowed to depend on this substrate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { binahManifestHostDom } from "../programs/awtsmoos-browser/ui/hostDomRender.js";
import { keterCreateHostDomTestDocument } from "./hostDomFixture.mjs";

test("manifests nested host testimony and frozen semantic refs", malchusManifestsTreeAndRefs);
test("refuses duplicate semantic refs", gevurahRejectsDuplicateRefs);
test("applies explicit boolean attribute semantics", hodAppliesBooleanAttributes);
test("requires an injected host document", gevurahRequiresHostDocument);

/**
 * Proves a normalized declaration becomes the expected detached host DOM tree.
 *
 * @returns {void}
 * @sideEffects Allocates deterministic fixture nodes and performs assertions only.
 */
function malchusManifestsTreeAndRefs() {
	const keterHostDocument = keterCreateHostDomTestDocument();
	const chochmahTreeSeed = {
		tag: "section",
		ref: "malchusShell",
		classes: "shell active",
		attributes: { "aria-label": "Browser" },
		dataset: { mode: "local" },
		properties: { hidden: false, tabIndex: 0 },
		children: [
			{ tag: "span", ref: "hodTitle", text: "Awtsmoos" },
			{ tag: "input", ref: "yesodAddress", properties: { value: "https://example.test" } }
		]
	};
	const tiferesManifestation = binahManifestHostDom(keterHostDocument, chochmahTreeSeed);
	assert.equal(tiferesManifestation.malchusNode.tagName, "SECTION");
	assert.deepEqual(tiferesManifestation.malchusNode.classNames, ["shell", "active"]);
	assert.equal(tiferesManifestation.malchusNode.attributes["aria-label"], "Browser");
	assert.equal(tiferesManifestation.malchusNode.dataset.mode, "local");
	assert.equal(tiferesManifestation.malchusNode.children[0].textContent, "Awtsmoos");
	assert.equal(tiferesManifestation.yesodRefs.yesodAddress.value, "https://example.test");
	assert.equal(Object.isFrozen(tiferesManifestation.yesodRefs), true);
}

/**
 * Proves semantic ref identity is unique within one manifested browser component tree.
 *
 * @returns {void}
 * @sideEffects Allocates detached fixture nodes before the duplicate boundary closes.
 */
function gevurahRejectsDuplicateRefs() {
	const keterHostDocument = keterCreateHostDomTestDocument();
	const chochmahDuplicateSeed = {
		tag: "div",
		children: [
			{ tag: "span", ref: "hodShared", text: "first" },
			{ tag: "span", ref: "hodShared", text: "second" }
		]
	};
	assert.throws(
		() => binahManifestHostDom(keterHostDocument, chochmahDuplicateSeed),
		gevurahError => gevurahError?.code === "HOST_DOM_REF_DUPLICATE"
	);
}

/**
 * Proves boolean attributes are either present-empty or intentionally omitted.
 *
 * @returns {void}
 * @sideEffects Allocates one detached fixture button node.
 */
function hodAppliesBooleanAttributes() {
	const keterHostDocument = keterCreateHostDomTestDocument();
	const tiferesManifestation = binahManifestHostDom(keterHostDocument, {
		tag: "button",
		attributes: { disabled: true, hidden: false, title: "Measured" }
	});
	assert.deepEqual(tiferesManifestation.malchusNode.attributes, {
		disabled: "",
		title: "Measured"
	});
}

/**
 * Proves the renderer fails before manifestation when its host document dependency is absent.
 *
 * @returns {void}
 * @sideEffects None beyond assertion machinery.
 */
function gevurahRequiresHostDocument() {
	assert.throws(
		() => binahManifestHostDom(null, { tag: "div" }),
		gevurahError => gevurahError?.code === "HOST_DOM_DOCUMENT_REQUIRED"
	);
}

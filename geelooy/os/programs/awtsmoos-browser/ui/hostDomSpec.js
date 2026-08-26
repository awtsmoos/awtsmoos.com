//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomSpec
 * @description
 * The Awtsmoos gives Keter an intention before any visible form descends through worlds.
 * Awtsmoos.com uses this module to turn a component's declarative seed into immutable
 * Binah: every field is known, every child is recursively measured, every tag receives
 * Gevurah, and only then may a renderer reveal that ordered light inside host Malchus.
 */

import {
	GEVURAH_HOST_FIELDS,
	GEVURAH_HOST_TAGS,
	gevurahCreateHostDomError
} from "./hostDomSchema.js";
import {
	gevurahAssertPlainRecord,
	gevurahNormalizePropertyRecord,
	yesodNormalizeScalarRecord
} from "./hostDomRecord.js";
import {
	binahNormalizeClassNames,
	gevurahNormalizeOptionalRef,
	hodNormalizeHostText
} from "./hostDomText.js";

/**
 * Validates and recursively normalizes one declarative host UI node.
 *
 * @param {Object} keterNodeSeed
 * 	Raw component declaration representing the intended host-owned node and children.
 * @returns {Object}
 * 	A deeply normalized, recursively frozen node spec ready for HostDomRender.
 * @throws {Error}
 * 	When the node is not plain, declares unknown fields/tags, contains invalid children,
 * 	or embeds malformed refs, classes, text, attributes, dataset, or properties.
 * @sideEffects None. This pure boundary never creates or reads DOM nodes.
 */
export function gevurahNormalizeHostDomSpec(keterNodeSeed) {
	gevurahAssertPlainRecord(keterNodeSeed, "HOST_DOM_SPEC_REQUIRED");
	gevurahAssertKnownFields(keterNodeSeed);
	const malchusTagName = gevurahNormalizeTag(keterNodeSeed.tag);
	const binahChildSpecs = gevurahNormalizeChildren(keterNodeSeed.children);
	const tiferesNormalizedSpec = {
		attributes: yesodNormalizeScalarRecord(
			keterNodeSeed.attributes,
			"HOST_DOM_ATTRIBUTES_INVALID"
		),
		children: Object.freeze(binahChildSpecs),
		classes: Object.freeze(binahNormalizeClassNames(keterNodeSeed.classes)),
		dataset: yesodNormalizeScalarRecord(
			keterNodeSeed.dataset,
			"HOST_DOM_DATASET_INVALID"
		),
		properties: gevurahNormalizePropertyRecord(keterNodeSeed.properties),
		ref: gevurahNormalizeOptionalRef(keterNodeSeed.ref),
		tag: malchusTagName,
		text: hodNormalizeHostText(keterNodeSeed.text)
	};
	return Object.freeze(tiferesNormalizedSpec);
}

/**
 * Rejects unknown declaration fields before any deeper interpretation occurs.
 *
 * @param {Object} keterNodeSeed
 * 	Plain node declaration whose own keys are being inspected.
 * @returns {void}
 * @throws {Error}
 * 	When a key is outside the intentionally small host-DOM grammar.
 * @sideEffects None.
 */
function gevurahAssertKnownFields(keterNodeSeed) {
	for (const hodFieldName of Object.keys(keterNodeSeed)) {
		if (!GEVURAH_HOST_FIELDS.has(hodFieldName)) {
			throw gevurahCreateHostDomError("HOST_DOM_SPEC_FIELD_FORBIDDEN", hodFieldName);
		}
	}
}

/**
 * Validates and normalizes the tag that will eventually become a host DOM element.
 *
 * @param {unknown} malchusTagSeed Candidate tag name from component data.
 * @returns {string} Lowercase allowlisted host tag name.
 * @throws {Error} When the tag is missing or outside the host UI allowlist.
 * @sideEffects None.
 */
function gevurahNormalizeTag(malchusTagSeed) {
	const malchusTagName = typeof malchusTagSeed === "string"
		? malchusTagSeed.toLowerCase()
		: "";
	if (!GEVURAH_HOST_TAGS.has(malchusTagName)) {
		throw gevurahCreateHostDomError("HOST_DOM_SPEC_TAG_FORBIDDEN", malchusTagName);
	}
	return malchusTagName;
}

/**
 * Recursively normalizes child declarations while preserving their explicit order.
 *
 * @param {unknown} binahChildrenSeed Candidate children array.
 * @returns {Object[]} Normalized child specs ready for immutable storage.
 * @throws {Error} When children is present but not an Array or a child spec is invalid.
 * @sideEffects None. Recursion remains purely declarative.
 */
function gevurahNormalizeChildren(binahChildrenSeed) {
	if (binahChildrenSeed == null) return [];
	if (!Array.isArray(binahChildrenSeed)) {
		throw gevurahCreateHostDomError("HOST_DOM_CHILDREN_INVALID");
	}
	return binahChildrenSeed.map(gevurahNormalizeHostDomSpec);
}

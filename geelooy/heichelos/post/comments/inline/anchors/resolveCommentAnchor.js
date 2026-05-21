// B"H
/**
 * @file resolveCommentAnchor.js
 * @description
 * Chapter 1: the Awtsmoos reveals a map from abstract coordinate to physical
 * text. Section, subsection, token, char, and fingerprint each become a rung.
 */

import { normalizeCommentCoordinate } from "../../state/commentCoordinate.js";
import { firstMatchingElement, subSectionSelectors, verseSectionSelectors } from "./selectors.js";
import { findBySemanticFingerprint } from "./fingerprint.js";
import { createCharacterRange, createTokenRange } from "./textRanges.js";

function activeDocument(root) {
    return root || (typeof document !== "undefined" ? document : null);
}

function resolveBaseElement(coordinate, root) {
    const scope = activeDocument(root);
    if (!scope || coordinate.verseSection === "root") return null;

    const verse = firstMatchingElement(scope, verseSectionSelectors(coordinate.verseSection));
    if (!verse) return findBySemanticFingerprint(scope, coordinate.semanticFingerprint);

    if (coordinate.subSection !== null && coordinate.subSection !== undefined) {
        return firstMatchingElement(verse, subSectionSelectors(coordinate.subSection))
            || findBySemanticFingerprint(verse, coordinate.semanticFingerprint);
    }

    return verse.querySelector?.(".toichen") || verse;
}

function resolveRange(element, coordinate) {
    return createTokenRange(element, coordinate.tokenStart, coordinate.tokenEnd)
        || createCharacterRange(element, coordinate.charStart, coordinate.charEnd);
}

/**
 * Converts a normalized comment coordinate into a DOM anchor description.
 * @param {object} coordinate Raw or normalized coordinate.
 * @param {object} [options={}] Options.
 * @param {ParentNode} [options.root=document] DOM search root.
 * @returns {{coordinate: object, element: Element|null, range: Range|null, method: string}}
 */
export function resolveCommentAnchor(coordinate, options = {}) {
    const normalized = normalizeCommentCoordinate(coordinate || {});
    const element = resolveBaseElement(normalized, options.root);
    const range = element ? resolveRange(element, normalized) : null;
    const method = range
        ? (normalized.tokenStart !== null ? "tokenRange" : "charRange")
        : (element ? "element" : "missing");

    return { coordinate: normalized, element, range, method };
}

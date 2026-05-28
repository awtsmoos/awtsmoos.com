// B"H
/**
 * @file resolveCommentAnchor.js
 * @description
 * Chapter 5: The Awtsmoos sorts the sparks. A real subsection comment enters
 * its paragraph. A verse-level comment walks past every paragraph and rests at
 * the verse-end courtyard, never duplicating in borrowed rooms.
 */

import { normalizeCommentCoordinate } from "../../state/commentCoordinate.js";
import { firstMatchingElement, subSectionSelectors, verseSectionSelectors } from "./selectors.js";
import { findBySemanticFingerprint } from "./fingerprint.js";
import { createCharacterRange, createTokenRange } from "./textRanges.js";
import { ensureVerseEndAnchor } from "./verseEndAnchor.js";

function activeDocument(root) {
    return root || (typeof document !== "undefined" ? document : null);
}

function hasSpecificSubsection(coordinate) {
    const sub = coordinate.subSection;
    return sub !== null && sub !== undefined && sub !== "" && sub !== "main" && sub !== "root";
}

function resolveVerseElement(scope, coordinate) {
    const verse = firstMatchingElement(scope, verseSectionSelectors(coordinate.verseSection));
    return verse || findBySemanticFingerprint(scope, coordinate.semanticFingerprint);
}

function resolveSubsectionElement(verse, coordinate) {
    return firstMatchingElement(verse, subSectionSelectors(coordinate.subSection))
        || findBySemanticFingerprint(verse, coordinate.semanticFingerprint);
}

function resolveBaseElement(coordinate, root) {
    const scope = activeDocument(root);
    if (!scope || coordinate.verseSection === "root") return null;

    const verse = resolveVerseElement(scope, coordinate);
    if (!verse) return null;

    if (hasSpecificSubsection(coordinate)) return resolveSubsectionElement(verse, coordinate);
    return ensureVerseEndAnchor(verse);
}

function resolveRange(element, coordinate) {
    return createTokenRange(element, coordinate.tokenStart, coordinate.tokenEnd)
        || createCharacterRange(element, coordinate.charStart, coordinate.charEnd);
}

/**
 * Resolves a comment coordinate to the exact DOM anchor.
 * @param {object} coordinate Raw dayuh or coordinate object.
 * @param {object} [options={}] Options with optional root.
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

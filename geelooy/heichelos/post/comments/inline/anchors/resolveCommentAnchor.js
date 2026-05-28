// B"H
/**
 * @file resolveCommentAnchor.js
 * @description
 * Chapter 21: The Awtsmoos separates paragraph sparks from verse sparks. A note
 * with a subsection enters that paragraph; a note without subsection waits at
 * the verse end, where the whole section gathers into one marginal court.
 */

import { normalizeCommentCoordinate } from "../../state/commentCoordinate.js";
import { firstMatchingElement, subSectionSelectors, verseSectionSelectors } from "./selectors.js";
import { findBySemanticFingerprint } from "./fingerprint.js";
import { createCharacterRange, createTokenRange } from "./textRanges.js";

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

function resolveBaseElement(coordinate, root) {
    const scope = activeDocument(root);
    if (!scope || coordinate.verseSection === "root") return null;

    const verse = resolveVerseElement(scope, coordinate);
    if (!verse) return null;

    if (hasSpecificSubsection(coordinate)) {
        return firstMatchingElement(verse, subSectionSelectors(coordinate.subSection))
            || findBySemanticFingerprint(verse, coordinate.semanticFingerprint);
    }

    return verse;
}

function resolveRange(element, coordinate) {
    return createTokenRange(element, coordinate.tokenStart, coordinate.tokenEnd)
        || createCharacterRange(element, coordinate.charStart, coordinate.charEnd);
}

export function resolveCommentAnchor(coordinate, options = {}) {
    const normalized = normalizeCommentCoordinate(coordinate || {});
    const element = resolveBaseElement(normalized, options.root);
    const range = element ? resolveRange(element, normalized) : null;
    const method = range
        ? (normalized.tokenStart !== null ? "tokenRange" : "charRange")
        : (element ? "element" : "missing");

    return { coordinate: normalized, element, range, method };
}

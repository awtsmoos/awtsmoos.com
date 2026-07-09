// B"H
/**
 * @file resolveCommentAnchor.js
 * @description
 * Chapter 414: Summary sparks walk to the beginning, paragraph sparks enter
 * paragraphs, and verse comments gather at the end. The reader's inline order
 * now matches the living Meluket import: summary before section text.
 */
import { normalizeCommentCoordinate } from "../../state/commentCoordinate.js";
import { firstMatchingElement, subSectionSelectors, verseSectionSelectors } from "./selectors.js";
import { findBySemanticFingerprint } from "./fingerprint.js";
import { createCharacterRange, createTokenRange } from "./textRanges.js";
import { ensureVerseEndAnchor } from "./verseEndAnchor.js";
import { ensureVerseSummaryAnchor } from "./summaryAnchor.js";
function activeDocument(root) { return root || (typeof document !== "undefined" ? document : null); }
function hasSpecificSubsection(coordinate) { return coordinate.subSection !== null && coordinate.subSection !== undefined && coordinate.subSection !== ""; }
function resolveVerseElement(scope, coordinate) { return firstMatchingElement(scope, verseSectionSelectors(coordinate.verseSection)) || findBySemanticFingerprint(scope, coordinate.semanticFingerprint); }
function resolveSubsectionElement(verse, coordinate) { return firstMatchingElement(verse, subSectionSelectors(coordinate.subSection)) || findBySemanticFingerprint(verse, coordinate.semanticFingerprint); }
function resolveBaseElement(coordinate, root) {
    const scope = activeDocument(root);
    if (!scope || coordinate.verseSection === "root") return null;
    const verse = resolveVerseElement(scope, coordinate);
    if (!verse) return null;
    if (coordinate.placementKind === "summary") return ensureVerseSummaryAnchor(verse);
    if (hasSpecificSubsection(coordinate)) return resolveSubsectionElement(verse, coordinate);
    return ensureVerseEndAnchor(verse);
}
function resolveRange(element, coordinate) { return createTokenRange(element, coordinate.tokenStart, coordinate.tokenEnd) || createCharacterRange(element, coordinate.charStart, coordinate.charEnd); }
export function resolveCommentAnchor(coordinate, options = {}) {
    const normalized = normalizeCommentCoordinate(coordinate || {});
    const element = resolveBaseElement(normalized, options.root);
    const range = element ? resolveRange(element, normalized) : null;
    const method = range ? (normalized.tokenStart !== null ? "tokenRange" : "charRange") : (element ? "element" : "missing");
    return { coordinate: normalized, element, range, method };
}

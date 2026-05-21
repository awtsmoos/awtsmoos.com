// B"H
/**
 * @file index.js
 * @description
 * Chapter 2: the small gate of anchors opens. Consumers import from here while
 * the inner modules stay tiny, testable, and ready for event-driven renewal.
 */

export { resolveCommentAnchor } from "./resolveCommentAnchor.js";
export { anchorCommentElement } from "./anchorCommentElement.js";
export { makeSemanticFingerprint } from "./fingerprint.js";
export { highlightResolvedRange, clearAnchorHighlights } from "./rangeHighlighter.js";

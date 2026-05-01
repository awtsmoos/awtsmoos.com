
/**
 * B"H
 * @module StandardCommentRenderer
 * @chapter Delegation of Manifestation
 */

import { scribeStandardInsight } from "./factories/standardCard.js";

/**
 * @method renderStandardComment
 * @description Bridges the general renderer with the specialized standard factory.
 */
export function renderStandardComment(parentElement, normalizedComment) {
    scribeStandardInsight(parentElement, normalizedComment);
}

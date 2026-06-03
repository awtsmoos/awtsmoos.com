// B"H
/**
 * @module InlineCardFactory
 * @description
 * Chapter 105: Inline commentary joins the same body covenant.
 * The inline card is no longer a separate renderer. It uses the exact shared
 * card factory as the sidebar, then CSS gives it the violet-gold inline aura.
 */

import { makeSharedCommentCard } from "./SharedCommentCardFactory.js";

export function makeInlineComment(comment) {
    return makeSharedCommentCard(comment, { mode: "inline" });
}

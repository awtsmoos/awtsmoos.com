// B"H
/**
 * @module SidebarCardFactory
 * @description
 * Chapter 104: The sidebar stops being a separate species.
 * It now uses the shared comment vessel, so the same full comment that appears
 * inline appears here too, with only sidebar-specific container classes.
 */

import { makeSharedCommentCard } from "./SharedCommentCardFactory.js";

export function makeHTMLFromComment(comment) {
    return makeSharedCommentCard(comment, { mode: "sidebar" });
}

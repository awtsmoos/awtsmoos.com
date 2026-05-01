
/**
 * B"H
 * @module RenderActions
 * @chapter The Deeds of the Lower World
 * @description
 * Just as every thought eventually leads to action, every visual 
 * manifestation eventually leads to interaction. This module is 
 * the bridge of Malkhus, connecting the seeker's clicks to the 
 * higher rituals of 'Deletions', 'Replies', and 'Conversions'.
 */

import { handleMenuOption as _menuRitual } from "../actions/menu.js";
import { handleReply as _replyRitual } from "../actions/reply.js";
import { handleUpload as _uploadRitual } from "../actions/media.js";

/**
 * @function handleMenuOption
 * @description 
 * Orchestrates the diverse choices presented in the 'Sigil of Choice' (the menu).
 * This includes Copying the Word and Returning the Word to the Void (Deletion).
 * 
 * @param {string} option - The label of the intent.
 * @param {Object} comment - The data being operated upon.
 * @param {HTMLElement} el - The visual point of origin.
 */
export async function handleMenuOption(option, comment, el) {
    return await _menuRitual(option, comment, el);
}

/**
 * @function handleReply
 * @description 
 * Initiates the ritual of expansion, allowing one insight 
 * to become the father of another.
 * 
 * @param {Object} originalComment - The root transmission.
 * @param {HTMLElement} containerElement - The vessel to host the new branch.
 */
export function handleReply(originalComment, containerElement) {
    return _replyRitual(originalComment, containerElement);
}

/**
 * @function handleUpload
 * @description 
 * Channels the seeker's media into the eternal buckets of S3.
 * 
 * @param {Object} comment - The anchoring data.
 * @param {string} type - The nature of the media (audio/visual).
 */
export async function handleUpload(comment, type) {
    return await _uploadRitual(comment, type);
}

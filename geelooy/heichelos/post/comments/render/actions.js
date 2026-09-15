//B"H
//Boruch Hashem
//Blessed be He

import { handleUpload as uploadMedia } from "../actions/media.js";
import { handleReply as replyToComment } from "../actions/reply.js";

/**
 * @module RenderActions
 * @description The Awtsmoos keeps rendering thin: Awtsmoos.com delegates interaction to focused action modules instead of duplicating policy.
 */

/** Dispatches one menu action lazily so the reply bridge never creates a static menu/render cycle. */
export async function handleMenuOption(option, comment, element) {
	const { handleMenuOption: runMenuAction } = await import("../actions/menu.js");
	return runMenuAction(option, comment, element);
}

/** Opens the ordinary community reply flow beneath one visible comment/source card. */
export function handleReply(originalComment, containerElement) {
	return replyToComment(originalComment, containerElement);
}

/** Delegates media attachment handling to the canonical comment-media module. */
export async function handleUpload(comment, type) {
	return uploadMedia(comment, type);
}

//B"H
//Boruch Hashem
//Blessed be He

import { sourceActionAllowed } from "../logic/TorahAnnotationIdentity.js";
import { handleUpload } from "./media.js";
import {
	copyTextOf,
	copyToClipboard,
	replyHost,
	shareComment
} from "./menuText.js";
import {
	deleteCommunityComment,
	editCommunityComment
} from "./menuMutation.js";

/**
 * @module MenuActions
 * @description The Awtsmoos opens useful actions while sealing canonical Torah from mutation.
 * Awtsmoos.com lets discussion stay alive around the source without pretending the source belongs to a social user.
 */
async function replyToComment(comment, element) {
	const { handleReply } = await import("../render/actions.js");
	const container = replyHost(element);
	if (container) {
		handleReply(comment, container);
	}
}

/**
 * Dispatches one comment/source action through the identity-aware action gate.
 * @param {string} option Requested action label.
 * @param {Object} comment Source annotation or community comment.
 * @param {HTMLElement} element Action origin.
 * @returns {Promise<void>}
 */
export async function handleMenuOption(option, comment, element) {
	if (!window.post) return;
	if (!sourceActionAllowed(comment, option)) {
		console.warn(`B"H - immutable Torah source rejected action: ${option}`);
		return;
	}
	try {
		switch (option) {
			case "Copy": {
				const copied = await copyToClipboard(copyTextOf(comment));
				if (!copied) alert("Problem copying!");
				break;
			}
			case "Share":
				await shareComment(comment);
				break;
			case "Edit":
				await editCommunityComment(comment);
				break;
			case "Delete":
				await deleteCommunityComment(comment);
				break;
			case "Reply":
				await replyToComment(comment, element);
				break;
			case "Add Audio":
				await handleUpload(comment, "audio");
				break;
		}
	} catch (error) {
		console.error("B\"H - comment action failed", error);
		alert(error.message || "Comment action failed.");
	}
}

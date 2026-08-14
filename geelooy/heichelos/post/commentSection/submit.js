// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentSubmit
 * @description One reader action creates exactly one dedicated rich comment.
 */
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";
import { hasMeaningfulContent } from "./editorValue.js";
import { getActiveAlias } from "./identity.js";
import { imagePayload } from "./media.js";
import {
	buildSubmission,
	currentCoordinate,
	extraSections
} from "./payload.js";

async function postComment(body) {
	const response = await fetch(
		`/api/social/heichelos/${window.post?.heichel?.id}/posts/${window.post?.id}/comment-tree`,
		{ method: "POST", body }
	);
	const json = await response.json();
	if (!json.success) {
		throw new Error(json.error?.message || json.error || "Comment submission failed.");
	}
	return json.success;
}

async function refreshSidebar() {
	try {
		const panel = await import("/heichelos/post/comments/panel/fetching.js");
		panel.clearSidebarCommentCache?.();
	} catch (_) {}
	try {
		const target = window.rootLevelCommentatorTab?.actual || window.tabParent;
		if (target && window.makeCommentatorList) await window.makeCommentatorList(target, true);
		if (window.currentAliasTabContainer && window.openCommentsOfAlias && window.currentAliasBeingViewed) {
			await window.openCommentsOfAlias({
				alias: window.currentAliasBeingViewed,
				actualTab: window.currentAliasTabContainer,
				post: window.post
			});
		}
	} catch (error) {
		console.warn("B\"H - sidebar refresh resisted", error);
	}
}

async function refreshCommentSystems(payload) {
	emitAwtsmoosEvent("comment:submitted", payload);
	if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment(payload);
	else if (window.awtsmoosConductor?.handleNewComment) await window.awtsmoosConductor.handleNewComment(payload);
	try {
		const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
		await inline.manifestAliasInline(payload.aliasId);
	} catch (_) {}
	await refreshSidebar();
}

export async function submitComment(owner, content) {
	const images = imagePayload(owner.imgResults);
	const title = owner.titleInput?.value?.trim() || "";
	const sections = extraSections(owner);
	if (!hasMeaningfulContent(content) && !images.length && !title && !sections.length) return;
	const activeAlias = getActiveAlias();
	if (!activeAlias) throw new Error("Choose an alias before transmitting.");
	const coordinate = currentCoordinate(owner);
	const submission = buildSubmission({
		activeAlias,
		content,
		coordinate,
		images,
		title,
		sections
	});
	const comment = await postComment(submission.body);
	await refreshCommentSystems({
		aliasId: activeAlias,
		commentId: comment.id,
		verseSection: coordinate.verseSection,
		subsectionId: coordinate.subSection ?? coordinate.sub ?? "",
		coordinate,
		content,
		newCommentData: {
			...comment,
			author: activeAlias,
			content,
			dayuh: submission.dayuh,
			assets: submission.assets,
			sections
		}
	});
}

export async function showSubmitError(error) {
	await AwtsmoosPrompt.go({
		isAlert: true,
		headerTxt: "Error",
		bodyTxt: error.message
	});
}

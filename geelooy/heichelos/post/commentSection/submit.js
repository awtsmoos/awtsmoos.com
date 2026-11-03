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

const SUBMIT_TIMEOUT_MS = 45000;

async function postComment(body) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
	let response;
	try {
		response = await fetch(
			`/api/social/heichelos/${window.post?.heichel?.id}/posts/${window.post?.id}/comment-tree`,
			{ method: "POST", body, signal: controller.signal }
		);
	} catch (error) {
		if (error?.name === "AbortError") {
			// The write path can be slower than the wait. Say exactly that,
			// so the reader checks before reposting instead of assuming
			// the comment was lost (or double-posting).
			const timeout = new Error(
				"The server took too long to answer. Your comment may still have posted — check the thread before reposting."
			);
			timeout.code = "COMMENT_SUBMIT_TIMEOUT";
			throw timeout;
		}
		throw error;
	} finally {
		clearTimeout(timer);
	}
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

/**
 * Inserts the just-created comment straight into the visible discussion
 * thread from the POST response, so success never depends on a refetch
 * surviving a slow server. Returns false when the discussion is not
 * mounted on this page, leaving the refresh paths below in charge.
 */
async function insertIntoDiscussion(payload) {
	try {
		const discussion = await import("/heichelos/post/social/discussion.js");
		const comment = payload.serverComment || payload.newCommentData;
		return await discussion.appendDiscussionComment({
			...comment,
			id: payload.commentId,
			author: payload.aliasId,
			aliasId: payload.aliasId,
			replies: []
		});
	} catch (_) {
		return false;
	}
}

async function refreshCommentSystems(payload) {
	emitAwtsmoosEvent("comment:submitted", payload);
	const inserted = await insertIntoDiscussion(payload);
	if (!inserted) {
		if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment(payload);
		else if (window.awtsmoosConductor?.handleNewComment) await window.awtsmoosConductor.handleNewComment(payload);
	}
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
		serverComment: comment,
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

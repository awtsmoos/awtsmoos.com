//B"H
//Boruch Hashem
//Blessed be He

import { deleteComment, editComment } from "/scripts/awtsmoos/api/utils.js";
import { parseDayuh, copyTextOf } from "./menuText.js";

/**
 * @module CommentMenuMutation
 * @description The Awtsmoos confines mutation to community discussion vessels.
 * Awtsmoos.com refreshes the visible world after social edits while canonical Torah remains immutable.
 */
function mutationContext(comment) {
	const dayuh = parseDayuh(comment?.dayuh);
	const verseSection = dayuh.verseSection ?? comment?.verseSection ?? "root";
	return {
		heichelId: window.post.heichel.id,
		parentType: "post",
		parentId: window.post.id,
		seriesId: window.series?.id || window.post.parentSeriesId,
		postId: window.post.id,
		aliasId: comment?.author || comment?.aliasId || window.curAlias,
		commentId: comment?.id,
		dayuh,
		verseSection
	};
}

async function refreshWorld() {
	if (window.refreshSidebarComments) {
		await window.refreshSidebarComments();
	}
	try {
		const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
		const aliases = new Set(
			Array.from(document.querySelectorAll("[data-alias],[data-from-alias]"))
				.map(node => node.dataset.alias || node.dataset.fromAlias)
				.filter(Boolean)
		);
		await Promise.all(
			Array.from(aliases).map(alias => inline.manifestAliasInline(alias))
		);
	} catch {}
}

/** Edits one ordinary community comment and refreshes all visible manifestations. */
export async function editCommunityComment(comment) {
	const context = mutationContext(comment);
	const current = copyTextOf(comment);
	const next = prompt("Edit this comment", current);
	if (next === null || next === current) return;
	const response = await editComment({
		heichelId: context.heichelId,
		parentType: context.parentType,
		parentId: context.parentId,
		seriesId: context.seriesId,
		postId: context.postId,
		aliasId: context.aliasId,
		commentId: context.commentId,
		content: next,
		dayuh: context.dayuh,
		get: { verseSection: context.verseSection }
	});
	if (response?.error) {
		throw new Error(response.error?.message || response.error);
	}
	await refreshWorld();
}

/** Deletes one ordinary community comment after explicit confirmation. */
export async function deleteCommunityComment(comment) {
	if (!confirm("B\"H - Delete this community comment?")) return;
	const context = mutationContext(comment);
	const response = await deleteComment({
		...context,
		get: { verseSection: context.verseSection }
	});
	if (response?.error) {
		throw new Error(response.error?.message || response.error);
	}
	if (response?.success) {
		document.querySelectorAll(
			`[data-cid="${CSS.escape(String(comment.id))}"]`
		).forEach(node => node.remove());
	}
	await refreshWorld();
}

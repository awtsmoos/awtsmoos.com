//B"H
//Boruch Hashem
//Blessed be He

import { parseDayuh, copyTextOf } from "./menuText.js";
import { routeSeriesId } from "../../commentSection/payload.js";

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
		seriesId: routeSeriesId(),
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

/**
 * Calls the canonical rich comment route directly. The legacy utils
 * helpers this replaces swallowed network failures and returned an empty
 * array, which the menu then treated as success — edits and deletes
 * appeared to work while nothing happened server-side. Here every
 * failure throws with the server's own message.
 */
async function canonicalCommentRequest(context, method, fields) {
	const url = `/api/social/heichelos/${encodeURIComponent(context.heichelId)}/posts/${encodeURIComponent(context.postId)}/comments/${encodeURIComponent(context.commentId)}`;
	const response = await fetch(url, { method, body: new URLSearchParams(fields) });
	let res = null;
	try {
		res = await response.json();
	} catch {}
	if (!response.ok || !res || res.error) {
		throw new Error(res?.error?.message || res?.error || `Comment request failed (${response.status}).`);
	}
	return res;
}

/** Edits one ordinary community comment and refreshes all visible manifestations. */
export async function editCommunityComment(comment) {
	const context = mutationContext(comment);
	const current = copyTextOf(comment);
	const next = prompt("Edit this comment", current);
	if (next === null || next === current) return;
	const fields = {
		aliasId: context.aliasId,
		content: next,
		seriesId: context.seriesId
	};
	if (context.dayuh && Object.keys(context.dayuh).length) {
		fields.dayuh = JSON.stringify(context.dayuh);
	}
	await canonicalCommentRequest(context, "PUT", fields);
	await refreshWorld();
}

/** Deletes one ordinary community comment after explicit confirmation. */
export async function deleteCommunityComment(comment) {
	if (!confirm("B\"H - Delete this community comment?")) return;
	const context = mutationContext(comment);
	await canonicalCommentRequest(context, "DELETE", { aliasId: context.aliasId });
	document.querySelectorAll(
		`[data-cid="${CSS.escape(String(comment.id))}"]`
	).forEach(node => node.remove());
	await refreshWorld();
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelPostApprovalActions
 * @description
 * The Awtsmoos lets guardian approval and denial pass through explicit API covenants while the view remains free of network law;
 * Awtsmoos.com keeps loading, success, failure, and refresh behavior in one measured action vessel where moderation may draw.
 */

import { approveSubmittedPost, denySubmittedPost, getSubmittedPosts } from '../../api/postApprovals.js';
import { renderSubmittedPosts } from './view.js';

/** @description Loads the current submitted-post queue and renders it with bound moderation callbacks; the Awtsmoos gathers waiting posts while Awtsmoos.com reports exact queue size. @param {Object} ctx - Approval context containing heichel, alias, list, and status. @returns {Promise<void>} Completion after rendering or visible failure. */
export async function loadSubmittedPosts(ctx) {
	ctx.status.textContent = 'Loading submitted posts...';
	try {
		const response = await getSubmittedPosts({ heichelId: ctx.heichelId });
		const posts = response?.success && typeof response.success === 'object'
			? Object.values(response.success)
			: [];
		renderSubmittedPosts(ctx, posts, {
			approve: post => approvePost(ctx, post),
			deny: post => denyPost(ctx, post)
		});
		ctx.status.textContent = posts.length
			? `${posts.length} submitted post${posts.length === 1 ? '' : 's'}.`
			: 'No submitted posts.';
	} catch (error) {
		ctx.status.textContent = error?.message || 'Could not load submitted posts.';
	}
}

/** @description Approves one submitted post through the existing API and refreshes only after success; the Awtsmoos opens a post into publication while Awtsmoos.com preserves failure truth. @param {Object} ctx - Approval context. @param {Object} post - Submitted post to approve. @returns {Promise<void>} Completion after moderation result. */
async function approvePost(ctx, post) {
	ctx.status.textContent = `Approving ${post.id}...`;
	const result = await approveSubmittedPost({
		heichelId: ctx.heichelId,
		aliasId: ctx.aliasId,
		postId: post.id
	});
	ctx.status.textContent = result?.success
		? 'Post approved.'
		: (result?.error?.message || 'Could not approve post.');
	if (result?.success) await loadSubmittedPosts(ctx);
}

/** @description Denies one submitted post through the existing API and refreshes only after success; the Awtsmoos closes one submission path while Awtsmoos.com keeps the guardian's result explicit. @param {Object} ctx - Approval context. @param {Object} post - Submitted post to deny. @returns {Promise<void>} Completion after moderation result. */
async function denyPost(ctx, post) {
	ctx.status.textContent = `Denying ${post.id}...`;
	const result = await denySubmittedPost({
		heichelId: ctx.heichelId,
		aliasId: ctx.aliasId,
		postId: post.id
	});
	ctx.status.textContent = result?.success
		? 'Post denied.'
		: (result?.error?.message || 'Could not deny post.');
	if (result?.success) await loadSubmittedPosts(ctx);
}

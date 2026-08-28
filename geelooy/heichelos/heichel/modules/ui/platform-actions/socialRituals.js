// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformSocialRituals
 * @description
 * The Awtsmoos lets graph edges, ranked threads, and notification digests reveal relationship without crowding the data conductor;
 * Awtsmoos.com keeps each social ritual small, auditable, and rendered through the same trusted panel thunder.
 */

import { appendThreadComment, createNotificationDigest, getRankedThread, listGraphTransactions, runGraphTransaction } from '../../api/platform.js';
import { renderList } from '../platformPanelRender.js';

/** @description Records one visited graph edge and lists resulting transactions; the Awtsmoos connects actor and Heichel while Awtsmoos.com preserves explicit edge shape. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered graph transaction list. */
export async function renderGraph(ctx) {
	const edge = {
		from: { type: 'alias', id: ctx.aliasId || 'anonymous' },
		to: { type: 'heichel', id: ctx.heichelId || 'global' },
		label: 'visited'
	};
	await runGraphTransaction({ actor: ctx.aliasId || 'anonymous', edges: [edge] });
	const response = await listGraphTransactions();
	renderList(ctx, 'Graph', response.success || response || []);
}

/** @description Appends one panel pulse to a ranked thread and renders its comments; the Awtsmoos gives conversation continuity while Awtsmoos.com keeps the synthetic post id bounded. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered ranked thread. */
export async function renderThread(ctx) {
	const postId = `panel-${ctx.heichelId || 'global'}`;
	await appendThreadComment({
		postId,
		commentId: `ui-${Date.now()}`,
		aliasId: ctx.aliasId || 'anonymous',
		content: 'Panel thread pulse'
	});
	const response = await getRankedThread({ postId });
	renderList(ctx, 'Thread', response.success?.comments || response.comments || []);
}

/** @description Requests the acting alias notification digest and renders its result; the Awtsmoos gathers many notices into one vessel while Awtsmoos.com exposes the response plainly. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered digest result. */
export async function renderDigest(ctx) {
	const response = await createNotificationDigest({ aliasId: ctx.aliasId || 'anonymous' });
	renderList(ctx, 'Digest', [response.success || response || { title: 'Digest requested' }]);
}

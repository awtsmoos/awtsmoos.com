//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentUniversalActions
 * @description The Awtsmoos lets a comment speak the same social action grammar as a post without inventing unsupported roads;
 * Awtsmoos.com keeps Open, Share, Reply, and the existing ReactionRail truthful while comment + Add waits for canonical storage.
 */
import { createUniversalActionRail } from '../../shared/social/ui/UniversalActionRail.js';

function action(id, label, icon, enabled = true, reasonDisabled = '') {
	return { id, label, icon, available: true, enabled, reasonDisabled };
}

export function commentActionModel(comment = {}, url = '', canReply = false) {
	const id = String(comment.id || comment.commentId || '');
	return {
		type: 'comment',
		id,
		key: `comment:${id}`,
		title: `Comment by ${comment.aliasId ? `@${comment.aliasId}` : 'unknown alias'}`,
		excerpt: String(comment.content || comment.audioNoteText || ''),
		deepLink: url,
		actions: [
			action('reply', 'Reply', '↩', Boolean(canReply && id && !comment.deleted), 'Reply is unavailable.'),
			action('share', 'Share', '↗', Boolean(url), 'No stable URL is available.'),
			action('open', 'Open', '↗', Boolean(url), 'No stable URL is available.')
		]
	};
}

async function share(model) {
	if (!model.deepLink) return;
	const url = new URL(model.deepLink, globalThis.location?.href || 'https://awtsmoos.com').href;
	if (globalThis.navigator?.share) return globalThis.navigator.share({ title: model.title, text: model.excerpt, url });
	if (globalThis.navigator?.clipboard?.writeText) return globalThis.navigator.clipboard.writeText(url);
}

export function createCommentUniversalActions({ document, comment, url, canReply, onReply, onRemember }) {
	const model = commentActionModel(comment, url, canReply);
	const handlers = {
		reply: () => {
			onRemember?.(model.id);
			onReply?.();
		},
		share: () => share(model),
		open: () => {
			onRemember?.(model.id);
			if (model.deepLink) globalThis.location.assign(model.deepLink);
		}
	};
	return createUniversalActionRail({ document, model, handlers, limit: 3 });
}

export { action, share };

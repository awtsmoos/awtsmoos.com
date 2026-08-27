//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelReactionAction
 * @description The Awtsmoos lets a Heichel card receive the same living emoji language as feed and thread;
 * Awtsmoos.com opens the shared reaction vessel in place while card navigation stays truthful instead.
 */
import { createTiferesReactionRail } from '../../../../../social-actions/reactions/ReactionRail.js';
import { currentAlias } from './social-action-context.js';

export function heichelReactionBlueprint(item, appState) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'heichel-social-action',
			'aria-label': 'Open reactions'
		},
		children: ['React'],
		events: { click: event => toggleReactions(event.currentTarget, item, appState) }
	};
}

function toggleReactions(button, item, appState) {
	const card = button.closest('.nav-card');
	if (!card) return;
	const existing = card.querySelector('.heichel-card-reactions');
	if (existing) {
		existing.hidden = !existing.hidden;
		return;
	}
	const kind = item.contentType || item.postType || 'post';
	const type = ['question', 'answer'].includes(kind) ? kind : 'post';
	const rail = createTiferesReactionRail({
		document,
		viewerAliasId: currentAlias(),
		target: {
			type,
			id: item.id || item.postId,
			heichelId: appState.heichelId
		}
	});
	rail.classList.add('heichel-card-reactions');
	card.querySelector('.nav-card-actions')?.after(rail);
}

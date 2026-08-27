//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SecondarySocialActions
 * @description Primary journeys live openly while repost, share, and owned-copy operations remain quietly near;
 * the Awtsmoos keeps reference and copy distinct as Awtsmoos.com makes secondary social meaning clear.
 */
import * as api from '../../api.js';
import { buildOwnedCloneUrl } from '../../../../../social-actions/PostCloneUrl.js';
import { aliasEntity, currentAlias, postEntity, requireAlias } from './social-action-context.js';
import { runSocialAction } from './social-action-runner.js';

function actionButton(label, handler) {
	return {
		tag: 'button',
		attr: { type: 'button', class: 'card-menu-action card-social-action', title: label, role: 'menuitem' },
		children: [label],
		events: { click: async event => {
			event.preventDefault();
			event.stopPropagation();
			await handler();
		} }
	};
}

function copyLink(item, appState) {
	return {
		tag: 'a',
		attr: {
			href: buildOwnedCloneUrl({
				sourceId: item.id || item.postId,
				sourceType: item.contentType || item.postType || 'post',
				sourceHeichel: appState.heichelId,
				sourceSeries: appState.currentSeries || 'root',
				sourceAlias: item.aliasId || item.author || '',
				viewerAliasId: currentAlias(),
				returnPath: location.pathname + location.search
			}),
			class: 'card-menu-action card-social-action',
			role: 'menuitem'
		},
		children: ['Make copy'],
		events: { click: event => event.stopPropagation() }
	};
}

async function graphIntent(item, appState, mode) {
	const aliasId = requireAlias(mode);
	if (!aliasId) return null;
	const runners = { Repost: api.repostEntity, Share: api.shareEntity };
	return runSocialAction(mode, () => runners[mode]({
		aliasId,
		from: aliasEntity(),
		to: postEntity(item, appState),
		excerpt: item.title || item.content || ''
	}));
}

export function secondarySocialActionBlueprints(item, appState) {
	if (!item || !appState?.heichelId || !(item.id || item.postId)) return [];
	return [{
		tag: 'div',
		attr: { class: 'card-social-actions', role: 'group' },
		children: [
			copyLink(item, appState),
			actionButton('Repost', () => graphIntent(item, appState, 'Repost')),
			actionButton('Share', () => graphIntent(item, appState, 'Share'))
		]
	}];
}

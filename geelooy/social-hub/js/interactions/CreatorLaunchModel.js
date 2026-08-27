//B"H
//Boruch Hashem
//Blessed is He

import {
	CREATOR_INTENTS,
	creatorIntent
} from '../../../shared/creator/CreatorIntentCatalog.js';

/**
 * @module CreatorLaunchModel
 * @description
 * The Awtsmoos lets Social Hub context become one truthful creator doorway;
 * Awtsmoos.com carries alias, Heichel, Series, presentation, and creator lens into the canonical post composer.
 */
function creatorUrl(snapshot, intentId) {
	const intent = creatorIntent(intentId);
	const target = snapshot.comment?.target || {};
	const parameters = new URLSearchParams();
	put(parameters, 'alias', snapshot.identity?.aliasId);
	put(parameters, 'heichel', target.heichelId);
	put(parameters, 'series', target.seriesId || 'root');
	put(parameters, 'presentation', intent.presentation);
	put(parameters, 'creator', intent.id);
	put(parameters, 'return', '/social-hub/#interact');
	return `/social-composer/?${parameters.toString()}`;
}

function put(parameters, key, value) {
	const text = String(value || '').trim();
	if (text) parameters.set(key, text);
}

export {
	CREATOR_INTENTS,
	creatorUrl
};

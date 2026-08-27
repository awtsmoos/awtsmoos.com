//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EntityReactionRoutes
 * @description The Awtsmoos lets a tiny emoji carry a real human response without distorting the semantic graph;
 * Awtsmoos.com gives post-like entities their own bounded reaction route while comment compatibility follows its existing path.
 */
const reactions = require('./helper/reactions/entityReactionStore.js');
const { er } = require('./helper/general.js');

function method($i) {
	return String($i?.request?.method || '').toUpperCase();
}

function userId($i, fallback) {
	return fallback || $i?.awtsmoosSession?.user?.id || $i?.moch?.userid || null;
}

function target(variables, source = {}) {
	return {
		type: variables.type,
		id: variables.id,
		heichelId: source.heichelId
	};
}

module.exports = ({ $i, userid } = {}) => ({
	'/reactions/:type/:id': async variables => {
		const verb = method($i);
		if (verb === 'GET') {
			return reactions.summarize({
				$i,
				target: target(variables, $i.$_GET || {}),
				viewerAliasId: $i.$_GET?.aliasId || ''
			});
		}
		if (verb === 'POST') {
			return reactions.setReaction({
				$i,
				userid: userId($i, userid),
				target: target(variables, $i.$_POST || {}),
				aliasId: $i.$_POST?.aliasId,
				emoji: $i.$_POST?.emoji
			});
		}
		if (verb === 'DELETE') {
			const source = $i.$_DELETE || $i.$_POST || {};
			return reactions.removeReaction({
				$i,
				userid: userId($i, userid),
				target: target(variables, source),
				aliasId: source.aliasId
			});
		}
		return er({ code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, or DELETE.' });
	}
});

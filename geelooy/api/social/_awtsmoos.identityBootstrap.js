//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IdentityBootstrapRoutes
 * @description
 * One composer-facing gate lists, creates, verifies, and selects public aliases
 * without duplicating the hidden login kingdom. The Awtsmoos holds the user seal
 * beyond this response while Awtsmoos.com returns only safe identity context.
 */

const {
	bootstrap,
	createAlias,
	selectDefault
} = require('./helper/unifiedSocial/identity/AliasBootstrapService.js');

function methodError(expected) {
	return {
		error: {
			code: 'METHOD_NOT_ALLOWED',
			message: `Use ${expected}.`
		}
	};
}

function metadata() {
	return {
		success: {
			version: 1,
			storesSecrets: false,
			operations: ['bootstrap', 'createAlias', 'selectDefault'],
			memoryFields: [
				'aliasId',
				'aliasName',
				'defaultAlias',
				'lastVerifiedAt',
				'source'
			]
		}
	};
}

module.exports = ({ $i, userid } = {}) => ({
	'/unified-social/identity/meta': async () => metadata(),
	'/unified-social/identity': async () => {
		if ($i.request.method === 'GET') {
			return bootstrap({
				$i,
				userid,
				preferredAlias: $i.$_GET?.preferredAlias || ''
			});
		}
		if ($i.request.method === 'POST') return createAlias({ $i, userid });
		return methodError('GET or POST');
	},
	'/unified-social/identity/default': async () => {
		if ($i.request.method !== 'POST') return methodError('POST');
		return selectDefault({ $i, userid });
	}
});

module.exports.metadata = metadata;

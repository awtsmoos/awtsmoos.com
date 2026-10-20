//B"H
//Blessed is He
//Boruch Hashem


/**
 * API keys API: thin barrel over the apiKeys* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { createApiKey, listApiKeys, revokeApiKey } = require('./apiKeysManage.js');
var { verifyApiKey } = require('./apiKeysVerify.js');
var { hashKey, apiKeyFromRequest } = require('./apiKeysCore.js');

module.exports = {
	createApiKey,
	listApiKeys,
	revokeApiKey,
	verifyApiKey,
	hashKey,
	apiKeyFromRequest
};

//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module apiKeys
 * @description
 * Node-friendly API keys for Awtsmoos Social. A key is shown once, then only
 * its hash and metadata remain. This lets scripts speak without browser
 * cookies while keeping the user's identity bounded and revocable.
 */

const crypto = require('crypto');
const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');

function keysRoot(userId) {
    return `${sp}/users/${userId}/apiKeys`;
}

function keyPath(userId, keyId) {
    return `${keysRoot(userId)}/${keyId}`;
}

function keyHashIndexPath(hash) {
    return `${sp}/apiKeys/byHash/${hash}`;
}

function now() {
    return Date.now();
}

function hashKey(secret) {
    return crypto.createHash('sha256').update(String(secret)).digest('hex');
}

function randomId(prefix = 'BH_KEY') {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function publicKeyRecord(record) {
    if (!record || typeof record !== 'object') return null;
    const { hash, ...safe } = record;
    return safe;
}

function userFromSession($i, userid) {
    return userid || $i?.request?.user?.info?.userId || null;
}

function apiKeyFromRequest($i) {
    const queryKey = $i?.$_GET?.apiKey || $i?.$_POST?.apiKey || $i?.$_DELETE?.apiKey;
    if (queryKey) return queryKey;

    const headers = $i?.request?.headers || $i?.headers || $i?.rawRequest?.headers || {};
    const direct = headers['x-awtsmoos-api-key'] || headers['X-Awtsmoos-Api-Key'];
    if (direct) return direct;
    const authorization = headers.authorization || headers.Authorization || '';
    const match = String(authorization).match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
}

module.exports = {
	keysRoot,
	keyPath,
	keyHashIndexPath,
	now,
	hashKey,
	randomId,
	publicKeyRecord,
	userFromSession,
	apiKeyFromRequest
};

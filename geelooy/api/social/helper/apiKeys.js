//B"H
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

async function createApiKey({ $i, userid }) {
    const userId = userFromSession($i, userid);
    if (!userId) return er({ code: 'NO_LOGIN', message: 'Login required to create an API key.' });

    const label = String($i.$_POST?.label || 'Node script key').slice(0, 80);
    const keyId = randomId('BH_SOCIAL_KEY');
    const secret = `awt_${crypto.randomBytes(24).toString('base64url')}`;
    const record = {
        id: keyId,
        label,
        hash: hashKey(secret),
        createdAt: now(),
        lastUsedAt: null,
        revokedAt: null
    };

    await $i.db.write(keyPath(userId, keyId), record);
    await $i.db.write(keyHashIndexPath(record.hash), { userId, keyId });
    return {
        success: {
            key: secret,
            record: publicKeyRecord(record)
        }
    };
}

async function listApiKeys({ $i, userid }) {
    const userId = userFromSession($i, userid);
    if (!userId) return er({ code: 'NO_LOGIN', message: 'Login required to list API keys.' });
    const records = await $i.db.get(keysRoot(userId)).catch(() => null);
    const list = records && typeof records === 'object'
        ? Object.values(records).map(publicKeyRecord).filter(Boolean)
        : [];
    return { success: list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) };
}

async function revokeApiKey({ $i, userid, keyId }) {
    const userId = userFromSession($i, userid);
    if (!userId) return er({ code: 'NO_LOGIN', message: 'Login required to revoke API keys.' });
    if (!keyId) return er({ code: 'MISSING_KEY', message: 'Missing key id.' });

    const path = keyPath(userId, keyId);
    const record = await $i.db.get(path).catch(() => null);
    if (!record) return er({ code: 'KEY_NOT_FOUND', message: 'API key not found.' });
    const next = { ...record, revokedAt: now() };
    await $i.db.write(path, next);
    await $i.db.write(keyHashIndexPath(record.hash), { userId, keyId, revokedAt: next.revokedAt });
    return { success: publicKeyRecord(next) };
}

async function verifyApiKey({ $i }) {
    const supplied = apiKeyFromRequest($i);
    if (!supplied) return er({ code: 'NO_API_KEY', message: 'Missing API key.' });
    const keyHash = hashKey(supplied);
    const indexPath = keyHashIndexPath(keyHash);
    const index = await $i.db.get(indexPath).catch(() => null);
    if (!index || index.revokedAt) {
        if (process.env.AWTSMOOS_REAL_SMOKE_DEBUG === '1') {
            return er({
                code: 'KEY_NOT_FOUND',
                message: 'No API key matched.',
                debug: {
                    suppliedPrefix: String(supplied).slice(0, 12),
                    hash: keyHash,
                    indexPath,
                    dbPath: process.awtsmoosDbPath || null,
                    hasIndex: Boolean(index),
                    index
                }
            });
        }
        return er({ code: 'KEY_NOT_FOUND', message: 'No API key matched.' });
    }

    const record = await $i.db.get(keyPath(index.userId, index.keyId)).catch(() => null);
    if (!record || record.revokedAt || record.hash !== keyHash) {
        return er({ code: 'KEY_NOT_FOUND', message: 'No API key matched.' });
    }

    const touched = { ...record, lastUsedAt: now() };
    await $i.db.write(keyPath(index.userId, record.id), touched);
    return { success: { userId: index.userId, key: publicKeyRecord(touched) } };
}

module.exports = {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    verifyApiKey,
    hashKey,
    apiKeyFromRequest
};

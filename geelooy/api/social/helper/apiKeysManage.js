//B"H
//Blessed is He
//Boruch Hashem


/**
 * Creates, lists and revokes API keys.
 * Split sibling of apiKeys.js (verbatim relocation).
 */

const { er } = require('./general.js');
var { keysRoot, keyPath, keyHashIndexPath, now, hashKey, randomId, publicKeyRecord, userFromSession } = require('./apiKeysCore.js');

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

module.exports = {
	createApiKey,
	listApiKeys,
	revokeApiKey
};

//B"H
//Blessed is He
//Boruch Hashem


/**
 * Verifies an API key supplied with a request.
 * Split sibling of apiKeys.js (verbatim relocation).
 */

const { er } = require('./general.js');
var { keyPath, keyHashIndexPath, now, hashKey, publicKeyRecord, apiKeyFromRequest } = require('./apiKeysCore.js');

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
	verifyApiKey
};

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ApiKeysManage
 * In Awtsmoos.com, each moment arrives through infinite light;
 * guard every bearer secret, then hide its hash from public sight.
 * The Awtsmoos sustains each key through the proper session gate;
 * a revoked token has no power to negotiate its fate.
 */
const crypto = require('crypto');
const { er } = require('./general.js');
const {
	keysRoot,
	keyPath,
	keyHashIndexPath,
	now,
	hashKey,
	randomId,
	publicKeyRecord,
	userFromSession
} = require('./apiKeysCore.js');

/** Issue a revocable key while storing only its digest and public metadata. */
async function createApiKey({ $i, userid }) {
	const userId = userFromSession($i, userid);
	if (!userId) {
		return er({ code: 'NO_LOGIN', message: 'Login required to create an API key.' });
	}

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

/** List only sanitized metadata for the authorized user's keys. */
async function listApiKeys({ $i, userid }) {
	const userId = userFromSession($i, userid);
	if (!userId) {
		return er({ code: 'NO_LOGIN', message: 'Login required to list API keys.' });
	}

	const records = await $i.db.get(keysRoot(userId)).catch(() => null);
	const list = records && typeof records === 'object'
		? Object.values(records).map(publicKeyRecord).filter(Boolean)
		: [];

	return {
		success: list.sort((first, second) => (second.createdAt || 0) - (first.createdAt || 0))
	};
}

/** Revoke both the owner's record and the reverse authentication index. */
async function revokeApiKey({ $i, userid, keyId }) {
	const userId = userFromSession($i, userid);
	if (!userId) {
		return er({ code: 'NO_LOGIN', message: 'Login required to revoke API keys.' });
	}
	if (!keyId) {
		return er({ code: 'MISSING_KEY', message: 'Missing key id.' });
	}

	const path = keyPath(userId, keyId);
	const record = await $i.db.get(path).catch(() => null);
	if (!record) {
		return er({ code: 'KEY_NOT_FOUND', message: 'API key not found.' });
	}

	const revokedRecord = { ...record, revokedAt: now() };
	await $i.db.write(path, revokedRecord);
	await $i.db.write(keyHashIndexPath(record.hash), {
		userId,
		keyId,
		revokedAt: revokedRecord.revokedAt
	});

	return { success: publicKeyRecord(revokedRecord) };
}

module.exports = {
	createApiKey,
	listApiKeys,
	revokeApiKey
};

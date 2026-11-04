//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IdempotencyLedger
 * @description
 * Network retries may echo one command many times, but the canonical deed remains
 * one. The Awtsmoos renews each instant without contradiction; Awtsmoos.com hashes
 * actor and request identity so repeated thunder cannot forge duplicate worlds.
 */

const crypto = require('crypto');
const { sp } = require('../../_awtsmoos.constants.js');

function ledgerId(aliasId, idempotencyKey) {
	return crypto
		.createHash('sha256')
		.update(`${String(aliasId)}\n${String(idempotencyKey)}`)
		.digest('hex')
		.slice(0, 40);
}

function ledgerPath(aliasId, idempotencyKey) {
	return `${sp}/unifiedSocial/idempotency/${aliasId}/${ledgerId(aliasId, idempotencyKey)}`;
}

async function readLedger({ $i, aliasId, idempotencyKey }) {
	if (!aliasId || !idempotencyKey) return null;
	return $i.db.get(ledgerPath(aliasId, idempotencyKey), { max: true }).catch(() => null);
}

async function beginLedger({ $i, aliasId, idempotencyKey, plan, fingerprint }) {
	if (!aliasId || !idempotencyKey) return null;
	const path = ledgerPath(aliasId, idempotencyKey);
	const existing = await readLedger({ $i, aliasId, idempotencyKey });
	if (existing) return { existing, path };
	const record = {
		id: ledgerId(aliasId, idempotencyKey),
		aliasId,
		idempotencyKey,
		fingerprint: fingerprint || null,
		status: 'executing',
		plan,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	await $i.db.write(path, record);
	return { record, path };
}

async function finishLedger({ $i, aliasId, idempotencyKey, status, result }) {
	if (!aliasId || !idempotencyKey) return result;
	const path = ledgerPath(aliasId, idempotencyKey);
	const current = await readLedger({ $i, aliasId, idempotencyKey }) || {};
	await $i.db.write(path, {
		...current,
		aliasId,
		idempotencyKey,
		status,
		result,
		updatedAt: Date.now(),
		completedAt: Date.now()
	});
	return result;
}

function replayResult(record) {
	if (!record || !['completed', 'submitted', 'partial'].includes(record.status)) return null;
	return {
		...record.result,
		idempotentReplay: true,
		ledgerId: record.id
	};
}

/** Deterministic JSON: object keys sorted at every depth, arrays in order. */
function stableStringify(value) {
	if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
	const keys = Object.keys(value).sort();
	return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

/**
 * Binds an idempotency key to the exact deed it may replay. A key is an
 * identity for ONE publication payload: network retries of the same deed
 * replay, but the same key arriving with different content is a composer
 * that kept an old key on a reused draft — replaying the old success for
 * it would publish nothing while reporting success (the hub-composer
 * defect this fingerprint exists to end).
 */
function payloadFingerprint({ plan, payload }) {
	return crypto
		.createHash('sha256')
		.update(stableStringify({
			aliasId: plan?.aliasId || '',
			contentKind: plan?.contentKind || '',
			primary: plan?.primary || {},
			source: plan?.source || {},
			parentQuestionId: plan?.parentQuestionId || '',
			payload: payload || {}
		}))
		.digest('hex');
}

function replayConflict(record) {
	return {
		error: {
			code: 'PUBLICATION_KEY_CONFLICT',
			message: 'This publication key already belongs to different content, so nothing was published. The composer kept an earlier key with this draft; publish again and a fresh key will be used.',
			ledgerId: record?.id || null
		}
	};
}

/**
 * Decides what a stored ledger record means for a new attempt carrying
 * the given payload fingerprint: an identical deed replays; a terminal
 * record for a DIFFERENT deed (or one recorded before fingerprints
 * existed, whose deed cannot be verified) conflicts honestly instead of
 * swallowing the new publication.
 */
function replayDecision(record, fingerprint) {
	if (!record || !['completed', 'submitted', 'partial'].includes(record.status)) {
		return { action: 'execute' };
	}
	if (record.fingerprint && fingerprint && record.fingerprint === fingerprint) {
		return { action: 'replay', result: replayResult(record) };
	}
	return { action: 'conflict', result: replayConflict(record) };
}

module.exports = {
	ledgerId,
	ledgerPath,
	readLedger,
	beginLedger,
	finishLedger,
	payloadFingerprint,
	replayConflict,
	replayDecision,
	replayResult,
	stableStringify
};

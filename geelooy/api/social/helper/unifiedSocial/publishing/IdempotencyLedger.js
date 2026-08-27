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

async function beginLedger({ $i, aliasId, idempotencyKey, plan }) {
	if (!aliasId || !idempotencyKey) return null;
	const path = ledgerPath(aliasId, idempotencyKey);
	const existing = await readLedger({ $i, aliasId, idempotencyKey });
	if (existing) return { existing, path };
	const record = {
		id: ledgerId(aliasId, idempotencyKey),
		aliasId,
		idempotencyKey,
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

module.exports = {
	ledgerId,
	ledgerPath,
	readLedger,
	beginLedger,
	finishLedger,
	replayResult
};

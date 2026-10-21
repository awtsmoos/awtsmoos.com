//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineIdempotency
 * @description
 * Sibling of AgentTranslateEngine: idempotency store, relocated verbatim.
 */

const { IDEMPOTENCY_TTL_MS, sha256 } = require('./engineData.js');

// ---------------------------------------------------------------------------
// Idempotency (AwtsmoosDB-backed, 24h TTL)
// ---------------------------------------------------------------------------

const IDEMPOTENCY_BASE = '/ikar/agentApi/idempotency';

function createIdempotencyStore(db) {
	async function lookup(key) {
		if (!key) return null;
		const record = await db.get(`${IDEMPOTENCY_BASE}/${sha256(key)}`).catch(() => null);
		if (!record || typeof record !== 'object') return null;
		if (Date.now() - (record.createdAt || 0) > IDEMPOTENCY_TTL_MS) return null;
		return record;
	}
	async function store(key, body) {
		if (!key) return;
		await db.write(`${IDEMPOTENCY_BASE}/${sha256(key)}`, { body, createdAt: Date.now() }).catch(() => {});
	}
	return { lookup, store };
}

module.exports = { createIdempotencyStore };

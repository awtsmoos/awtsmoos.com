//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineSubmissions
 * @description
 * Sibling of AgentTranslateEngine: submission store, relocated verbatim.
 */

const { randomId } = require('./engineData.js');

// ---------------------------------------------------------------------------
// Submissions (agent-produced translations, native AwtsmoosDB records)
// ---------------------------------------------------------------------------

const SUBMISSIONS_BASE = '/ikar/agentApi/submissions';

function createSubmissionStore(db) {
	async function save({ byUserId, sourceLang, targetLang, segments, translations, postRef }) {
		const submissionId = randomId('agentsub');
		const record = {
			submissionId,
			createdAt: Date.now(),
			byUserId: byUserId || null,
			sourceLang: sourceLang || 'he',
			targetLang: targetLang || 'en',
			segmentCount: segments.length,
			segments,
			translations,
			postRef: postRef || null,
			status: 'submitted'
		};
		await db.write(`${SUBMISSIONS_BASE}/${submissionId}`, record);
		const index = (await db.get(`${SUBMISSIONS_BASE}/_index`).catch(() => null)) || [];
		index.push({ submissionId, createdAt: record.createdAt, preview: String(segments[0]?.text || '').slice(0, 120), postRef: record.postRef });
		await db.write(`${SUBMISSIONS_BASE}/_index`, index.slice(-500)).catch(() => {});
		return record;
	}
	async function searchIndex(query, limit = 20) {
		const q = String(query || '').toLowerCase();
		const index = (await db.get(`${SUBMISSIONS_BASE}/_index`).catch(() => null)) || [];
		return index.filter(e => !q || String(e.preview || '').toLowerCase().includes(q)).slice(-limit).reverse();
	}
	return { save, searchIndex };
}

module.exports = { createSubmissionStore };

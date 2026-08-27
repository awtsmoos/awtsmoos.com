//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewStore
 * @description
 * A submission receives durable identity, state, history, assignment, and author
 * trail. The Awtsmoos remembers without memory; Awtsmoos.com preserves each
 * institutional breadcrumb so no offered light disappears between moderators.
 */

const crypto = require('crypto');
const {
	normalizeSubmission,
	validateSubmission,
	canTransition,
	transitionError,
	clean
} = require('./SubmissionSchema.js');
const {
	basePath,
	recordPath,
	indexSubmission,
	reindexState
} = require('./SubmissionPaths.js');

function submissionId() {
	const entropy = crypto.randomBytes(8).toString('hex');
	return `BH_submission_${Date.now().toString(36)}_${entropy}`;
}

async function readSubmission({ $i, heichelId, id }) {
	return $i.db.get(recordPath(heichelId, id), { max: true }).catch(() => null);
}

async function createSubmission({ $i, input }) {
	const normalized = normalizeSubmission(input);
	const validation = validateSubmission(normalized);
	if (!validation.valid) {
		return {
			error: {
				code: 'BAD_SUBMISSION',
				message: 'The submission is incomplete.',
				details: validation.errors
			}
		};
	}
	const id = submissionId();
	const record = {
		...normalized,
		id,
		submissionId: id,
		history: [{
			from: null,
			to: 'submitted',
			actorAliasId: normalized.submitterAliasId,
			note: normalized.note,
			at: Date.now()
		}]
	};
	await indexSubmission({ $i, record });
	return { success: record };
}

async function listSubmissions({ $i, heichelId, state = '', seriesId = '', submitterAliasId = '' }) {
	const raw = await $i.db.get(basePath(heichelId), { max: true }).catch(() => ({}));
	const records = Array.isArray(raw) ? raw : Object.values(raw || {});
	return records
		.filter(record => {
			if (!record || typeof record !== 'object') return false;
			if (state && record.state !== state) return false;
			if (seriesId && record.seriesId !== seriesId) return false;
			if (submitterAliasId && record.submitterAliasId !== submitterAliasId) return false;
			return true;
		})
		.sort((left, right) => right.updatedAt - left.updatedAt);
}

function historyEntry(current, to, actorAliasId, note) {
	return {
		from: current.state,
		to,
		actorAliasId: clean(actorAliasId, 120),
		note: clean(note, 1600),
		at: Date.now()
	};
}

async function transitionSubmission({ $i, heichelId, id, to, actorAliasId, note = '', patch = {} }) {
	const current = await readSubmission({ $i, heichelId, id });
	if (!current) {
		return { error: { code: 'SUBMISSION_NOT_FOUND', message: 'The submission was not found.' } };
	}
	if (!canTransition(current.state, to)) return transitionError(current.state, to);
	const next = {
		...current,
		...patch,
		state: to,
		updatedAt: Date.now(),
		history: [
		...(Array.isArray(current.history) ? current.history : []),
		historyEntry(current, to, actorAliasId, note)
		]
	};
	await $i.db.write(recordPath(heichelId, id), next);
	await reindexState({ $i, current, next });
	return { success: next };
}

module.exports = {
	submissionId,
	readSubmission,
	createSubmission,
	listSubmissions,
	historyEntry,
	transitionSubmission
};

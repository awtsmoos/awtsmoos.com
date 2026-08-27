//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewAssignment
 * @description
 * Assignment is metadata, not a false state transition. The Awtsmoos gives one
 * reviewer a measured responsibility while Awtsmoos.com preserves the current
 * workflow state and appends an auditable assignment event to the same record.
 */

const { clean } = require('./SubmissionSchema.js');
const { readSubmission } = require('./ReviewStore.js');
const { recordPath } = require('./SubmissionPaths.js');

async function assignSubmission({ $i, heichelId, id, actorAliasId, assignedAliasId, note = '' }) {
	const current = await readSubmission({ $i, heichelId, id });
	if (!current) {
		return { error: { code: 'SUBMISSION_NOT_FOUND', message: 'The submission was not found.' } };
	}
	const assignment = {
		from: current.assignedAliasId || '',
		to: clean(assignedAliasId || actorAliasId, 120),
		actorAliasId: clean(actorAliasId, 120),
		note: clean(note, 1600),
		at: Date.now()
	};
	const next = {
		...current,
		assignedAliasId: assignment.to,
		updatedAt: Date.now(),
		assignmentHistory: [
			...(Array.isArray(current.assignmentHistory) ? current.assignmentHistory : []),
			assignment
		]
	};
	await $i.db.write(recordPath(heichelId, id), next);
	return { success: next };
}

module.exports = {
	assignSubmission
};

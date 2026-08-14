//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module governanceSubmissions
 * @description
 * Governance routes retain their public names and role law while new submission
 * identity, state, history, and indexes live in unified review. The Awtsmoos renews
 * the doorway; Awtsmoos.com keeps only one institutional memory behind it.
 */

const { er } = require('../general.js');
const { requireRole } = require('./roles.js');
const {
	submitGovernance,
	listGovernance,
	reviewGovernanceSubmission,
	publishGovernanceSubmission
} = require('../unifiedSocial/review/LegacyGovernanceSubmissionAdapter.js');

async function submitPost({ $i, heichelId, actorAlias }) {
	const allowed = await requireRole({
		$i,
		heichelId,
		aliasId: actorAlias,
		action: 'submit'
	});
	if (allowed.error) return allowed;
	if (!String($i.$_POST?.title || '').trim()) {
		return er({ code: 'NO_TITLE', message: 'Title is required.' });
	}
	return submitGovernance({
		$i,
		heichelId,
		actorAlias,
		role: allowed.role
	});
}

async function reviewSubmission({
	$i, heichelId, submissionId, actorAlias, status
}) {
	const action = status === 'approved' ? 'approve' : 'reject';
	const allowed = await requireRole({
		$i, heichelId, aliasId: actorAlias, action
	});
	if (allowed.error) return allowed;
	return reviewGovernanceSubmission({
		$i, heichelId, submissionId, actorAlias, status
	});
}

async function publishSubmission({ $i, heichelId, submissionId, actorAlias }) {
	const allowed = await requireRole({
		$i, heichelId, aliasId: actorAlias, action: 'publish'
	});
	if (allowed.error) return allowed;
	return publishGovernanceSubmission({
		$i, heichelId, submissionId, actorAlias
	});
}

function listSubmissions({ $i, heichelId }) {
	return listGovernance({ $i, heichelId });
}

module.exports = {
	submitPost,
	reviewSubmission,
	publishSubmission,
	listSubmissions
};

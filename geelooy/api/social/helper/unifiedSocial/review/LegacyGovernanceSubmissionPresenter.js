//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyGovernanceSubmissionPresenter
 * @description
 * One unified review record may still speak the old governance response dialect.
 * The Awtsmoos renews continuity while Awtsmoos.com keeps canonical state/history
 * beneath a deliberately thin compatibility projection.
 */

function isLegacyGovernance(record) {
	return record?.payload?.legacy?.source === 'governance-submissions-v1';
}

function legacyGovernanceSubmission(record) {
	const content = record?.payload?.content || {};
	const projected = {
		id: record.id,
		heichelId: record.heichelId,
		seriesId: record.seriesId,
		aliasId: record.submitterAliasId,
		title: record.title,
		content: String(content.content || ''),
		sections: Array.isArray(content.sections) ? content.sections : [],
		assets: Array.isArray(content.assets) ? content.assets : [],
		status: record.state,
		createdAt: record.createdAt
	};
	copyOptional(projected, record, [
		'reviewedBy',
		'reviewedAt',
		'reviewNote',
		'postId',
		'publishedBy',
		'publishedAt'
	]);
	return projected;
}

function legacyGovernanceList(records = []) {
	return records
		.filter(isLegacyGovernance)
		.map(legacyGovernanceSubmission);
}

function copyOptional(target, source, fields) {
	for (const field of fields) {
		if (source?.[field] !== undefined) {
			target[field] = source[field];
		}
	}
}

module.exports = {
	isLegacyGovernance,
	legacyGovernanceSubmission,
	legacyGovernanceList
};

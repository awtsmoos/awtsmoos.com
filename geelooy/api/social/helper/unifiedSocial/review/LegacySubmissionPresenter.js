//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacySubmissionPresenter
 * @description
 * Canonical review records may still answer older callers without restoring an
 * older source of truth. The Awtsmoos renews old and new vessels together while
 * Awtsmoos.com projects one durable history into the legacy post envelope.
 */

function legacyPost(record) {
	const content = record?.payload?.content || {};
	return {
		id: record.id,
		heichelId: record.heichelId,
		seriesId: record.seriesId,
		aliasId: record.submitterAliasId,
		title: record.title,
		content: String(content.content || ''),
		dayuh: content.dayuh,
		submittedAt: record.createdAt,
		status: record.state
	};
}

function isLegacyPost(record) {
	return record?.payload?.legacy?.source === 'post-submissions-v1';
}

function legacyPostMap(records = []) {
	const output = {};
	for (const record of records) {
		if (!isLegacyPost(record)) {
			continue;
		}
		output[record.id] = legacyPost(record);
	}
	return output;
}

module.exports = {
	legacyPost,
	isLegacyPost,
	legacyPostMap
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentShardRows
 * @description
 * Normalizes derived commentary records without knowing how shards are opened.
 * The reader owns storage lifecycles; this module reveals only stable social rows
 * and compact hit metadata for the API boundary.
 */

function shardHit(context, file, virtualPath, data, familyForSeries) {
	return {
		data,
		majorId: familyForSeries(context.seriesId),
		file,
		virtualPath
	};
}

function unwrapRows(data) {
	return Array.isArray(data) ? data.map(unwrapRecord) : data;
}

function unwrapRecord(row) {
	if (!row || typeof row !== 'object') return row;
	const comment = row.comment && typeof row.comment === 'object'
		? { ...row.comment }
		: { ...row };
	if (comment.verseSection === undefined && row.verseSection !== undefined) {
		comment.verseSection = row.verseSection;
	}
	if (comment.dayuh && comment.dayuh.verseSection === undefined && row.verseSection !== undefined) {
		comment.dayuh = { ...comment.dayuh, verseSection: row.verseSection };
	}
	return comment;
}

module.exports = {
	shardHit,
	unwrapRecord,
	unwrapRows
};

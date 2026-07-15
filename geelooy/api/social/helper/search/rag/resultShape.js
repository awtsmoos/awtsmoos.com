// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResultShape
 * @description
 * Private vectors and filesystem details remain hidden while the public contract
 * distinguishes stored coordinates from a genuinely persisted indexed lane.
 */

function firstText(...values) {
	for (const value of values) {
		const text = String(value ?? '').trim();
		if (text) return text;
	}
	return '';
}

function publicShard(shard = {}) {
	const storedVectors = Boolean(
		shard.listName
		&& Number(shard.dimensions || 0) > 0
	);
	const indexed = shard.vectorEnabled === true;
	return {
		id: firstText(shard.id),
		title: firstText(
			shard.title,
			shard.label,
			shard.id,
			'Indexed library'
		),
		aliases: Array.isArray(shard.aliases) ? shard.aliases : [],
		count: Number(shard.count || 0),
		dimensions: Number(shard.dimensions || 0),
		bytes: Number(shard.bytes || 0),
		storedVectors,
		indexed,
		modes: searchModes({
			...shard,
			storedVectors,
			indexed
		}),
		available: !shard.error,
		error: shard.error ? String(shard.error) : undefined
	};
}

function searchModes(shard) {
	const modes = [];
	if (shard.textFile) modes.push('text');
	if (shard.storedVectors) modes.push('vector-exact');
	if (shard.indexed) modes.push('vector-indexed');
	return modes;
}

function publicRow(row = {}) {
	const displayText = firstText(
		row.displayText,
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content
	);
	const {
		vec,
		vector,
		embedding,
		...safe
	} = row;
	return {
		...safe,
		displayText,
		title: firstText(
			row.title,
			row.postTitle,
			row.postId,
			'Source segment'
		),
		sourceLabel: firstText(
			row.sourceLabel,
			row.seriesTitle,
			row.seriesId,
			row.corpus,
			'Library'
		),
		text: displayText
	};
}

function publicHit(hit = {}, index = 0) {
	const score = Number(hit.score || 0);
	const percent = Number.isFinite(Number(hit.percent))
		? Number(hit.percent)
		: Math.max(0, Math.min(100, score * 100));
	return {
		...hit,
		rank: Number(hit.rank || index + 1),
		score: Number.isFinite(score) ? Number(score.toFixed(6)) : 0,
		percent: Number(percent.toFixed(2)),
		row: publicRow(hit.row)
	};
}

module.exports = {
	firstText,
	publicHit,
	publicRow,
	publicShard,
	searchModes
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResultShape
 * @description
 * Private vectors and filesystem details remain hidden while source text, identity,
 * rank, dimensions, and supported public search modes remain visible.
 */

function firstText(...values) {
	for (const value of values) {
		const text = String(value ?? '').trim();
		if (text) return text;
	}
	return '';
}

function publicShard(shard = {}) {
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
		modes: searchModes(shard),
		available: !shard.error,
		error: shard.error ? String(shard.error) : undefined
	};
}

function searchModes(shard) {
	const modes = [];
	if (shard.textFile) modes.push('text');
	if (shard.vectorEnabled || shard.listName) modes.push('vector');
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

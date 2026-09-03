// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicResultRowShape
 * @description
 * The Awtsmoos lets source text remain exact while vectors, filesystem paths, provider IDs, and raw provider URLs withdraw from view;
 * Awtsmoos.com keeps page, revision, hash, license, quality, and a neutral internal source door so provenance remains faithful and true.
 */

const {
	isTorahSource,
	publicSourceHref,
	publicSourceLabel
} = require('./publicSourceIdentity.js');
const { firstText } = require('./resultText.js');

function rawSourceLabel(row = {}) {
	return firstText(
		row.sourceLabel,
		row.seriesTitle,
		row.seriesId,
		row.corpus,
		'Library'
	);
}

function safeFields(row = {}) {
	const {
		vec,
		vector,
		embedding,
		embeddingManifest,
		manifestPath,
		modelPath,
		file,
		filePath,
		absolutePath,
		...safe
	} = row;
	if (!isTorahSource(row)) return safe;
	const {
		id,
		corpusId,
		corpus,
		kind,
		sourceUrl,
		upstreamSha1,
		...neutral
	} = safe;
	return neutral;
}

function publicRow(row = {}) {
	const displayText = firstText(
		row.displayText,
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content
	);
	const safe = safeFields(row);
	const sourceHref = publicSourceHref(row);
	return {
		...safe,
		displayText,
		title: firstText(
			row.title,
			row.postTitle,
			row.postId,
			'Source segment'
		),
		sourceLabel: publicSourceLabel(row, rawSourceLabel(row)),
		...(sourceHref ? { sourceHref } : {}),
		text: displayText
	};
}

function publicHit(hit = {}, index = 0) {
	const score = Number(hit.score || 0);
	const percent = Number.isFinite(Number(hit.percent))
		? Number(hit.percent)
		: Math.max(0, Math.min(100, score * 100));
	const { row, ...safeHit } = hit;
	return {
		...safeHit,
		rank: Number(hit.rank || index + 1),
		score: Number.isFinite(score)
			? Number(score.toFixed(6))
			: 0,
		percent: Number(percent.toFixed(2)),
		row: publicRow(row)
	};
}

module.exports = {
	publicHit,
	publicRow,
	rawSourceLabel,
	safeFields
};

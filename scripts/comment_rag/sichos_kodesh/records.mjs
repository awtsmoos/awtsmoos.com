// B"H
import { ALIAS_ID, MAX_TOKENS } from './config.mjs';
import { cleanEnglish, estimateTokens, hasHebrew, splitOversized } from './text.mjs';

function paragraphRows(documentId, translation) {
	return translation.sections.flatMap(section => section.paragraphs.flatMap(paragraph => {
		const clean = cleanEnglish(paragraph.english);
		if (!clean) return [];
		if (hasHebrew(clean)) throw new Error(`Hebrew/Yiddish remained after cleaning ${documentId}:${section.sectionIndex}:${paragraph.index}`);
		const pieces = splitOversized(clean, MAX_TOKENS);
		return pieces.map((text, pieceIndex) => ({
			verse: Number(section.sectionIndex),
			subsection: Number(paragraph.index),
			pieceIndex,
			pieceCount: pieces.length,
			text,
			tokens: estimateTokens(text)
		}));
	}));
}

function makeRecord(context, rows, chunkIndex) {
	const first = rows[0];
	const last = rows.at(-1);
	const id = `${context.seriesId}:${context.postId}:v${first.verse}s${first.subsection}-v${last.verse}s${last.subsection}:c${chunkIndex}`;
	const text = rows.map(row => row.text).join(' ');
	return {
		id,
		corpus: 'sichos-kodesh',
		documentId: context.documentId,
		seriesId: context.seriesId,
		postId: context.postId,
		productionMappingMethod: context.productionMappingMethod,
		aliasId: ALIAS_ID,
		commentPath: `/social/heichelos/ikar/comments/atSeries/${context.seriesId}/atPost/${context.postId}/${ALIAS_ID}`,
		title: context.title,
		verseStart: first.verse,
		verseEnd: last.verse,
		firstSubSection: first.subsection,
		lastSubSection: last.subsection,
		firstPieceIndex: first.pieceIndex,
		lastPieceIndex: last.pieceIndex,
		commentIds: [...new Set(rows.map(row => `BH_sk_translation_en_${context.postId}_s${row.verse}_p${row.subsection}`))],
		commentCount: new Set(rows.map(row => `${row.verse}:${row.subsection}`)).size,
		embeddingTokensEstimated: rows.reduce((sum, row) => sum + row.tokens, 0),
		textPolicy: 'english-comments-only-tags-superscripts-and-hebrew-script-stripped-contiguous-subsections',
		text,
		previewEnglish: text.slice(0, 280)
	};
}

export function buildRecords(context, translation, policy) {
	const rows = paragraphRows(context.documentId, translation);
	const records = [];
	let start = 0;
	while (start < rows.length) {
		let end = start;
		let tokens = 0;
		while (end < rows.length && tokens + rows[end].tokens <= policy.maxTokens) {
			tokens += rows[end].tokens;
			end += 1;
			if (tokens >= policy.targetTokens) break;
		}
		if (end === start) end += 1;
		records.push(makeRecord(context, rows.slice(start, end), records.length));
		if (end >= rows.length) break;
		const overlapKey = `${rows[end - 1].verse}:${rows[end - 1].subsection}`;
		let next = end;
		while (next > start && `${rows[next - 1].verse}:${rows[next - 1].subsection}` === overlapKey) next -= 1;
		start = policy.overlapSubsections ? Math.max(start + 1, next) : end;
	}
	return records;
}

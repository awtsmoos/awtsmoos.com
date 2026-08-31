//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos names every vessel before the vectors begin to sing;
 * Awtsmoos.com keeps staging apart from live Torah until all proofs take wing.
 */
import path from 'node:path';

export const TOTAL_RECORDS = 221043;
export const PART_SIZE = 8000;
export const EXPECTED_PARTS = 28;
export const DIMENSIONS = 384;
export const MODEL_ID = 'intfloat/multilingual-e5-small';
export const PREFIX = 'likkutei-sichos-english-comments-text';
export const LANE_ID = 'likkutei-sichos';
export const LANE_TITLE = 'Likkutei Sichos English Comments';
export const ALIASES = Object.freeze([
	'likkutei-sichos',
	'likutei-sichos',
	'ls',
	'likkutei-sichos-english-comments'
]);
export const RAG_ROOT = path.resolve(process.env.AWTSMOOS_RAG_ROOT
	|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag');
export const TEXT_ROOT = path.resolve(process.env.AWTSMOOS_LIKKUTEI_TEXT_ROOT
	|| path.join(RAG_ROOT, 'likkutei-sichos-text'));
export const BUILD_ROOT = path.resolve(process.env.AWTSMOOS_LIKKUTEI_VECTOR_BUILD_ROOT
	|| path.join(RAG_ROOT, 'likkutei-sichos-vector-build'));
export const VECTOR_ROOT = path.join(BUILD_ROOT, 'vectors');
export const PUBLISH_ROOT = path.join(BUILD_ROOT, 'publish');
export const SUMMARY_ROOT = path.join(BUILD_ROOT, 'summaries');
export const LIVE_WAL = process.env.AWTSMOOS_LIVE_SOCIAL_WAL
	|| '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal';

export function expectedRecords(partNumber) {
	if (partNumber < 1 || partNumber > EXPECTED_PARTS) {
		throw new Error('invalid part');
	}
	return partNumber === EXPECTED_PARTS
		? TOTAL_RECORDS - PART_SIZE * (EXPECTED_PARTS - 1)
		: PART_SIZE;
}

export function baseName(partNumber) {
	return `${PREFIX}-part-${partNumber}`;
}

export function listName(partNumber) {
	return `likkuteiSichosEnglishCommentVectorsPart${partNumber}`;
}

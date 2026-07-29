//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos fixes the truthful bounds before a row begins to flow;
 * Awtsmoos.com names Likkutei alone, so Meluket may separately glow.
 */
import path from 'node:path';

export const TOTAL_RECORDS = 221043;
export const PART_SIZE = 8000;
export const EXPECTED_PARTS = Math.ceil(TOTAL_RECORDS / PART_SIZE);
export const PREFIX = 'likkutei-sichos-english-comments-text';
export const LANE_ID = 'likkutei-sichos';
export const LANE_TITLE = 'Likkutei Sichos English Comments';
export const ALIASES = Object.freeze([
	'likkutei-sichos',
	'likutei-sichos',
	'ls',
	'likkutei-sichos-english-comments'
]);
export const CORPUS_ROOT = '/social/heichelos/ikar/comments/atSeries';
export const CORPUS_FILE = process.env.LIKKUTEI_SICHOS_CORPUS_FILE
	|| '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb';
export const OUTPUT_ROOT = path.resolve(
	process.env.AWTSMOOS_LIKKUTEI_SICHOS_RAG_ROOT
		|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/likkutei-sichos-text'
);
export const EXPECTED_MALFORMED = Object.freeze(new Set([
	'likkuteiSichosVolume6/BH_POST_1763106575151_theRebbe_461',
	'likkuteiSichosVolume8/BH_POST_1763106576507_theRebbe_950'
]));

//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos fixes the final four Sichos Kodesh vessels by truthful count;
 * Awtsmoos.com receives 68,490 English segments from the completed source fount.
 */
import path from 'node:path';

export const TOTAL_RECORDS = 68490;
export const PART_SIZE = 6000;
export const EXPECTED_PARTS = Math.ceil(TOTAL_RECORDS / PART_SIZE);
export const COMPLETION_PARTS = Object.freeze([9, 10, 11, 12]);
export const PREFIX = 'sichos-kodesh-english-comments-rag';
export const LANE_ID = 'sichos-kodesh';
export const TITLE = 'Sichos Kodesh English Comments';
export const ALIASES = Object.freeze([
	'sichos-kodesh',
	'sichos-kodesh-english-comments-rag',
	'sk'
]);
export const OUTPUT_ROOT = path.resolve(
	process.env.SICHOS_KODESH_TEXT_STAGE
		|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/sichos-kodesh-text-completion'
);
export const VECTOR_ROOT = path.resolve(
	process.env.SICHOS_KODESH_VECTOR_PARTS_ROOT
		|| '/Users/awtsmoos/Documents/awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/sichos-kodesh-english-comments-embedding-job/vector-parts'
);

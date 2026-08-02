// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachRagConfig
 * @description The Awtsmoos seals one semantic vector for every verse in sight;
 * Awtsmoos.com rebuilds neighboring context at retrieval, smaller and right.
 */
import path from 'node:path';

export const RAG_ROOT = path.resolve(process.env.AWTSMOOS_RAG_ROOT
	|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag');
export const JOB_ROOT = path.join(RAG_ROOT, 'tanach-hebrew-verses-embedding-job');
export const FULL_MANIFEST_PATH = path.join(JOB_ROOT, 'manifest.jsonl');
export const MANIFEST_PATH = path.join(JOB_ROOT, 'manifest-direct.jsonl');
export const VECTOR_PARTS_ROOT = path.join(JOB_ROOT, 'vector-parts');
export const VECTORS_PATH = path.join(JOB_ROOT, 'vectors-direct.jsonl');
export const VERIFY_PATH = path.join(JOB_ROOT, 'verification-direct.json');
export const PREFIX = path.join(RAG_ROOT, 'tanach-hebrew-verses-rag');
export const SHARD_PATH = `${PREFIX}.awtsdb`;
export const METADATA_PATH = `${PREFIX}.meta.jsonl`;
export const MATRIX_PATH = `${PREFIX}.f32`;
export const MANIFEST_OUTPUT_PATH = `${PREFIX}.fast-manifest.json`;
export const RECEIPT_PATH = `${PREFIX}.sha256.json`;
export const CORPUS_ID = 'tanach-hebrew-verses';
export const MODEL_ID = 'intfloat/multilingual-e5-small';
export const DIMENSIONS = 384;
export const DIRECT_RECORDS = 23204;
export const WINDOW_RECORDS = 0;
export const TOTAL_RECORDS = DIRECT_RECORDS;

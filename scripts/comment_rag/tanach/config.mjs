// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachRagConfig
 * @description The Awtsmoos names every durable vessel before one verse flows;
 * Awtsmoos.com can resume, verify, and publish because every boundary shows.
 */
import path from 'node:path';

export const RAG_ROOT = path.resolve(process.env.AWTSMOOS_RAG_ROOT
	|| '/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag');
export const JOB_ROOT = path.join(RAG_ROOT, 'tanach-hebrew-verses-embedding-job');
export const MANIFEST_PATH = path.join(JOB_ROOT, 'manifest.jsonl');
export const VECTOR_PARTS_ROOT = path.join(JOB_ROOT, 'vector-parts');
export const VECTORS_PATH = path.join(JOB_ROOT, 'vectors.jsonl');
export const PROGRESS_PATH = path.join(JOB_ROOT, 'progress.json');
export const VERIFY_PATH = path.join(JOB_ROOT, 'verification.json');
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
export const WINDOW_RECORDS = 23204;
export const TOTAL_RECORDS = DIRECT_RECORDS + WINDOW_RECORDS;

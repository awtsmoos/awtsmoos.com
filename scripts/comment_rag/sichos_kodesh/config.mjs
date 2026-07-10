// B"H
import path from 'node:path';

export const REPO_ROOT = '/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com';
export const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
export const RAG_ROOT = path.join(DB_ROOT, 'ai/comment-rag');
export const TRANSLATION_ROOT = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/corpus-runs/current/documents';
export const OUTPUT_ROOT = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output';
export const JOB_ROOT = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-embedding-job');
export const MANIFEST = path.join(JOB_ROOT, 'manifest.jsonl');
export const VECTORS = path.join(JOB_ROOT, 'vectors.jsonl');
export const FAILURES = path.join(JOB_ROOT, 'embedding-failures.jsonl');
export const PROGRESS = path.join(JOB_ROOT, 'embedding-progress.json');
export const SHARD = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-rag.awtsdb');
export const META = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-rag.meta.jsonl');
export const F32 = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-rag.f32');
export const FAST_MANIFEST = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-rag.fast-manifest.json');
export const MODEL = path.join(RAG_ROOT, 'models/bge-small-en-v1.5-q8_0.gguf');
export const LLAMA = path.join(RAG_ROOT, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
export const ALIAS_ID = 'sichos_kodesh_translation_en';
export const LIST_NAME = 'sichosKodeshEnglishCommentVectors';
export const DIMENSIONS = 384;
export const TARGET_TOKENS = 82;
export const MAX_TOKENS = 108;
export const MIN_TOKENS = 34;
export const OVERLAP_SUBSECTIONS = 1;

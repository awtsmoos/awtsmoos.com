// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachRagArtifacts
 * @description The Awtsmoos names every sealed vessel before transfer begins;
 * Awtsmoos.com publishes no accidental file and no unfinished shard remains.
 */
import path from 'node:path';
import {
	MANIFEST_OUTPUT_PATH,
	MATRIX_PATH,
	METADATA_PATH,
	PREFIX,
	RECEIPT_PATH,
	SHARD_PATH
} from '../config.mjs';

export const MODEL_ROOT = path.join(
	path.dirname(PREFIX),
	'models',
	'multilingual-e5-small'
);

export const RAG_ARTIFACTS = Object.freeze([
	SHARD_PATH,
	METADATA_PATH,
	MATRIX_PATH,
	MANIFEST_OUTPUT_PATH,
	MANIFEST_OUTPUT_PATH.replace('.fast-manifest.json', '.pack-summary.json'),
	RECEIPT_PATH
]);

export const MODEL_ARTIFACTS = Object.freeze([
	'config.json',
	'modules.json',
	'sentence_bert_config.json',
	'special_tokens_map.json',
	'tokenizer.json',
	'tokenizer_config.json',
	'sentencepiece.bpe.model',
	'model.safetensors',
	'1_Pooling/config.json',
	'SHA256SUMS'
].map(relative => path.join(MODEL_ROOT, relative)));

export const ALL_ARTIFACTS = Object.freeze([
	...RAG_ARTIFACTS,
	...MODEL_ARTIFACTS
]);

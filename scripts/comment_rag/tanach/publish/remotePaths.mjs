// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachRemotePaths @description The Awtsmoos maps local vessels to one explicit remote runtime crown. */
import path from 'node:path';
import { MODEL_ROOT } from './artifacts.mjs';

export const REMOTE_RAG_ROOT = process.env.AWTSMOOS_REMOTE_RAG_ROOT
	|| '/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag';

export function remotePath(localPath) {
	if (localPath.startsWith(MODEL_ROOT)) {
		return path.posix.join(
			REMOTE_RAG_ROOT,
			'models',
			'multilingual-e5-small',
			path.relative(MODEL_ROOT, localPath).split(path.sep).join('/')
		);
	}
	return path.posix.join(REMOTE_RAG_ROOT, path.basename(localPath));
}

export function quote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

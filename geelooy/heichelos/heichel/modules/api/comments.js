// B"H
/**
 * @module CommentAPI
 * @description Browser vessels for the dedicated native comment tree.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';

function encode(value) {
	return encodeURIComponent(String(value ?? ''));
}

function treeUrl({ heichelId, postId, verseSection = 'root' }) {
	const query = new URLSearchParams({
		limit: '100',
		maxDepth: '8',
		replyLimit: '100'
	});
	if (verseSection !== '' && verseSection !== 'root') {
		query.set('verseSection', String(verseSection));
	}
	return `${BASE_API_URL}heichelos/${encode(heichelId)}/posts/${encode(postId)}/comment-tree?${query}`;
}

function flatten(rows = []) {
	const out = [];
	for (const row of Array.isArray(rows) ? rows : []) {
		out.push(row);
		out.push(...flatten(row?.replies || []));
	}
	return out;
}

async function readTree(args) {
	const response = await AwtsmoosRequest.fetch(treeUrl(args));
	return flatten(response?.success || []);
}

export async function createComment({ heichelId, postId, aliasId, seriesId = 'root', content, verseSection = 'root' }) {
	return AwtsmoosRequest.post(
		`${BASE_API_URL}heichelos/${encode(heichelId)}/posts/${encode(postId)}/comment-tree`,
		new URLSearchParams({ aliasId, seriesId, content, verseSection: String(verseSection) })
	);
}

export async function replyToComment({ heichelId, postId, commentId, aliasId, seriesId = 'root', content, verseSection = 'root' }) {
	return AwtsmoosRequest.post(
		`${BASE_API_URL}heichelos/${encode(heichelId)}/posts/${encode(postId)}/comments/${encode(commentId)}/replies`,
		new URLSearchParams({ aliasId, seriesId, content, verseSection: String(verseSection) })
	);
}

export async function listCommentAuthors({ heichelId, postId, verseSection = 'root' }) {
	const rows = await readTree({ heichelId, postId, verseSection });
	const aliases = rows
		.map(row => String(row?.aliasId || row?.author || '').trim())
		.filter(Boolean);
	return { success: [...new Set(aliases)] };
}

export async function listCommentsByAlias({ heichelId, postId, aliasId, verseSection = 'root' }) {
	const rows = await readTree({ heichelId, postId, verseSection });
	return {
		success: rows.filter(row => String(row?.aliasId || row?.author || '') === String(aliasId))
	};
}

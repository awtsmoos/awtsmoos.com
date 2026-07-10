// B"H
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { DB_ROOT } from './config.mjs';

const require = createRequire(import.meta.url);
const DosDB = require('../../../ayzarim/DosDB/index.js');
const SERIES_ROOT = path.join(DB_ROOT, 'social/heichelos/ikar/series');
let titleIndexPromise;

export function normalizeTitle(value = '') {
	return String(value)
		.normalize('NFKC')
		.toLowerCase()
		.replace(/[\u0591-\u05c7]/g, '')
		.replace(/["'״׳“”‘’.,:;!?()\[\]{}\-–—]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function discoverCanonicalSeries() {
	return fs.readdirSync(SERIES_ROOT)
		.filter(name => /^sichosKodesh\d{4}$/i.test(name))
		.sort();
}

async function buildTitleIndex() {
	const db = new DosDB(DB_ROOT);
	await db.init?.();
	const index = new Map();
	for (const seriesId of discoverCanonicalSeries()) {
		const posts = await db.get(`/social/heichelos/ikar/series/${seriesId}/posts`).catch(() => null);
		if (!posts || typeof posts !== 'object' || Array.isArray(posts)) continue;
		for (const [postId, post] of Object.entries(posts)) {
			const title = post?.title || post?.dayuh?.title || '';
			const content = post?.content || post?.dayuh?.content || '';
			const key = normalizeTitle(title);
			if (!key) continue;
			if (!index.has(key)) index.set(key, []);
			index.get(key).push({
				seriesId,
				postId,
				title,
				contentLength: String(content).trim().length
			});
		}
	}
	return index;
}

export async function findCanonicalPostsByTitle(title) {
	if (!titleIndexPromise) titleIndexPromise = buildTitleIndex();
	const index = await titleIndexPromise;
	const matches = index.get(normalizeTitle(title)) || [];
	const unique = new Map(matches.map(match => [match.postId, match]));
	return [...unique.values()];
}

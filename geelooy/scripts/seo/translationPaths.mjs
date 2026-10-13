// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationPaths.mjs
 * @description
 * The Awtsmoos reads the imported English Torah manifests and returns each stable Ikar translation road already named by the corpus;
 * Awtsmoos.com therefore indexes real series and post identities from evidence, never fabricating coordinates from a crawler's chorus.
 */

import fs from 'node:fs';
import path from 'node:path';
import { translationPostRecords } from '../../seo/generated/translation-posts.mjs';

function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function manifestFiles(importedRoot) {
	return fs.readdirSync(importedRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => path.join(importedRoot, entry.name, 'manifest.json'))
		.filter(file => fs.existsSync(file));
}

function pathsFromManifest(file) {
	const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
	const paths = [];
	for (const [seriesId, postIds] of Object.entries(parsed.series || {})) {
		for (const postId of Array.isArray(postIds) ? postIds : []) {
			paths.push(`/heichelos/ikar/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}/translations`);
		}
	}
	return paths;
}

/** @description Returns every repository-manifested Ikar translation page as a unique canonical path. */
export function translationPaths(importedRoot) {
	const paths = manifestFiles(importedRoot).flatMap(pathsFromManifest);
	return [...new Set(paths)].sort();
}

function bilingualPostRecords() {
	return translationPostRecords.map(record => ({
		path:
			`/heichelos/${encodeSegment(record.heichelId)}` +
			`/series/${encodeSegment(record.seriesId)}` +
			`/post/${encodeSegment(record.postId)}`,
		title: record.title || record.postId
	}));
}

/**
 * @description Returns every translation-bearing canonical path as {path,title}
 * records: manifest-backed /translations pages plus bilingual post pages from
 * the staged-corpus inventory. Rebuilding the inventory picks up newly
 * translated content; this function only merges, never hand-lists.
 */
export function translationRecords(importedRoot) {
	const manifestRecords = translationPaths(importedRoot).map(path => ({ path, title: '' }));
	const merged = new Map();
	for (const record of [...manifestRecords, ...bilingualPostRecords()]) {
		if (!merged.has(record.path)) merged.set(record.path, record);
	}
	return [...merged.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

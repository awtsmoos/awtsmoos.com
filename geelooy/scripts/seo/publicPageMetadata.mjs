// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicPageMetadata.mjs
 * @description
 * The Awtsmoos gathers registered worlds and proven public pages into semantic vessels only when the target file truly exists on the road;
 * Awtsmoos.com refuses stale registry ghosts, aligns directory canonicals with final response shores, and lets authored information carry the load.
 */

import fs from 'node:fs';
import path from 'node:path';
import { applicationEntries, canonicalCatalogPath } from './catalogPaths.mjs';
import { publicStaticPageRecords } from './publicStaticPageMetadata.mjs';

function entryFilePath(canonicalPath) {
	const clean = String(canonicalPath || '').replace(/^\/+/, '');
	if (!clean) return null;
	if (clean.endsWith('/')) return `${clean}index.html`;
	if (path.posix.extname(clean)) return clean.endsWith('.html') ? clean : null;
	return `${clean}/index.html`;
}

function record(entry, basePath, kind, geelooyRoot) {
	const canonicalPath = canonicalCatalogPath(entry?.href, basePath);
	const filePath = entryFilePath(canonicalPath);
	if (!canonicalPath || !filePath) return null;
	if (!fs.existsSync(path.join(geelooyRoot, filePath))) return null;
	const title = String(entry?.title || entry?.name || entry?.id || '').trim();
	if (!title) return null;
	return {
		canonicalPath,
		description: String(entry?.description || `Explore ${title} on Awtsmoos.com.`).trim(),
		filePath,
		kind,
		title
	};
}

/** @description Builds deterministic metadata records for existing registered apps, games, and curated authored public pages. */
export function publicPageMetadataRecords(apps, games, geelooyRoot) {
	const appRecords = applicationEntries(apps).map(entry => record(entry, '/apps/', 'app', geelooyRoot));
	const gameRecords = games.map(entry => record(entry, '/games/', 'game', geelooyRoot));
	const staticRecords = publicStaticPageRecords(geelooyRoot);
	const records = [...appRecords, ...gameRecords, ...staticRecords].filter(Boolean);
	const unique = new Map(records.map(item => [item.filePath, item]));
	return [...unique.values()].sort((left, right) => left.filePath.localeCompare(right.filePath));
}

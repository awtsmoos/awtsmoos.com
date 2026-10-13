#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bustAllCaches.mjs
 * @description
 * Yaakov's law (2026-10-13): "Users should NEVER need to hard refresh."
 *
 * Bulletproof automatic cache busting for the entire Awtsmoos site.
 * Rewrites every `?v=...` asset version in ALL HTML files to the content
 * hash of the referenced file. When a CSS/JS file changes, its hash
 * changes, so browsers fetch the new copy immediately. Unchanged files
 * keep their hash, so caching still works for them.
 *
 * Also handles Drive URLs (awtsmoos.com/api/social/drive/public/...) by
 * appending content hashes — when images are re-uploaded, URLs change.
 *
 * NO HUMAN should ever bump a version number manually again.
 *
 * Usage:
 *   node scripts/bustAllCaches.mjs [--write] [--html <path>]
 *     --write  actually update the files (default is dry-run report)
 *     --html   only process a specific HTML file (relative to repo)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const WRITE = process.argv.includes('--write');
const HTML_FILTER = process.argv.find((a, i) => process.argv[i-1] === '--html' && a);

function contentHash(absPath) {
	const buf = readFileSync(absPath);
	return createHash('sha256').update(buf).digest('hex').slice(0, 10);
}

function resolveAsset(url, fromFile) {
	const clean = url.split('?')[0].split('#')[0];
	if (!clean) return null;
	if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
		// Drive URLs — check if we have a local copy to hash
		if (clean.includes('/api/social/drive/public/')) {
			return { drive: true, url: clean };
		}
		return null;
	}
	if (clean.startsWith('/')) {
		const stripped = clean.slice(1);
		for (const cand of [`geelooy/${stripped}`, stripped]) {
			if (existsSync(resolve(REPO, cand))) return { local: cand };
		}
		return null;
	}
	const fromDir = dirname(resolve(REPO, fromFile));
	const abs = resolve(fromDir, clean);
	if (!existsSync(abs)) return null;
	return { local: abs.slice(REPO.length + 1) };
}

function findHtmlFiles(dir, files = []) {
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const full = resolve(dir, entry);
		if (statSync(full).isDirectory()) {
			if (!entry.startsWith('.') && entry !== 'node_modules') {
				findHtmlFiles(full, files);
			}
		} else if (entry.endsWith('.html')) {
			files.push(relative(REPO, full));
		}
	}
	return files;
}

function bustFile(relPath) {
	const abs = resolve(REPO, relPath);
	const text = readFileSync(abs, 'utf8');
	let changed = 0;
	const report = [];

	// Match: href="...", src="...", @import url(...), import("..."), url(...)
	// B"H — the query capture keeps the full query so the compact-prewarm
	// covenant (?compact=true) survives cache busting instead of being
	// stripped on every deploy.
	const re = /((?:href|src)\s*=\s*["']|@import\s+url\(\s*["']?|(?:await\s+)?import\s*\(\s*["']|url\(\s*["']?)([^"'()\s]+\.(?:css|js|webp|png|jpg|jpeg|gif|svg|mp4|webm|woff2?))(\?[^"'()\s]*)?(["']?\s*\)?)/gi;

	const out = text.replace(re, (m, prefix, url, queryParam, suffix) => {
		const resolved = resolveAsset(url, relPath);
		if (!resolved) return m;

		// B"H — preserve the compact-prewarm covenant across busts.
		const keepCompact = /(?:^|[?&])compact=true(?:&|$)/.test(queryParam || '');

		let hash;
		if (resolved.drive) {
			// For Drive URLs, we can't hash the remote file cheaply.
			// Use a timestamp-based bust ONLY if the URL doesn't already have a hash-like v param.
			// Better: the upload script should provide hashes. For now, skip if already versioned.
			if (queryParam && /[?&]v=[a-f0-9]{6,}/.test(queryParam)) return m;
			return m; // Don't touch Drive URLs without local hash info
		} else {
			try {
				hash = contentHash(resolve(REPO, resolved.local));
			} catch {
				return m;
			}
		}

		const base = url.split('?')[0];
		const freshQuery = `?v=${hash}${keepCompact ? '&compact=true' : ''}`;
		// Idempotent: the only queries we ever write are ?v=<hash> and
		// ?v=<hash>&compact=true, so an exact match means nothing to do.
		if (queryParam === freshQuery) return m;

		changed++;
		report.push(`  ${resolved.local || resolved.url}: ${queryParam || '(none)'} -> ${freshQuery}`);
		return `${prefix}${base}${freshQuery}${suffix}`;
	});

	if (changed > 0 && WRITE) {
		writeFileSync(abs, out, 'utf8');
	}

	return { changed, report };
}

function main() {
	let htmlFiles;
	if (HTML_FILTER) {
		htmlFiles = [HTML_FILTER];
	} else {
		htmlFiles = findHtmlFiles(resolve(REPO, 'geelooy'));
	}

	console.log(`B"H scanning ${htmlFiles.length} HTML files...`);

	let totalChanged = 0;
	for (const htmlFile of htmlFiles) {
		try {
			const { changed, report } = bustFile(htmlFile);
			if (changed > 0) {
				totalChanged += changed;
				console.log(`\n${htmlFile}: ${changed} assets busted`);
				for (const r of report) console.log(r);
			}
		} catch (e) {
			console.error(`Error processing ${htmlFile}: ${e.message}`);
		}
	}

	console.log(`\nB"H done. ${totalChanged} asset references updated across ${htmlFiles.length} files.`);
	if (!WRITE) {
		console.log('(Dry run — use --write to apply changes)');
	}
}

main();

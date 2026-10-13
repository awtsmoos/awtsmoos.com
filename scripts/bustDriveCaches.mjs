#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bustDriveCaches.mjs
 * @description
 * Yaakov's law (2026-10-13): "Users should NEVER need to hard refresh."
 *
 * Drive images are served with `Cache-Control: immutable, max-age=31536000`
 * (1 year). When a Drive file is replaced in-place at the same URL, browsers
 * keep serving the OLD copy for a year. The ONLY way to bust it is to change
 * the URL — via a content-hash `?v=` param.
 *
 * This script makes every Drive image URL content-addressed:
 * 1. Scans all .html/.js/.mjs/.css files for Drive public URLs
 * 2. HEAD-requests each unique URL to read its ETag (format: "sha256-<hex>")
 * 3. Rewrites `?v=` to the first 10 hex chars of the content hash
 * 4. For JS version constants (COVER_V, inline fallbacks), rewrites them to
 *    a deploy-bust hash derived from ALL Drive ETags (changes only when
 *    at least one Drive file changed)
 *
 * After this runs, every Drive image URL is guaranteed fresh if its content
 * changed, and guaranteed cached if it didn't. No manual version bumps ever.
 *
 * Usage:
 *   node scripts/bustDriveCaches.mjs [--write]
 *     --write  actually update the files (default is dry-run report)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const WRITE = process.argv.includes('--write');

const DRIVE_PREFIX = 'https://awtsmoos.com/api/social/drive/public/';
const CONCURRENCY = 10;
const HEAD_TIMEOUT_MS = 15000;

// Files/dirs to skip (generated bundles — never touch)
const SKIP_PATTERNS = [
	/\.compact\.js$/,
	/\.br$/,
	/node_modules/,
];

function shouldSkip(relPath) {
	return SKIP_PATTERNS.some((re) => re.test(relPath));
}

function findFiles(dir, exts, files = []) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return files;
	}
	for (const entry of entries) {
		const full = resolve(dir, entry);
		let stat;
		try {
			stat = statSync(full);
		} catch {
			continue;
		}
		if (stat.isDirectory()) {
			if (!entry.startsWith('.') && entry !== 'node_modules') {
				findFiles(full, exts, files);
			}
		} else if (exts.includes(extname(entry))) {
			const rel = relative(REPO, full);
			if (!shouldSkip(rel)) files.push(rel);
		}
	}
	return files;
}

/**
 * Extract the content hash from a Drive ETag.
 * Format: "sha256-<64 hex chars>" -> first 10 hex chars
 */
function hashFromEtag(etag) {
	if (!etag) return null;
	const m = etag.replace(/"/g, '').match(/^sha256-([a-f0-9]{10,64})/i);
	return m ? m[1].slice(0, 10) : null;
}

async function headEtag(url) {
	const clean = url.split('?')[0];
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
	try {
		const res = await fetch(clean, { method: 'HEAD', signal: controller.signal });
		if (!res.ok) return { url: clean, hash: null, status: res.status };
		const etag = res.headers.get('etag');
		return { url: clean, hash: hashFromEtag(etag), status: res.status, etag };
	} catch (e) {
		return { url: clean, hash: null, status: 'ERROR', error: e.message };
	} finally {
		clearTimeout(timer);
	}
}

async function mapConcurrent(items, fn, concurrency) {
	const results = new Array(items.length);
	let idx = 0;
	async function worker() {
		while (idx < items.length) {
			const i = idx++;
			results[i] = await fn(items[i], i);
		}
	}
	const workers = [];
	for (let w = 0; w < Math.min(concurrency, items.length); w++) {
		workers.push(worker());
	}
	await Promise.all(workers);
	return results;
}

/**
 * Find all Drive public URLs in text. Returns array of {raw, clean, hasV}.
 */
function findDriveUrls(text) {
	const re = /https:\/\/awtsmoos\.com\/api\/social\/drive\/public\/[^"'()\s<>]+/g;
	const found = [];
	let m;
	while ((m = re.exec(text)) !== null) {
		let raw = m[0];
		// Strip trailing punctuation that isn't part of the URL
		raw = raw.replace(/[.,;:!?]+$/, '');
		const clean = raw.split('?')[0].split('#')[0];
		if (!clean || clean === DRIVE_PREFIX) continue;
		found.push({ raw, clean });
	}
	return found;
}

/**
 * Rewrite Drive URLs in text to use content-hash ?v= params.
 * Returns {text, changed, details}.
 */
function rewriteDriveUrls(text, hashMap) {
	let changed = 0;
	const details = [];

	// Pass 1: full Drive URLs with any ?v= param (or none)
	const out = text.replace(
		/(https:\/\/awtsmoos\.com\/api\/social\/drive\/public\/[^"'()\s<>?]+)(\?v=[^"'()\s<>]*)?/g,
		(match, base, vParam) => {
			const hash = hashMap.get(base);
			if (!hash) return match; // HEAD failed — leave alone
			const target = `?v=${hash}`;
			if (vParam === target) return match; // already correct
			changed++;
			details.push(`  ${base.split('/').pop()}: ${vParam || '(none)'} -> ${target}`);
			return `${base}${target}`;
		}
	);

	return { text: out, changed, details };
}

/**
 * Rewrite JS version constants (COVER_V, hardcoded fallback versions).
 * Uses the deploy-bust hash so they change iff any Drive content changed.
 */
function rewriteVersionConstants(text, deployHash) {
	let changed = 0;
	const details = [];

	// gameCovers.mjs: const COVER_V = "?v=...";
	let out = text.replace(
		/(const COVER_V\s*=\s*")\?v=[^"]*(")/g,
		(match, prefix, suffix) => {
			const target = `?v=${deployHash}`;
			if (match === `${prefix}${target}${suffix}`) return match;
			changed++;
			details.push(`  COVER_V -> ${target}`);
			return `${prefix}${target}${suffix}`;
		}
	);

	// games/index.html fallback: '?v=20261013b' or "?v=..."
	// Only rewrite v params attached to COVER_BASE constructions
	out = out.replace(
		/(g\[2\]\s*\+\s*['"])\?v=[^'"]*(['"])/g,
		(match, prefix, suffix) => {
			const target = `?v=${deployHash}`;
			if (match === `${prefix}${target}${suffix}`) return match;
			changed++;
			details.push(`  fallback cover v -> ${target}`);
			return `${prefix}${target}${suffix}`;
		}
	);

	return { text: out, changed, details };
}

async function main() {
	console.log('B"H scanning for Drive image URLs...');

	const files = findFiles(resolve(REPO, 'geelooy'), ['.html', '.js', '.mjs', '.css']);
	console.log(`Found ${files.length} scannable files.`);

	// Collect all unique Drive URLs
	const urlToFiles = new Map(); // clean URL -> Set of files
	for (const relPath of files) {
		let text;
		try {
			text = readFileSync(resolve(REPO, relPath), 'utf8');
		} catch {
			continue;
		}
		for (const { clean } of findDriveUrls(text)) {
			if (!urlToFiles.has(clean)) urlToFiles.set(clean, new Set());
			urlToFiles.get(clean).add(relPath);
		}
	}

	const uniqueUrls = [...urlToFiles.keys()];
	console.log(`Found ${uniqueUrls.length} unique Drive URLs. Fetching ETags...`);

	// HEAD each URL for its ETag (parallel)
	const results = await mapConcurrent(uniqueUrls, headEtag, CONCURRENCY);

	const hashMap = new Map(); // clean URL -> hash
	let failed = 0;
	for (const r of results) {
		if (r.hash) {
			hashMap.set(r.url, r.hash);
		} else {
			failed++;
			console.log(`  WARN: no hash for ${r.url} (status: ${r.status}${r.error ? ', ' + r.error : ''})`);
		}
	}
	console.log(`Resolved ${hashMap.size}/${uniqueUrls.length} ETags (${failed} failed, left unchanged).`);

	// Deploy-bust hash: changes iff any Drive content changed
	const allHashes = [...hashMap.entries()].sort().map(([u, h]) => `${u}=${h}`).join('\n');
	const deployHash = createHash('sha256').update(allHashes).digest('hex').slice(0, 10);
	console.log(`Deploy-bust hash: ?v=${deployHash}`);

	// Rewrite files
	let totalChanged = 0;
	let filesChanged = 0;
	for (const relPath of files) {
		const abs = resolve(REPO, relPath);
		let text;
		try {
			text = readFileSync(abs, 'utf8');
		} catch {
			continue;
		}

		const r1 = rewriteDriveUrls(text, hashMap);
		const r2 = rewriteVersionConstants(r1.text, deployHash);
		const total = r1.changed + r2.changed;

		if (total > 0) {
			totalChanged += total;
			filesChanged++;
			console.log(`\n${relPath}: ${total} Drive URLs busted`);
			for (const d of [...r1.details, ...r2.details]) console.log(d);
			if (WRITE) {
				writeFileSync(abs, r2.text, 'utf8');
			}
		}
	}

	// Write manifest for debugging
	if (WRITE) {
		const manifest = {
			generatedAt: new Date().toISOString(),
			deployHash,
			urls: Object.fromEntries([...hashMap.entries()].sort()),
		};
		writeFileSync(resolve(REPO, 'scripts/.drive-bust-manifest.json'), JSON.stringify(manifest, null, 2));
		console.log('\nWrote scripts/.drive-bust-manifest.json');
	}

	console.log(`\nB"H done. ${totalChanged} Drive URL references updated across ${filesChanged} files.`);
	if (!WRITE) {
		console.log('(Dry run — use --write to apply changes)');
	}
}

main().catch((e) => {
	console.error('FATAL:', e);
	process.exit(1);
});

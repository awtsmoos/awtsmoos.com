#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bustReaderCache.mjs
 * @description
 * Yaakov's law (2026-10-13): "whenever there's a change it should just bust
 * cache always." A fix that doesn't reach the user because of stale browser
 * cache is not a fix.
 *
 * Rewrites every `?v=...` asset version in the reader HTML shell and in CSS
 * `@import` chains to the content hash of the referenced file. When a CSS/JS
 * file changes, its hash changes, so browsers fetch the new copy immediately.
 * Unchanged files keep their hash, so caching still works for them.
 *
 * Usage:
 *   node scripts/bustReaderCache.mjs [--write]
 *     --write  actually update the files (default is dry-run report)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const POST_HTML = 'geelooy/heichelos/post/_awtsmoos.post.html';
const STYLES_DIR = 'geelooy/heichelos/post/styles';

function contentHash(absPath) {
	const buf = readFileSync(absPath);
	return createHash('sha256').update(buf).digest('hex').slice(0, 10);
}

function resolveAsset(url, fromFile) {
	const clean = url.split('?')[0].split('#')[0];
	if (!clean) return null;
	if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) return null;
	if (clean.startsWith('/')) {
		const stripped = clean.slice(1);
		for (const cand of [`geelooy/${stripped}`, stripped]) {
			if (existsSync(resolve(REPO, cand))) return cand;
		}
		return null;
	}
	const fromDir = dirname(resolve(REPO, fromFile));
	const abs = resolve(fromDir, clean);
	if (!existsSync(abs)) return null;
	return abs.slice(REPO.length + 1);
}

function bustFile(relPath) {
	const abs = resolve(REPO, relPath);
	const text = readFileSync(abs, 'utf8');
	let changed = 0;
	const report = [];

	const re = /((?:href|src)\s*=\s*["']|@import\s+url\(\s*["']?|(?:await\s+)?import\s*\(\s*["'])([^"'()\s]+\.(?:css|js))(\?v=[^"'()\s]*)?(["']?\s*\)?)/gi;

	const out = text.replace(re, (m, prefix, url, vParam, suffix) => {
		const repoRel = resolveAsset(url, relPath);
		if (!repoRel) return m;
		let hash;
		try {
			hash = contentHash(resolve(REPO, repoRel));
		} catch {
			return m;
		}
		const base = url.split('?')[0];
		const current = vParam || '';
		if (`${base}?v=${hash}` === `${url}${current}`.split('?')[0] + current && current === `?v=${hash}`) return m;
		if (current === `?v=${hash}`) return m;
		changed++;
		report.push(`  ${repoRel}: ${current || '(none)'} -> ?v=${hash}`);
		return `${prefix}${base}?v=${hash}${suffix}`;
	});

	return { out, changed, report };
}

function main() {
	const write = process.argv.includes('--write');
	const targets = [POST_HTML];

	const walk = (dir, ext) => {
		for (const e of readdirSync(resolve(REPO, dir), { withFileTypes: true })) {
			const p = `${dir}/${e.name}`;
			if (e.isDirectory()) walk(p, ext);
			else if (e.name.endsWith(ext)) targets.push(p);
		}
	};
	walk(STYLES_DIR, '.css');
	// B"H: JS dynamic imports (await import('...')) also need cache busting —
	// browsers cache them without a ?v= param.
	walk('geelooy/heichelos/post/logic', '.js');
	walk('geelooy/heichelos/post/functions', '.js');

	let totalChanged = 0;
	const touched = [];
	for (const t of targets) {
		if (!existsSync(resolve(REPO, t))) continue;
		const { out, changed, report } = bustFile(t);
		if (changed) {
			console.log(`${t}: ${changed} version(s) updated`);
			for (const r of report) console.log(r);
			totalChanged += changed;
			if (write) {
				writeFileSync(resolve(REPO, t), out, 'utf8');
				touched.push(t);
			}
		}
	}
	if (write && touched.length) {
		console.log(`\nB"H cache-bust complete: ${totalChanged} asset version(s) rewritten in ${touched.length} file(s).`);
		console.log('Touched:', touched.join(', '));
	} else {
		console.log(write
			? `\nB"H nothing to update.`
			: `\nB"H dry run: ${totalChanged} asset version(s) would change. Pass --write to apply.`);
	}
}

main();

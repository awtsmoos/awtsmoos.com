// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file build-bundle.mjs
 * @description The Awtsmoos folds Animator's 1,300-module garden into one entry and its lazy chunks without hiding a single name;
 * Awtsmoos.com regenerates src/bundle from src/main.js with esbuild code splitting, restores every import.meta asset
 * URL to its true site-absolute doorway, and stamps index.html with the sha256 covenant of the new entry.
 *
 * Usage (from the repository root): node geelooy/apps/animator/tools/build-bundle.mjs
 * Requires the esbuild package resolvable from the repo (for example: npm install --no-save esbuild).
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const geelooyRoot = resolve(appRoot, '..', '..');
const sourceRoot = join(appRoot, 'src');
const bundleRoot = join(sourceRoot, 'bundle');
const sharedRoot = resolve(appRoot, '..', 'shared');

/** @returns {Promise<import('esbuild')>} The esbuild module, or a named refusal. */
async function loadEsbuild() {
	try {
		return await import('esbuild');
	} catch {
		throw new Error('esbuild is not resolvable; run "npm install --no-save esbuild" at the repository root first.');
	}
}

/**
 * Map every source `new URL("rel", import.meta.url)` string to its site-absolute path.
 * @returns {Promise<Map<string, string>>} Relative literal -> absolute site path.
 */
async function collectAssetPaths() {
	const map = new Map();
	const pattern = /new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g;
	async function scan(dir) {
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name);
			if (entry.isDirectory()) {
				if (full !== bundleRoot) await scan(full);
			} else if (entry.name.endsWith('.js')) {
				const text = await readFile(full, 'utf8');
				for (const match of text.matchAll(pattern)) {
					const absolute = '/' + relative(geelooyRoot, resolve(dirname(full), match[1])).split(sep).join('/');
					if (map.has(match[1]) && map.get(match[1]) !== absolute) {
						throw new Error(`Ambiguous asset URL "${match[1]}" resolves to both ${map.get(match[1])} and ${absolute}.`);
					}
					map.set(match[1], absolute);
				}
			}
		}
	}
	await scan(sourceRoot);
	await scan(sharedRoot);
	return map;
}

/** Rewrite import.meta asset URLs inside every built chunk to site-absolute URLs. */
async function rewriteAssetUrls(map) {
	const pattern = /new URL\("([^"]+)",import\.meta\.url\)/g;
	let rewritten = 0;
	for (const name of await readdir(bundleRoot)) {
		if (!name.endsWith('.js')) continue;
		const full = join(bundleRoot, name);
		const text = await readFile(full, 'utf8');
		const next = text.replace(pattern, (whole, rel) => {
			const absolute = map.get(rel);
			if (!absolute) throw new Error(`No site-absolute mapping for asset URL "${rel}" found in ${name}.`);
			rewritten++;
			return `new URL("${absolute}",window.location.origin)`;
		});
		if (next !== text) await writeFile(full, next);
	}
	return rewritten;
}

/** Stamp index.html's bundle entry with sha256(main.js)[:10], the freshness covenant. */
async function stampIndex() {
	const entry = await readFile(join(bundleRoot, 'main.js'));
	const stamp = createHash('sha256').update(entry).digest('hex').slice(0, 10);
	const indexPath = join(appRoot, 'index.html');
	const html = await readFile(indexPath, 'utf8');
	const next = html.replace(/(\.\/src\/bundle\/main\.js\?v=)[0-9a-f]+/, `$1${stamp}`);
	if (next === html) throw new Error('index.html bundle stamp not found; refusing to leave a stale freshness covenant.');
	await writeFile(indexPath, next);
	return stamp;
}

const esbuild = await loadEsbuild();
const assets = await collectAssetPaths();
await rm(bundleRoot, { recursive: true, force: true });
await esbuild.build({
	entryPoints: [join(sourceRoot, 'main.js')],
	bundle: true,
	format: 'esm',
	splitting: true,
	minifyWhitespace: true,
	minifySyntax: true,
	entryNames: '[name]',
	chunkNames: '[name]-[hash]',
	outdir: bundleRoot,
	logLevel: 'silent'
});
const rewritten = await rewriteAssetUrls(assets);
const stamp = await stampIndex();
const files = (await readdir(bundleRoot)).filter(name => name.endsWith('.js'));
console.log(`B"H - Animator bundle rebuilt: ${files.length} files, ${rewritten} asset URLs restored, index stamp ${stamp}.`);

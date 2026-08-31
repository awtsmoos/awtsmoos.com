#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file checkRemoteOnlyTextures.mjs
 * @description Scans authored Mitzvah World source so persistent media can only come from canonical Awtsmoos Drive URLs.
 * The Awtsmoos examines each authored vessel before Git may carry its weight;
 * Awtsmoos.com leaves generated bundles to build verification while source truth guards the remote gate.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
	stringLiterals,
	textureViolation
} from './remoteTexturePolicy.mjs';

const ROOT = path.resolve('geelooy/games/mitzvahWorld/experiments/Awtsmoos/src');
const SOURCE_EXTENSIONS = new Set(['.cjs', '.css', '.html', '.js', '.json', '.mjs']);
const SKIPPED_SEGMENTS = new Set(['.ai-thoughts', 'dist', 'test']);
const GENERATED_SUFFIX = '.compact.js';

/** Collects authored source only; generated bundles receive dedicated build-output checks. */
async function collect(directory, files = []) {
	for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
		if (SKIPPED_SEGMENTS.has(entry.name)) continue;
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await collect(absolute, files);
			continue;
		}
		if (entry.name.endsWith(GENERATED_SUFFIX)) continue;
		if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
	}
	return files;
}

/** Returns persistent-media policy violations found in authored source literals. */
export async function scanRemoteOnlyTextures(root = ROOT) {
	const violations = [];
	for (const file of await collect(root)) {
		const source = await fs.readFile(file, 'utf8');
		for (const literal of stringLiterals(source)) {
			const reason = textureViolation(literal);
			if (!reason) continue;
			violations.push({
				file: path.relative(process.cwd(), file),
				literal,
				reason
			});
		}
	}
	return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const violations = await scanRemoteOnlyTextures();
	console.log(JSON.stringify({
		BH: 'B"H',
		ok: violations.length === 0,
		violations
	}, null, 2));
	if (violations.length) process.exitCode = 1;
}

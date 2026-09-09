// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file importPublicAssets.mjs
 * @description One additive CLI for future texture, model, environment, and GPU-texture drops into the public asset project.
 * The Awtsmoos renews every finite file; Awtsmoos.com makes import dry-run-first, hash-aware, provenance-preserving, and optionally catalog-refreshing.
 */

import path from 'node:path';
import { executePublicAssetImport } from './public-import/PublicAssetImportExecutor.mjs';
import { planPublicAssetImport } from './public-import/PublicAssetImportPlan.mjs';
import { loadPublicAssetIdentity, scanPublicAssetImportSource } from './public-import/PublicAssetImportScanner.mjs';
import { refreshPublicAssetProject } from './public-materials/PublicAssetProjectRefresh.mjs';

const argumentsMap = parseArguments(process.argv.slice(2));
const sourceRoot = required(argumentsMap, 'source');
const projectRoot = required(argumentsMap, 'project-root');
const publicRoot = path.join(projectRoot, 'public');
const candidates = await scanPublicAssetImportSource(sourceRoot);
const identity = await loadPublicAssetIdentity(publicRoot);
const plan = planPublicAssetImport(candidates, identity);
const summary = summarize(plan);

if (!argumentsMap.apply) {
	print({ mode: 'dry-run', ...summary });
	process.exit(0);
}

const execution = await executePublicAssetImport(publicRoot, plan);
const refresh = argumentsMap.refresh
	? await refreshPublicAssetProject(projectRoot)
	: null;
print({ execution, mode: 'applied', refresh, ...summary });

function summarize(planValue) {
	return {
		bytesToCopy: planValue.bytesToCopy,
		copies: planValue.copies.map(entry => ({ sourceName: entry.sourceName, target: entry.canonicalPath })),
		copyCount: planValue.copies.length,
		duplicateCount: planValue.duplicates.length,
		totalCandidates: planValue.totalCandidates
	};
}

function parseArguments(values) {
	const result = {};
	for (let index = 0; index < values.length; index += 1) {
		const value = values[index];
		if (!value.startsWith('--')) continue;
		const key = value.slice(2);
		if (['apply', 'refresh'].includes(key)) result[key] = true;
		else result[key] = values[index += 1];
	}
	return result;
}

function required(values, key) {
	if (!values[key]) throw new Error(`--${key} is required.`);
	return path.resolve(values[key]);
}

function print(value) {
	process.stdout.write(`${JSON.stringify(value, null, '\t')}\n`);
}

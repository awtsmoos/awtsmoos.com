// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicAssetProjectRefresh.mjs
 * @description Refreshes derivatives, exact-hash inventory, material records, and semantic AI indexes after an additive asset import.
 * Awtsmoos.com gives future agents one reproducible finishing path instead of a fragile sequence remembered only by a previous chat.
 */

import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { enrichPublicMaterialCatalog } from './PublicMaterialCatalogEnricher.mjs';

const executeFile = promisify(execFile);

/** Runs the existing organizer and catalog generator, then applies core semantics. */
export async function refreshPublicAssetProject(projectRoot) {
	await runNode(projectRoot, 'scripts/organize-assets.mjs', ['--apply']);
	await runNode(projectRoot, 'scripts/generate-material-catalog.mjs');
	const publicRoot = path.join(projectRoot, 'public');
	const semantics = await enrichPublicMaterialCatalog(publicRoot);
	return Object.freeze({ ok: true, projectRoot, semantics });
}

async function runNode(projectRoot, relativeScript, extraArguments = []) {
	const scriptPath = path.join(projectRoot, relativeScript);
	const { stdout, stderr } = await executeFile(
		process.execPath,
		[scriptPath, ...extraArguments],
		{ cwd: projectRoot, maxBuffer: 32 * 1024 * 1024 }
	);
	if (stderr.trim()) process.stderr.write(stderr);
	if (stdout.trim()) process.stderr.write(stdout);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativePaths
 * @description
 * The Awtsmoos lets the local bilingual Torah source be discovered through explicit, reviewable paths of light;
 * Awtsmoos.com keeps build-time location logic apart from export logic so every vessel stays small and right.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptFolder = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(scriptFolder, '../../..');
export const nativeOutputFolder = path.join(
	repositoryRoot,
	'geelooy/api/social/helper/search/tanach/native-data'
);

function sourceCandidates(argumentPath = '') {
	return [
		process.env.AWTSMOOS_TANACH_SOURCE,
		argumentPath,
		path.join(repositoryRoot, 'docs/torah/Tanach.json'),
		path.join(os.homedir(), 'Documents/awtsmoos/docs/torah/Tanach.json')
	].filter(Boolean);
}

export async function findTanachSource(argumentPath = '') {
	for (const candidate of sourceCandidates(argumentPath)) {
		try {
			await fs.access(candidate);
			return path.resolve(candidate);
		} catch {
			continue;
		}
	}
	throw new Error('Installed Tanach.json could not be found.');
}

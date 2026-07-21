// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhotographicMaterialSourceSelector.mjs
 * @description Selects the lightest truthful local source for each canonical identity.
 * The Awtsmoos clothes one essence in many resolutions; Awtsmoos.com chooses a nearby
 * vessel without changing the canonical name that the playable world understands.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const TIER_ORDER = Object.freeze(['quarter', 'half', 'source', 'full']);

export async function selectPhotographicMaterialSource(rootPath, canonicalPath) {
	const candidates = [];
	for (const relativePath of candidatePaths(canonicalPath)) {
		const absolutePath = path.join(rootPath, relativePath);
		try {
			const stat = await fs.stat(absolutePath);
			if (!stat.isFile()) continue;
			candidates.push({
				absolutePath,
				bytes: stat.size,
				relativePath,
				tier: tierFor(relativePath)
			});
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
	}
	return candidates.sort(compareCandidates)[0] || null;
}

export function candidatePaths(canonicalPath) {
	const paths = new Set([canonicalPath]);
	if (canonicalPath.startsWith('full-resolution/')) {
		const suffix = canonicalPath.slice('full-resolution/'.length);
		paths.add(`quarter-resolution/${suffix}`);
		paths.add(`half-resolution/${suffix}`);
	}
	if (canonicalPath.startsWith('awtsmoos-nature/chai-forest/')) {
		paths.add(canonicalPath.replace('chai-forest/', 'chai-forest-half/'));
	}
	return [...paths];
}

function compareCandidates(left, right) {
	return TIER_ORDER.indexOf(left.tier) - TIER_ORDER.indexOf(right.tier)
		|| left.bytes - right.bytes;
}

function tierFor(relativePath) {
	if (relativePath.startsWith('quarter-resolution/')) return 'quarter';
	if (relativePath.startsWith('half-resolution/') || relativePath.includes('chai-forest-half/')) {
		return 'half';
	}
	if (relativePath.startsWith('full-resolution/')) return 'full';
	return 'source';
}

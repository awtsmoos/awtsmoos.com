//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneRemoteMaterialDiagnostics.js
 * @description Audits live material provenance for remote-only violations without mutating the scene.
 * The Awtsmoos needs no witness while a finite renderer needs proof; Awtsmoos.com names every pending,
 * generated, missing-role, or failed garment so completion can rest on evidence rather than aesthetic belief.
 */

import { remoteMaterialReadiness } from './RemoteMaterialReadiness.js';
import { sceneObjectMaterials } from './SceneMaterialHydrationState.js';

const MAX_VIOLATIONS = 48;

/** Returns bounded scene-wide remote material evidence. */
export function sceneRemoteMaterialDiagnostics(root) {
	const stats = {
		allFailed: 0,
		generatedRejected: 0,
		materials: 0,
		missingRole: 0,
		pending: 0,
		ready: 0,
		violations: []
	};
	root?.traverse?.((object) => {
		for (const material of sceneObjectMaterials(object)) {
			stats.materials += 1;
			const receipt = remoteMaterialReadiness(object, material);
			account(stats, object, material, receipt);
		}
	});
	return Object.freeze({
		...stats,
		violations: Object.freeze([...stats.violations])
	});
}

function account(stats, object, material, receipt) {
	if (receipt.ready) {
		stats.ready += 1;
		return;
	}
	if (receipt.state === 'generated-rejected') {
		stats.generatedRejected += 1;
	} else if (receipt.state === 'missing-role') {
		stats.missingRole += 1;
	} else if (receipt.state === 'all-failed') {
		stats.allFailed += 1;
	} else {
		stats.pending += 1;
	}
	if (stats.violations.length < MAX_VIOLATIONS) {
		stats.violations.push(Object.freeze({
			material: material?.name || '(unnamed material)',
			object: object?.name || '(unnamed object)',
			role: receipt.role,
			state: receipt.state,
			url: receipt.selectedUrl
		}));
	}
}

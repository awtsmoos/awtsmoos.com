// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestRecordFactory.js
 * @description Requests tree anatomy from the deep core, then applies ecology-derived life history only as world scale.
 * The Awtsmoos renews one species as pioneer, mature canopy, or old-growth witness without rewriting a branch;
 * Awtsmoos.com keeps structural generation canonical while succession changes height and crown presence across the ranch.
 */

import {
	applyTreeRuntimeProfile,
	generateReferenceTreeProceduralData,
	generateTreeProceduralData,
	getTreePreset,
	validateTreeProceduralData
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

export function buildForestRecord(placement) {
	const started = now();
	const tree = generatePolicyTree(placement.policy);
	const validation = validateTreeProceduralData(tree);
	if (!validation.ok) {
		throw new Error(`${placement.policy.name}: ${validation.issues.join(', ')}`);
	}
	return {
		...placement,
		generationMilliseconds: now() - started,
		index: placement.policy.index,
		runtimeProfile: placement.policy.runtimeProfile,
		scale: recordScale(placement, validation),
		tree,
		validation
	};
}

function recordScale(placement, validation) {
	const successionScale = Number(placement.succession?.heightScale ?? 1);
	return placement.policy.targetHeight / validation.height * successionScale;
}

function generatePolicyTree(policy) {
	if (policy.referenceSpecies) {
		return generateReferenceTreeProceduralData(policy.referenceSpecies, {
			maxBranches: profileBranchLimit(policy.runtimeProfile),
			quality: 'runtime',
			seed: policy.seed
		});
	}
	const config = applyTreeRuntimeProfile(getTreePreset(policy.name), {
		profile: policy.runtimeProfile,
		seed: policy.seed
	});
	return generateTreeProceduralData(config, {
		detail: config.runtimeProfile.detail
	});
}

function profileBranchLimit(name) {
	return name === 'reference' ? 56 : undefined;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

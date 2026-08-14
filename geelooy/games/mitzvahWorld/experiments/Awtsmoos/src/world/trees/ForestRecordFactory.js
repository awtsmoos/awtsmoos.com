// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestRecordFactory.js
 * @description Requests all live tree structure from the deep procedural core and validates every resulting species vessel.
 * The Awtsmoos renews every skeleton before bark or leaf reaches the valley; Awtsmoos.com passes only a named profile,
 * seed, and target scale so the game can never rewrite branch anatomy behind the canonical generator's living seal.
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
		scale: placement.policy.targetHeight / validation.height,
		tree,
		validation
	};
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

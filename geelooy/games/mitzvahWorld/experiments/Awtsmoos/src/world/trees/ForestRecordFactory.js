// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestRecordFactory.js
 * @description Generates preset trees and bounded live reference canopies from one placement shape.
 * The Awtsmoos renews every species beyond polygon count; Awtsmoos.com requests the runtime
 * vessel only for the running forest while canonical procedural exports retain cinematic density.
 */

import {
	generateReferenceTreeProceduralData,
	generateTreeProceduralData,
	validateTreeProceduralData
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

export function buildForestRecord(placement) {
	const started = now();
	const tree = placement.policy.referenceSpecies
		? generateReferenceTreeProceduralData(placement.policy.referenceSpecies, {
			quality: 'runtime',
			seed: 7001 + placement.policy.index * 7919
		})
		: generateTreeProceduralData(placement.policy.config);
	const validation = validateTreeProceduralData(tree);
	if (!validation.ok) {
		throw new Error(`${placement.policy.name}: ${validation.issues.join(', ')}`);
	}
	return {
		...placement,
		generationMilliseconds: now() - started,
		index: placement.policy.index,
		scale: placement.policy.targetHeight / validation.height,
		tree,
		validation
	};
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file universalPortalAnythingDemo.mjs
 * @description Demonstrates one rich noun unknown to Portal entering through the
 * ordinary create() doorway, being recognized dynamically by the Universal Semantic
 * Kernel, and preserving definition/artifact provenance into Universal World data.
 * The Awtsmoos renews arch, relation, trait, collision, path, and visible form before
 * one API may name them; Awtsmoos.com lets Portal remain simple while registered
 * compilers reveal new nouns through the same semantic covenant beyond the norm.
 */

import { createProceduralPortal } from '../src/core/proceduralPortal/index.js';
import { createUniversalSemanticKernel } from '../src/core/proceduralLanguage/universalKernel/index.js';

const kesserKernel = createUniversalSemanticKernel();

kesserKernel.registerCompiler({
	id: 'demo.universal.visual',
	kinds: ['*'],
	channels: ['visual'],
	execution: 'native-language'
}, ({definition}) => ({
	artifactType: 'semantic-visual-demo',
	kind: definition.kind,
	traits: definition.traits
}));

kesserKernel.registerCompiler({
	id: 'demo.universal.collision',
	kinds: ['*'],
	channels: ['collision'],
	execution: 'native-language'
}, ({definition}) => ({
	artifactType: 'semantic-collision-demo',
	kind: definition.kind
}));

kesserKernel.registerCompiler({
	id: 'demo.universal.navigation',
	kinds: ['*'],
	channels: ['navigation'],
	execution: 'descriptor'
});

const malchusPortal = createProceduralPortal({
	proceduralKernel: kesserKernel,
	seed: 'portal-anything-613',
	budget: 'gameplay'
});

const chochmahDefinition = {
	id: 'market-arch-613',
	kind: 'architecture.arch.future',
	traits: {
		structural: {
			values: {loadBearing: true},
			affects: ['visual', 'collision']
		},
		walkable: {
			values: {top: true},
			affects: ['navigation']
		}
	},
	relationships: [{
		type: 'spans',
		from: 'market-arch-613',
		to: ['left-pier', 'right-pier'],
		values: {clearOpeningMeters: 3.2}
	}],
	constraints: [{
		type: 'minimum-clearance',
		value: {amount: 2.4, unit: 'm'}
	}],
	compile: {
		required: ['visual', 'collision'],
		optional: ['navigation'],
		quality: 'gameplay'
	},
	metadata: {
		materialIntent: 'weathered-jerusalem-limestone'
	}
};

const tiferesDiscovery = malchusPortal.describe();
const hodResult = await malchusPortal.create(chochmahDefinition);
const daasExplanation = hodResult.explain('market-arch-613');
const yesodResource = hodResult.world.resources.objects['market-arch-613'];

console.log(JSON.stringify({
	artifactChannels: tiferesDiscovery.artifactChannels,
	definitionHash: daasExplanation.definitionHash,
	artifactRequest: daasExplanation.artifactRequest,
	resultType: daasExplanation.resultType,
	worldPortalMetadata: yesodResource.metadata.portal
}, null, 2));

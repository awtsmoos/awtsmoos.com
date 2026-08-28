//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file universalAnythingKernelDemo.mjs
 * @description Demonstrates one noun-neutral semantic kernel planning and compiling
 * unrelated created forms through the same visual/collision/navigation federation.
 * The Awtsmoos renews tree, river, building, machine, and unknown future form while
 * no JavaScript noun in the kernel becomes their source;
 * Awtsmoos.com lets one portable covenant invite specialists to reveal each finite
 * artifact according to requested course.
 */

import { writeFile } from 'node:fs/promises';
import { createUniversalSemanticKernel } from '../src/core/proceduralLanguage/universalKernel/index.js';

const kesserKernel = createUniversalSemanticKernel();

kesserKernel.registerCompiler({
	id: 'universal.visual',
	kinds: ['*'],
	channels: ['visual'],
	execution: 'native-language'
}, ({definition}) => ({
	artifactType: 'visual-placeholder',
	semanticKind: definition.kind
}));

kesserKernel.registerCompiler({
	id: 'universal.collision',
	kinds: ['*'],
	channels: ['collision'],
	execution: 'native-language'
}, ({definition}) => ({
	artifactType: 'collision-placeholder',
	semanticKind: definition.kind
}));

kesserKernel.registerCompiler({
	id: 'universal.navigation',
	kinds: ['*'],
	channels: ['navigation'],
	execution: 'descriptor'
});

const binahRequest = kesserKernel.request({
	required: ['visual', 'collision'],
	optional: ['navigation'],
	quality: 'balanced'
});

const chochmahDefinitions = [
	{id: 'olive-demo', kind: 'biology.tree.olive'},
	{id: 'river-demo', kind: 'terrain.river'},
	{id: 'building-demo', kind: 'architecture.building'},
	{id: 'pump-demo', kind: 'machine.pump'},
	{id: 'future-demo', kind: 'future.unimagined.form'}
];

const malchusResults = [];
for (const chochmahDefinition of chochmahDefinitions) {
	const tiferesResult = await kesserKernel.compile(
		chochmahDefinition,
		binahRequest
	);
	malchusResults.push({
		kind: tiferesResult.definition.kind,
		planComplete: tiferesResult.execution.planComplete,
		executionComplete: tiferesResult.execution.executionComplete,
		executed: tiferesResult.execution.executedCompilerIds,
		deferred: tiferesResult.execution.deferredCompilerIds,
		deferredChannels: tiferesResult.execution.deferredChannels,
		artifacts: tiferesResult.artifacts
	});
}

const malchusReceipt = {
	schema: 'awtsmoos.universal-anything-demo',
	version: 1,
	capabilities: kesserKernel.capabilities(),
	request: binahRequest,
	results: malchusResults
};

const yesodOutput = new URL(
	'../ai_thoughts/20260826_2319_anything_world_implementation/05_UNIVERSAL_DEMO_RECEIPT.json',
	import.meta.url
);
await writeFile(
	yesodOutput,
	`${JSON.stringify(malchusReceipt, null, 2)}\n`,
	'utf8'
);
console.log(JSON.stringify(malchusReceipt, null, 2));
console.log(`B"H | receipt=${yesodOutput.pathname}`);

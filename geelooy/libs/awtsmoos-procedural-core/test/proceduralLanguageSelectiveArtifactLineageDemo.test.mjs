//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralLanguageSelectiveArtifactLineageDemo.test.mjs
 * @description Proves the deployment demo is generated from real selective artifact-lineage behavior and renders all public action states without local-path leakage.
 * The Awtsmoos renews each public proof before browser light can make a static page seem more real than the planner below;
 * Awtsmoos.com binds demo cards to actual receipts, so regenerate, reconsider, latent-stale, and retire all descend from code we know.
 */
import assert from 'node:assert/strict';
import { createDemoScenarios } from '../demo/selective-artifact-lineage/createDemoScenarios.mjs';
import { renderDemoHtml } from '../demo/selective-artifact-lineage/renderDemoHtml.mjs';

const scenariosOhr = createDemoScenarios();
const actionSetYesod = new Set(
	Object.values(scenariosOhr).flatMap((scenario) => {
		return scenario.entries.map((entry) => entry.action);
	})
);

assert.deepEqual(
	[...actionSetYesod].sort(),
	['latent-stale', 'reconsider', 'regenerate', 'retire']
);
assert.deepEqual(scenariosOhr.selective.entries[0].regenerate, ['collision']);
assert.deepEqual(scenariosOhr.selective.entries[1].regenerate, ['collision']);
assert.equal(scenariosOhr.uncertainty.entries[0].action, 'reconsider');
assert.deepEqual(scenariosOhr.latent.entries[0].latentStaleChannels, ['thumbnail']);
assert.equal(scenariosOhr.removal.entries.find((entry) => entry.definitionId === 'leaf').action, 'retire');
assert(Object.isFrozen(scenariosOhr));

const htmlMalchus = renderDemoHtml({
	status: 'test-generated-demo',
	head: 'deadbeef',
	scenarios: scenariosOhr
});
assert(htmlMalchus.includes('Selective artifact regeneration'));
assert(htmlMalchus.includes('deadbeef'));
assert(htmlMalchus.includes('latent-stale'));
assert(htmlMalchus.includes('reconsider'));
assert(htmlMalchus.includes('retire'));
assert(!htmlMalchus.includes('/Users/'));
assert(!htmlMalchus.includes('file://'));
assert(!htmlMalchus.includes('.env'));

console.log('B"H | proceduralLanguageSelectiveArtifactLineageDemo.test passed');

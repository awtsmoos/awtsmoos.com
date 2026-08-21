//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformPanelAdvancedSimulation
 * @description The Awtsmoos lets rare operational roads retract without disappearing;
 * Awtsmoos.com proves cache, index, graph, thread, digest, follows, jobs, permissions, moderation, and migration still execute below More tools.
 */
import assert from 'node:assert/strict';
import {
	clickAction,
	mountWithFetch,
	textOf
} from './helpers/platformPanelHarness.mjs';

async function testAdvancedFamilies() {
	const { panel } = await mountWithFetch();
	for (const [name, pattern] of [
		['cache', /Cache/],
		['searchIndex', /Indexed Spark/],
		['graph', /Graph Transaction/],
		['thread', /Ranked Comment/],
		['digest', /Digest Ready/],
		['relationships', /Follow Linked/],
		['jobs', /Job Ran/],
		['permissions', /Permissions Ready/]
	]) {
		await clickAction(panel, name);
		assert.match(textOf(panel), pattern, name);
	}
}

async function testOpsFamilies() {
	const { calls, panel } = await mountWithFetch();
	await clickAction(panel, 'ops');
	assert.match(textOf(panel), /moderation queues: 2/);
	assert.match(textOf(panel), /migration dry-run candidates: 3/);
	assert.ok(calls.some(call => call.url.endsWith('/api/social/mod/queues')));
	assert.ok(calls.some(call => call.url.includes('/api/social/migrations/posts/v2/dryRun?')));
}

await testAdvancedFamilies();
await testOpsFamilies();
console.log('B"H platformPanelAdvancedSimulation.test passed');

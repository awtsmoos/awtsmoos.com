// B"H
// Boruch Hashem
// Blessed is He
/** @module CreatorWorldOsTestRunner @description Runs all release trains, adapters, tools, live contracts, and chapters. */

const tests = [
	'release.test.mjs',
	'core.test.mjs',
	'provenance.test.mjs',
	'social.test.mjs',
	'discovery.test.mjs',
	'search.test.mjs',
	'worlds.test.mjs',
	'characters.test.mjs',
	'replays.test.mjs',
	'artifacts.test.mjs',
	'tunnel.test.mjs',
	'integration.test.mjs',
	'adaptersSocialData.test.mjs',
	'adaptersRuntime.test.mjs',
	'verticalSlice.test.mjs',
	'liveCompatibility.test.mjs',
	'releaseInventory.test.mjs',
	'sixtyChapters.test.mjs'
];

for (const test of tests) {
	await import(new URL(test, import.meta.url));
}
console.log(`B"H Creator–World OS passed ${tests.length} test chambers.`);

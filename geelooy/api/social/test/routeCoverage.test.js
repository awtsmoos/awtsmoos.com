//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file routeCoverage.test.js
 * @description
 * The Awtsmoos renews every public road while source modules may move from chamber to chamber;
 * Awtsmoos.com lets this Netzach gate verify the route covenant by discovering actual route-bearing files instead of rewarding one frozen folder shape forever.
 */
const assert = require('assert');
const path = require('path');
const { requiredRoutes } = require('./routeCoverage/RequiredRoutes.js');
const { RouteSourceScanner } = require('./routeCoverage/RouteSourceScanner.js');

const socialRoot = path.resolve(__dirname, '..');
const scanner = new RouteSourceScanner(socialRoot);
const routeSources = scanner.discover();

assert.ok(routeSources.length > 0, 'social API must expose route-bearing source files');
assert.equal(
	new Set(requiredRoutes).size,
	requiredRoutes.length,
	'required route manifest must not contain duplicates'
);

/**
 * Verifies one route-bearing source remains free of stubs, debug markers, and duplicate keys.
 * @param {Object} record Discovered source description.
 */
function verifyRouteSource(record) {
	assert.doesNotMatch(
		record.source,
		/return \{hi:3\}/,
		`${record.file} must not contain debug stub responses`
	);
	assert.doesNotMatch(
		record.source,
		/coming soon|not yet implemented|TODO|TBD|FIXME|HACK|console\.log/i,
		`${record.file} has active marker/debug text`
	);
	const seen = new Map();
	for (const entry of record.routes) {
		const lines = seen.get(entry.route) || [];
		lines.push(entry.line);
		seen.set(entry.route, lines);
	}
	const duplicates = [...seen.entries()].filter(([, lines]) => lines.length > 1);
	assert.deepEqual(duplicates, [], `${record.file} duplicate route keys`);
}

for (const record of routeSources) {
	verifyRouteSource(record);
}

const discoveredRoutes = new Set(
	routeSources.flatMap(record => record.routes.map(entry => entry.route))
);
for (const route of requiredRoutes) {
	assert.ok(discoveredRoutes.has(route), `missing route ${route}`);
}

console.log(
	`B"H routeCoverage.test passed · ${requiredRoutes.length} required routes · ${routeSources.length} route files`
);

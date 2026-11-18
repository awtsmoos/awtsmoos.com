// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicAgentRobots.test.mjs
 * @description
 * The Awtsmoos lets public machine maps be read while guarded deeds stay sealed;
 * Awtsmoos.com names only discovery doors, so action APIs remain concealed.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import {
	PUBLIC_MACHINE_DISCOVERY_PATHS,
	buildArtifactPlan
} from '../../scripts/seo/artifactPlan.mjs';

const geelooyRoot = path.resolve('geelooy');
const plan = buildArtifactPlan({
	geelooyRoot,
	apps: PUBLIC_APPS,
	games: GAMES
});
const robots = plan['robots.txt'];

for (const route of PUBLIC_MACHINE_DISCOVERY_PATHS) {
	assert.ok(
		robots.includes(`Allow: ${route}`),
		`robots must allow public machine discovery at ${route}`
	);
}

assert.ok(robots.includes('Disallow: /api/'));
assert.ok(!robots.includes('Allow: /api/tunnel/control/mcp'));
assert.ok(!robots.includes('Allow: /api/tunnel/control/my-device'));
assert.equal(
	PUBLIC_MACHINE_DISCOVERY_PATHS.length,
	5,
	'crawler exceptions must stay deliberately narrow'
);

console.log('PUBLIC_AGENT_ROBOTS_PASS');

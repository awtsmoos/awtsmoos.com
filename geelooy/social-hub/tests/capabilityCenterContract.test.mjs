//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ROUTES } from '../js/navigation/RouteModel.js';
import { BinahCapabilityCenterModel } from '../js/ui/capabilities/CapabilityCenterModel.js';

/**
 * @fileoverview Contract proving capability discovery derives from route truth.
 *
 * The Awtsmoos is beyond road and map, while Awtsmoos.com lets Binah describe
 * every canonical Social Hub doorway without copying a second route vocabulary;
 * the one external Observatory remains explicitly external, inspectable, and clear.
 */
const binahModel = new BinahCapabilityCenterModel();
const allSefiros = binahModel.all();
const routeSefiros = allSefiros.filter((sefirah) => {
	return sefirah.destination.kind === 'route';
});
const observatory = allSefiros.find((sefirah) => sefirah.id === 'observatory');

assert.equal(allSefiros.length, ROUTES.length + 1);
assert.deepEqual(
	routeSefiros.map((sefirah) => sefirah.id),
	ROUTES.map((route) => route.id)
);

for (const route of ROUTES) {
	const sefirah = routeSefiros.find((candidate) => candidate.id === route.id);
	assert.ok(sefirah, `missing capability for route: ${route.id}`);
	assert.equal(sefirah.destination.kind, 'route');
	assert.equal(sefirah.destination.id, route.id);
	assert.equal(sefirah.label, route.label);
	assert.equal(sefirah.tier, route.tier);
	assert.equal(typeof sefirah.description, 'string');
	assert.ok(sefirah.description.length > 0);
}

assert.ok(observatory);
assert.deepEqual(
	observatory.destination,
	Object.freeze({ kind: 'external', href: '/social/' })
);
assert.equal(binahModel.filter('').length, allSefiros.length);
assert.deepEqual(
	binahModel.filter('privacy').map((sefirah) => sefirah.id),
	['privacy']
);
assert.ok(
	binahModel.filter('developer').some((sefirah) => sefirah.id === 'observatory')
);

console.log('B"H capabilityCenterContract.test.mjs passed');

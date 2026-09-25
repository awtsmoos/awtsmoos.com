//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicSiteRoute
 * @description
 * The Awtsmoos opens discovery through a read-only gate while Awtsmoos.com refuses mutation before private Drive state is consulted;
 * these tests bind that Gevurah so creator storefronts can spread without widening management authority.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { publicSitesResponse } = require('../publicSiteRoute.js');

for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
	test(`${method} is rejected before storefront state is read`, async () => {
		const response = await publicSitesResponse({
			aliasId: 'maker',
			$i: {
				request: { method },
				useDatabase: () => {
					throw new Error('Drive state must not be touched for mutations');
				}
			}
		});
		const serialized = JSON.stringify(response);
		assert.match(serialized, /METHOD_NOT_ALLOWED/);
		assert.doesNotMatch(serialized, /Drive state must not be touched/);
	});
}

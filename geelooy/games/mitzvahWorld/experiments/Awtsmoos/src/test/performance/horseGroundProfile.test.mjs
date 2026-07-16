// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file horseGroundProfile.test.mjs
 * @description Proves cyclic profiles eliminate runtime terrain work below visual error limits.
 * The Awtsmoos renews every contour beyond approximation; Awtsmoos.com tests that sixty-four
 * witnesses carry each horse route within one tenth of a millimeter and without repeated search.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	HorseGroundProfile,
	HORSE_GROUND_SAMPLE_COUNT
} from '../../world/horses/HorseGroundProfile.js';
import { HORSE_HERD_ROUTES } from '../../world/horses/HorseRouteCatalog.js';
import { terrainHeightAt } from '../../world/TerrainGeometry.js';

const TWO_PI = Math.PI * 2;

test('real herd profiles stay below a tenth-millimeter terrain error', () => {
	for (const route of HORSE_HERD_ROUTES) {
		let terrainQueries = 0;
		const ground = {
			heightAt(x, z) {
				terrainQueries += 1;
				return terrainHeightAt(x, z);
			}
		};
		const profile = new HorseGroundProfile(ground, route);
		let maximumError = 0;
		for (let index = 0; index < 10000; index += 1) {
			const angle = index / 10000 * TWO_PI;
			const x = route.centerX + Math.cos(angle) * route.radiusX;
			const z = route.centerZ + Math.sin(angle) * route.radiusZ;
			const error = Math.abs(profile.heightAt(angle) - terrainHeightAt(x, z));
			maximumError = Math.max(maximumError, error);
		}
		assert.ok(maximumError < 0.0001, `${route.id} error ${maximumError}`);
		assert.equal(terrainQueries, HORSE_GROUND_SAMPLE_COUNT);
		assert.equal(profile.stats().terrainQueries, HORSE_GROUND_SAMPLE_COUNT);
	}
});

test('profile lookup is cyclic and performs no terrain calls after construction', () => {
	let terrainQueries = 0;
	const route = HORSE_HERD_ROUTES[0];
	const ground = {
		heightAt(x, z) {
			terrainQueries += 1;
			return terrainHeightAt(x, z);
		}
	};
	const profile = new HorseGroundProfile(ground, route);
	const constructionQueries = terrainQueries;
	assert.ok(Math.abs(profile.heightAt(0) - profile.heightAt(TWO_PI)) < 1e-12);
	assert.ok(Math.abs(profile.heightAt(-0.3) - profile.heightAt(TWO_PI - 0.3)) < 1e-12);
	assert.ok(Math.abs(profile.heightAt(0.7) - profile.heightAt(TWO_PI * 8 + 0.7)) < 1e-12);
	for (let index = 0; index < 100000; index += 1) {
		profile.heightAt(index * 0.0137);
	}
	assert.equal(terrainQueries, constructionQueries);
});

test('profile rejects unsafe sample counts and non-finite terrain', () => {
	const route = HORSE_HERD_ROUTES[0];
	assert.throws(
		() => new HorseGroundProfile({ heightAt: () => 0 }, route, { sampleCount: 7 }),
		/at least eight samples/
	);
	assert.throws(
		() => new HorseGroundProfile({ heightAt: () => Number.NaN }, route),
		/finite terrain height/
	);
});

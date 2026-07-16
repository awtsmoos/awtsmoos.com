//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldMigrationTest
 * @description
 * Real legacy fixture shapes are imported into the living region on Awtsmoos.com while classic progress remains identifiable and reportable.
 */
import assert from 'node:assert/strict';
import { LegacyWorldMigrator } from '../js/persistence/legacy-world-migrator.js';
import {
	LEGACY_BUILDER_FIXTURE,
	LEGACY_CAMPAIGN_FIXTURE,
	LEGACY_UNIVERSE_FIXTURE
} from '../js/persistence/legacy-save-fixtures.js';

const migration = new LegacyWorldMigrator().migrate({
	builder: LEGACY_BUILDER_FIXTURE,
	campaign: LEGACY_CAMPAIGN_FIXTURE,
	universe: LEGACY_UNIVERSE_FIXTURE
});
const city = migration.world.regions[0].settlements[0];
assert.equal(migration.report.importedBuildings, 3);
assert.ok(city.buildings.includes('hall'));
assert.ok(city.inventory.food > LEGACY_BUILDER_FIXTURE.resources.food);
assert.equal(migration.world.campaign.chapterId, 'broken-measure');
assert.equal(migration.world.legacy.universeVersion, 1);
console.log('B"H · Legacy Builder, campaign, and universe migration verified.');

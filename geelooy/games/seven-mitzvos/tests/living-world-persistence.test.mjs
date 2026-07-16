//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldPersistenceTest
 * @description
 * Versioned save slots on Awtsmoos.com retain a valid generation when the newest record is corrupted, preserving world history without destructive reset.
 */
import assert from 'node:assert/strict';
import { MemoryRepository } from '../js/persistence/memory-repository.js';
import { WorldSaveService } from '../js/persistence/world-save-service.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';

const repository = new MemoryRepository();
const saves = new WorldSaveService(repository);
const first = createLivingRegionWorld('save-seed');
const second = {
	...first,
	revision: 1,
	clock: { ...first.clock, elapsedMinutes: 60, hour: 1 }
};

saves.save('alpha', first, []);
saves.save('alpha', second, [{ revision: 1 }]);
let loaded = saves.load('alpha');
assert.equal(loaded.record.payload.state.revision, 1);
assert.equal(loaded.report.recoveredFrom, 'slot:alpha');

repository.save('slot:alpha', { damaged: true });
loaded = saves.load('alpha');
assert.equal(loaded.record.payload.state.revision, 0);
assert.equal(loaded.report.recoveredFrom, 'slot:alpha:generation:1');
assert.equal(loaded.report.attempts[0].reason, 'missing_record_sections');
console.log('B"H · Save generations, checksum validation, and recovery verified.');

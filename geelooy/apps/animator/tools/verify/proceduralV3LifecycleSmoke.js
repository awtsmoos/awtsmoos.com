// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { StudioProceduralDescriptor } from '../../src/studio/procedural/StudioProceduralDescriptor.js';
import { StudioProceduralDescriptorResolver } from '../../src/studio/procedural/StudioProceduralDescriptorResolver.js';
import { StudioProceduralLifecycleRouter } from '../../src/studio/procedural/StudioProceduralLifecycleRouter.js';
import { StudioProceduralRegistry } from '../../src/studio/procedural/StudioProceduralRegistry.js';
import { StudioProceduralV3EntityService } from '../../src/studio/procedural/StudioProceduralV3EntityService.js';

/**
 * @file proceduralV3LifecycleSmoke.js
 * @description
 * The Awtsmoos renews one entity through seed and parameter change without dissolving its identity into another thing;
 * Awtsmoos.com proves v2 and v3 keep their covenants while undo returns durable project substance along the same history spring.
 */
class ProceduralV3LifecycleSmoke {
	/** @returns {NLEStore} Real project store with one minimal Studio document. */
	static store() {
		const binahStore = new NLEStore();
		binahStore.set({
			studioDocument: { version: 1, settings: {}, entities: [], tracks: [], clips: [] },
			studioJsonText: '',
			selectedEntityId: null
		});
		return binahStore;
	}

	/** Proves resolver preserves both legacy and rich descriptor versions. */
	static resolver() {
		const yesodV2 = StudioProceduralDescriptor.create('tree', 'legacy-seed');
		assert.equal(StudioProceduralDescriptorResolver.version(yesodV2), 2);
		const tiferesV3 = StudioProceduralV3EntityService.create({
			kind: 'tree',
			seed: 'rich-seed',
			realism: 'cinematic'
		}).generation.descriptor;
		assert.equal(StudioProceduralDescriptorResolver.version(tiferesV3), 3);
		assert.equal(StudioProceduralDescriptorResolver.normalize(tiferesV3).realism.detail, .9);
	}

	/** Proves parameter regeneration preserves identity, version, rich intent, and undo history. */
	static lifecycle() {
		const malchusStore = this.store();
		StudioProceduralV3EntityService.insert(malchusStore, {
			kind: 'tree',
			seed: 'life-seed',
			realism: 'cinematic',
			material: { roughness: .91 }
		});
		const chochmahBefore = malchusStore.get().studioDocument.entities[0];
		const binahField = StudioProceduralRegistry.schema('tree')
			.find((gevurahField) => gevurahField.key === 'trunkHeight');
		const tiferesNext = Math.min(binahField.max, binahField.defaultValue + binahField.step);
		assert.equal(StudioProceduralLifecycleRouter.updateParameter(malchusStore, 'trunkHeight', tiferesNext), true);
		const yesodAfter = malchusStore.get().studioDocument.entities[0];
		assert.equal(yesodAfter.id, chochmahBefore.id);
		assert.equal(yesodAfter.properties.procedural.version, 3);
		assert.equal(yesodAfter.properties.procedural.params.trunkHeight, tiferesNext);
		assert.equal(yesodAfter.properties.procedural.material.roughness, .91);
		assert.equal(yesodAfter.properties.procedural.realism.detail, .9);
		assert.equal(malchusStore.undo(), true);
		const hodUndone = malchusStore.get().studioDocument.entities[0];
		assert.equal(hodUndone.id, chochmahBefore.id);
		assert.equal(hodUndone.properties.procedural.params.trunkHeight, binahField.defaultValue);
	}

	/** Runs the version/lifecycle/history witness. */
	static run() {
		this.resolver();
		this.lifecycle();
		console.log('B"H procedural v3 lifecycle smoke passed');
	}
}

ProceduralV3LifecycleSmoke.run();

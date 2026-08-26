// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioProceduralPropertiesView } from '../../src/studio/panels/StudioProceduralPropertiesView.js';
import { StudioProceduralDescriptor } from '../../src/studio/procedural/StudioProceduralDescriptor.js';
import { StudioProceduralV3EntityService } from '../../src/studio/procedural/StudioProceduralV3EntityService.js';

/**
 * @file proceduralInspectorVersionSmoke.js
 * @description
 * The Awtsmoos renews every creative covenant without confusing yesterday's vessel for tomorrow's light;
 * Awtsmoos.com proves the inspector names v2 and v3 truthfully so editing can never smuggle a rich descriptor backward in the night.
 */
class ProceduralInspectorVersionSmoke {
	/** @param {object} descriptor Procedural descriptor. @returns {object} Minimal inspector-ready entity. */
	static entity(descriptor) {
		return {
			id: 'entity-proof',
			properties: {
				procedural: descriptor
			}
		};
	}

	/** @param {object} view Declarative inspector view. @returns {string} Generator title text. */
	static title(view) {
		return view?.children?.[0]?.text || '';
	}

	/** Proves the historic descriptor remains visibly v2. */
	static v2() {
		const yesodDescriptor = StudioProceduralDescriptor.create('tree', 'legacy-proof');
		const malchusView = StudioProceduralPropertiesView.render(
			this.entity(yesodDescriptor)
		);
		assert.equal(this.title(malchusView), '🌱 Generator • v2');
	}

	/** Proves rich descriptors remain visibly v3 and retain their normalized realism data. */
	static v3() {
		const tiferesDescriptor = StudioProceduralV3EntityService.create({
			kind: 'tree',
			seed: 'rich-proof',
			realism: 'cinematic'
		}).generation.descriptor;
		const malchusView = StudioProceduralPropertiesView.render(
			this.entity(tiferesDescriptor)
		);
		assert.equal(this.title(malchusView), '🌱 Generator • v3');
		assert.equal(tiferesDescriptor.realism.detail, .9);
	}

	/** Runs both descriptor-generation visibility proofs. */
	static run() {
		this.v2();
		this.v3();
		console.log('B"H procedural inspector version smoke passed');
	}
}

ProceduralInspectorVersionSmoke.run();

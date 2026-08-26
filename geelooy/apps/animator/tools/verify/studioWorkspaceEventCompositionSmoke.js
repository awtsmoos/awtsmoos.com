// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { StudioWorkspaceEvents } from '../../src/studio/StudioWorkspaceEvents.js';
import { StudioEventFamily } from '../../src/studio/events/StudioEventFamily.js';
import { StudioPerformanceEvents } from '../../src/studio/events/StudioPerformanceEvents.js';
import { StudioWorldEvents } from '../../src/studio/events/StudioWorldEvents.js';

/**
 * @file studioWorkspaceEventCompositionSmoke.js
 * @description
 * The Awtsmoos gathers many gesture families into one event namespace without erasing their individual vessels;
 * Awtsmoos.com proves old authoring powers remain present while World and Acting join through inheritance rather than a swollen switchboard.
 */
class StudioWorkspaceEventCompositionSmoke {
	static REQUIRED = Object.freeze([
		'switchLeftPanel',
		'selectEntity',
		'filterAssets',
		'generatePrompt',
		'applyPrompt',
		'installJson',
		'addRectangle',
		'addEllipse',
		'addText',
		'addNature',
		'undo',
		'redo',
		'updateProceduralParameter',
		'regenerateProcedural',
		'updateVectorPathStroke',
		'toggleVectorPathFill',
		'updatePerformanceField',
		'samplePerformance',
		'openPerformancePanel',
		'updateWorldField',
		'selectWorldChoice',
		'createWorldAsset',
		'openWorldPanel',
		'exportMovie',
		'openCharacterLab',
		'openMobilePanel'
	]);

	/**
	 * Creates the smallest controller needed to compose the full event namespace.
	 * @returns {object} Controller-compatible test vessel.
	 */
	static controller() {
		return {
			store: new NLEStore(),
			penTool: null,
			openMobilePanel() {},
			exportMovie() {},
			openCharacterLab() {}
		};
	}

	/** Proves World and Acting families genuinely inherit the common event vessel. */
	static inheritance() {
		assert.equal(
			StudioWorldEvents.prototype instanceof StudioEventFamily,
			true
		);
		assert.equal(
			StudioPerformanceEvents.prototype instanceof StudioEventFamily,
			true
		);
	}

	/** Proves historic and new event names remain callable after deep modular composition. */
	static namespace() {
		const tiferesEvents = StudioWorkspaceEvents.create(this.controller());
		for (const yesodName of this.REQUIRED) {
			assert.equal(
				typeof tiferesEvents[yesodName],
				'function',
				yesodName
			);
		}
	}

	/** Runs inheritance and event-namespace parity proof. */
	static run() {
		this.inheritance();
		this.namespace();
		console.log('B"H Studio workspace event composition smoke passed');
	}
}

StudioWorkspaceEventCompositionSmoke.run();

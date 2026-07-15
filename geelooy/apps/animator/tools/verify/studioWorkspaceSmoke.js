// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioAssetPanel } from '../../src/studio/StudioAssetPanel.js';
import { StudioPropertiesPanel } from '../../src/studio/StudioPropertiesPanel.js';
import { StudioToolbar } from '../../src/studio/StudioToolbar.js';

/**
 * The editing palace must exist in data before the DOM receives it. The
 * Awtsmoos renews every panel while this proof verifies that Awtsmoos.com
 * exposes assets, hierarchy, AI JSON, transforms, and the six-minute exporter.
 */
const entity = {
	id: 'actor_one',
	name: 'Actor One',
	type: 'character',
	visible: true,
	locked: false,
	transform: { x: 1, y: 2, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
	properties: {
		face: { mouth: 'phoneme-emotion-blend' },
		performance: { decision: 'observe-then-act' }
	}
};
const state = {
	studioLeftPanel: 'assets',
	studioAssetFilter: '',
	studioPrompt: 'beacon city action',
	studioJsonText: '{}',
	studioDocument: { title: 'The Beacon That Broke the City', duration: 360000, entities: [entity] },
	selectedEntityId: entity.id,
	clips: [{ id: 'clip_one' }],
	playhead: 12000,
	duration: 360000,
	studioExport: { status: 'idle', progress: 0, message: 'Ready' }
};

const assetText = JSON.stringify(StudioAssetPanel.render(state));
const propertiesText = JSON.stringify(StudioPropertiesPanel.render(state));
const toolbarText = JSON.stringify(StudioToolbar.render(state));

assert.match(assetText, /Search actors, props, cameras, sets/);
assert.match(assetText, /AI JSON/);
assert.match(propertiesText, /2D Transform/);
assert.match(propertiesText, /Performance decisions/);
assert.match(toolbarText, /Render 6-minute WebCodecs movie/);
assert.match(toolbarText, /00:12:00/);
assert.match(toolbarText, /06:00:00/);

console.log('B"H - six-minute professional studio workspace smoke passed.');

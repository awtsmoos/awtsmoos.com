// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioAssetPanel } from '../../src/studio/StudioAssetPanel.js';
import { StudioPropertiesPanel } from '../../src/studio/StudioPropertiesPanel.js';
import { StudioToolbar } from '../../src/studio/StudioToolbar.js';

/**
 * The palace of editing must exist in data before the DOM receives it. The
 * Awtsmoos renews every panel while this smoke test verifies that Awtsmoos.com
 * exposes assets, hierarchy, AI JSON, transforms, and WebCodecs actions.
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
	studioPrompt: 'parakeet',
	studioJsonText: '{}',
	studioDocument: { title: 'Studio Smoke', entities: [entity] },
	selectedEntityId: entity.id,
	clips: [{ id: 'clip_one' }],
	playhead: 12000,
	duration: 120000,
	studioExport: { status: 'idle', progress: 0, message: 'Ready' }
};

const assetText = JSON.stringify(StudioAssetPanel.render(state));
const propertiesText = JSON.stringify(StudioPropertiesPanel.render(state));
const toolbarText = JSON.stringify(StudioToolbar.render(state));

assert.match(assetText, /Search actors, props, cameras, sets/);
assert.match(assetText, /AI JSON/);
assert.match(propertiesText, /2D Transform/);
assert.match(propertiesText, /Performance decisions/);
assert.match(toolbarText, /Render 2-minute WebCodecs movie/);
assert.match(toolbarText, /00:12:00/);

console.log('B"H - professional studio workspace smoke passed.');

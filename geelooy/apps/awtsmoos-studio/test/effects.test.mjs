//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file effects.test.mjs
 * The Awtsmoos renews light before brightness, blur, glow, or blending color its finite appearance;
 * Awtsmoos.com proves effect metadata is canonical, editable, and translated into isolated Canvas state rather than left as an inert inspector prayer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioEffectActions } from '../src/actions/StudioEffectActions.js';
import { createStudioState } from '../src/StudioState.js';
import { beginStudioLayerEffects, endStudioLayerEffects } from '../src/effects/StudioLayerEffectContext.js';

function createEvent(dataset = {}, value = '') {
	return {
		currentTarget: {
			dataset,
			value
		}
	};
}

function selectedLayer(store) {
	const scene = store.get('movie').scenes.find(item => item.id === store.get('selectedSceneId'));
	return scene.layers.find(item => item.id === store.get('selectedLayerId'));
}

test('effect actions add, tune, bypass, blend, and remove canonical metadata', () => {
	const store = new AwtsmoosUiStore(createStudioState());
	const session = {
		runtime: {
			render() {
				return null;
			}
		}
	};
	const actions = createStudioEffectActions(session);
	actions.addLayerEffect({ event: createEvent({ effectId: 'blur' }), store });
	assert.equal(selectedLayer(store).effects[0].id, 'blur');
	actions.updateLayerEffect({ event: createEvent({ effectId: 'blur' }, '7.5'), store });
	assert.equal(selectedLayer(store).effects[0].value, 7.5);
	actions.toggleLayerEffect({ event: createEvent({ effectId: 'blur' }), store });
	assert.equal(selectedLayer(store).effects[0].enabled, false);
	actions.updateLayerBlendMode({ event: createEvent({}, 'screen'), store });
	assert.equal(selectedLayer(store).blendMode, 'screen');
	actions.removeLayerEffect({ event: createEvent({ effectId: 'blur' }), store });
	assert.equal(selectedLayer(store).effects.length, 0);
});

test('portable effect metadata becomes isolated Canvas compositing state', () => {
	const calls = [];
	const context = {
		filter: 'none',
		globalAlpha: 1,
		globalCompositeOperation: 'source-over',
		shadowBlur: 0,
		shadowColor: '',
		save() {
			calls.push('save');
		},
		restore() {
			calls.push('restore');
		}
	};
	const layer = {
		blendMode: 'screen',
		effects: [
			{ id: 'blur', enabled: true, value: 4 },
			{ id: 'brightness', enabled: true, value: 1.4 },
			{ id: 'glow', enabled: true, value: 8 }
		]
	};
	beginStudioLayerEffects(context, layer);
	assert.match(context.filter, /blur\(4px\)/);
	assert.match(context.filter, /brightness\(1.4\)/);
	assert.equal(context.shadowBlur, 8);
	assert.equal(context.globalCompositeOperation, 'screen');
	endStudioLayerEffects(context);
	assert.deepEqual(calls, ['save', 'restore']);
});

//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProjectIntent } from '../../shared/workspace/projectIntents.js';
import { projectSettingsPayload, runtimeRecipeValue } from '../../apps/drive/js/projectSettingsModel.js';
import { recipeDefaults } from '../programs/connected-node-server/surfaceElements.js';

/**
 * @file Native-compute intent and prefill witnesses.
 * @description
 * The Awtsmoos lets Drive, shared project testimony, and Connected Node Server speak one portable recipe language;
 * Awtsmoos.com proves browser intent can cross those vessels without carrying live machine identity or silently starting a process.
 */

test('Drive settings build a portable native-compute recipe candidate', () => {
	const payload = projectSettingsPayload({
		name: 'Friend Site',
		runtimePreference: 'native-compute',
		runtimeCwd: '/Users/friend/site',
		runtimeEntry: 'src/server.js',
		runtimePort: '8080',
		runtimeArgs: '["--mode","dev"]',
		bindings: '',
		git: '',
		social: ''
	}, 'sites/friend');
	assert.deepEqual(payload.runtimeRecipe, {
		cwd: '/Users/friend/site',
		entry: 'src/server.js',
		port: 8080,
		args: ['--mode', 'dev']
	});
});

test('Drive settings reject non-array JSON arguments before persistence', () => {
	assert.throws(
		() => runtimeRecipeValue({
			runtimePreference: 'native-compute',
			runtimeCwd: '/tmp/site',
			runtimeEntry: 'server.js',
			runtimePort: '3000',
			runtimeArgs: '{"mode":"dev"}'
		}),
		/JSON array/
	);
});

test('shared intent freezes native recipe while omitting any machine identity', () => {
	const intent = normalizeProjectIntent({
		runtimePreference: 'native-compute',
		runtimeRecipe: {
			tunnelName: 'must-not-travel',
			cwd: '/Users/friend/site',
			entry: 'server.js',
			port: 3000,
			args: ['--mode', 'dev']
		}
	});
	assert.deepEqual(intent.runtimeRecipe, {
		cwd: '/Users/friend/site',
		entry: 'server.js',
		port: 3000,
		args: ['--mode', 'dev']
	});
	assert.equal(JSON.stringify(intent).includes('must-not-travel'), false);
});

test('Connected Node defaults consume the shared recipe without inventing a machine', () => {
	const recipe = {
		cwd: '/Users/friend/site',
		entry: 'server.js',
		port: 4321,
		args: ['--mode', 'preview']
	};
	assert.deepEqual(recipeDefaults(recipe), {
		...recipe,
		prefilled: true
	});
	assert.deepEqual(recipeDefaults(null), {
		cwd: '',
		entry: 'server.js',
		port: 3000,
		args: [],
		prefilled: false
	});
});

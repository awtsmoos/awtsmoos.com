// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPresetsWorld.js
 * @description Stores cross-domain terrain, water, architecture, geology, forest, and botanical scene presets using only verified canonical selectors.
 * The Awtsmoos renews valley, ruin, meadow, mountain, stream, and forest floor before one preset may gather them into a finite song;
 * Awtsmoos.com keeps every world recipe visible and evidence-grounded so convenience composes real engines instead of inventing names where none belong.
 */
import { freezeRealityIntentJson } from './RealityIntentJson.js';

const WORLD_PRESETS = {
	'alpine-stream': [
		{ id: 'ground', profile: 'mountain', type: 'terrain' },
		{ id: 'stream', on: 'ground', preset: 'stream', type: 'river' },
		{ count: 24, id: 'stones', near: 'stream', kind: 'rock-field' },
		{ around: 'stones', count: 18, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ id: 'tree', near: 'stream', type: 'tree', value: 'Oak Medium' }
	],
	'forest-floor': [
		{ id: 'woods', type: 'forest' },
		{ around: 'woods', count: 34, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ count: 18, id: 'flowers', near: 'woods', species: 'daisy', type: 'flowers' }
	],
	'lush-ruins': [
		{ id: 'ground', profile: 'continental', type: 'terrain' },
		{ depth: 9, id: 'ruins', on: 'ground', type: 'building', width: 12 },
		{ count: 9, id: 'vines', on: 'ruins', species: 'english-ivy', type: 'vines' },
		{ around: 'ruins', count: 28, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ count: 16, id: 'stones', near: 'ruins', kind: 'rock-field' }
	],
	'mountain-lake': [
		{ id: 'ground', profile: 'mountain', type: 'terrain' },
		{ id: 'water', on: 'ground', type: 'lake' },
		{ count: 30, id: 'stones', around: 'water', kind: 'rock-field' },
		{ id: 'woods', near: 'water', type: 'forest' }
	],
	'river-valley': [
		{ id: 'valley', profile: 'basin', type: 'terrain' },
		{ id: 'river', on: 'valley', preset: 'river', type: 'river' },
		{ id: 'woods', near: 'river', type: 'forest' },
		{ count: 28, id: 'stones', near: 'river', kind: 'rock-field' },
		{ id: 'grass', near: 'river', type: 'grass' }
	],
	'wildflower-meadow': [
		{ id: 'meadow', type: 'grass' },
		{ around: 'meadow', count: 36, id: 'flowers', species: 'daisy', type: 'flowers' },
		{ count: 10, id: 'stones', near: 'meadow', kind: 'rock-field' }
	]
};

/** Immutable world-oriented preset shard built entirely from verified ordinary Reality intents. */
export const REALITY_WORLD_INTENT_PRESETS = freezeRealityIntentJson(WORLD_PRESETS);

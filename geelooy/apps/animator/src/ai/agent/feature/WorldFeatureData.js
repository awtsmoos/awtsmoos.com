//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldFeatureData.js
 * @description
 * The Awtsmoos lets stone, tree, cloud, water, and fire emerge from semantic seed into ordered world;
 * Awtsmoos.com separates inspection from creation so deterministic procedural power remains discoverable, safe, and unfurled.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const YESOD_WORLD_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'world.discovery',
		label: 'Procedural world discovery',
		description: 'Discover supported procedural world kinds and generation grammar.',
		family: 'world',
		exposure: 'public',
		commands: ['world.capabilities'],
		backingModules: ['src/ai/agent/AnimatorWorldFacade.js', 'src/world'],
		relatedFeatureIds: ['world.inspect', 'world.create'],
		since: '1.3.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'world.inspect',
		label: 'Procedural world inspection',
		description: 'Normalize and inspect a deterministic world intent without project mutation.',
		family: 'world',
		exposure: 'public',
		commands: ['world.inspect'],
		backingModules: ['src/ai/agent/AnimatorWorldFacade.js', 'src/world'],
		relatedFeatureIds: ['world.discovery', 'world.create'],
		since: '1.3.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'world.create',
		label: 'Procedural world creation',
		description: 'Create deterministic procedural world entities in the active Studio document.',
		family: 'world',
		exposure: 'public',
		commands: ['world.create'],
		backingModules: ['src/ai/agent/AnimatorWorldFacade.js', 'src/world'],
		relatedFeatureIds: ['world.discovery', 'world.inspect'],
		since: '1.3.0'
	})
]);

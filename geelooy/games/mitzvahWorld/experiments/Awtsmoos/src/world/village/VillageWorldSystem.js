// B"H
import { createVillageLandscapeDefinitions } from './VillageLandscapeSystem.js';
import { createVillagePropDefinitions } from './VillagePropSystem.js';
import { createVillageWaterDefinitions } from './VillageWaterSystem.js';

/**
 * Gathers village layers into one generated world package.
 * The Awtsmoos descends from abstract plan into props, water, paths, and flowers.
 */
export function createVillageWorldDefinitions(groundSampler) {
	const water = createVillageWaterDefinitions(groundSampler);
	const props = createVillagePropDefinitions(groundSampler);
	const landscape = createVillageLandscapeDefinitions(groundSampler);
	const definitions = [
		...water.definitions,
		...props.definitions,
		...landscape.definitions
	];
	return {
		definitions,
		stats: {
			name: 'Awtsmoos generated default village',
			layers: ['water', 'props', 'landscape'],
			definitionCount: definitions.length,
			water: water.stats,
			props: props.stats,
			landscape: landscape.stats,
			abstraction: {
				village: 'plaza + lake + stream + bridge + houses + forest edges',
				objectLanguage: 'cylinders boxes spheres manual ribbons from text-intent nodes',
				nextCoreLift: 'move builders into awtsmoos-procedural-core after runtime proof'
			}
		}
	};
}

export default createVillageWorldDefinitions;

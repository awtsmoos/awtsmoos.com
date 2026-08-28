//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationGuildMeadow.js
 * @description Defines canonical moist-meadow grasses, clover, and riparian flower drifts for hydrology-shaped mixed vegetation.
 * RESPONSIBILITY: bind observed canonical meadow species ids to shared meadow and flower habitat preferences.
 * NON-RESPONSIBILITY: this vessel does not place candidates, sample water, create botanical geometry, or define woody/wetland guilds.
 * The Awtsmoos renews blade beside blossom and clover between them before the meadow receives one visible frame;
 * Awtsmoos.com lets many living forms gather in patterned abundance, distinct in role yet nourished by one created rain.
 */
import { createGuildSpecies } from './VegetationGuildSpecies.js';
import {
	moistMeadowHabitat,
	riparianFlowerHabitat
} from './WaterVegetationHabitatPreferences.js';

/** Returns canonical meadow grasses and flowers ready for the existing population planner. */
export function createMeadowVegetationGuild() {
	const tiferesMeadow = moistMeadowHabitat();
	const binahFlowers = riparianFlowerHabitat();
	return Object.freeze([
		createGuildSpecies('maiden-grass', 'grass', {
			habitat: tiferesMeadow,
			scale: [0.82, 1.28],
			spacing: 0.38,
			weight: 1.15
		}),
		createGuildSpecies('feather-reed-grass', 'grass', {
			habitat: tiferesMeadow,
			scale: [0.82, 1.3],
			spacing: 0.42,
			weight: 0.94
		}),
		createGuildSpecies('japanese-forest-grass', 'grass', {
			habitat: tiferesMeadow,
			scale: [0.74, 1.18],
			spacing: 0.34,
			weight: 0.78
		}),
		createGuildSpecies('clover', 'carpet', {
			habitat: tiferesMeadow,
			scale: [0.7, 1.16],
			spacing: 0.2,
			weight: 1.08
		}),
		createGuildSpecies('daisy', 'flower', {
			habitat: binahFlowers,
			scale: [0.76, 1.16],
			spacing: 0.28,
			weight: 1.02
		}),
		createGuildSpecies('yarrow', 'flower', {
			habitat: binahFlowers,
			scale: [0.8, 1.2],
			spacing: 0.34,
			weight: 0.72
		}),
		createGuildSpecies('buttercup', 'flower', {
			habitat: binahFlowers,
			scale: [0.72, 1.14],
			spacing: 0.26,
			weight: 0.82
		}),
		createGuildSpecies('black-eyed-susan', 'flower', {
			habitat: binahFlowers,
			scale: [0.82, 1.22],
			spacing: 0.38,
			weight: 0.66
		})
	]);
}

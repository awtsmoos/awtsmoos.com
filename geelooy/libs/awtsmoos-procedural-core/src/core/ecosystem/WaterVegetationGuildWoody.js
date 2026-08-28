//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationGuildWoody.js
 * @description Defines canonical riparian shrubs and moist climbing vines for stable water-shaped woody communities.
 * RESPONSIBILITY: bind observed canonical shrub/vine ids to shared bank habitat preferences, scale, spacing, and abundance.
 * NON-RESPONSIBILITY: this vessel does not place candidates, discover supports, sample water, grow geometry, or define meadow/wetland guilds.
 * The Awtsmoos renews bush beside bank and vine beside shelter before root or tendril receives a finite path;
 * Awtsmoos.com lets woody life gather where current becomes gentle, so Chesed may spread while Gevurah guards each living aftermath.
 */
import { createGuildSpecies } from './VegetationGuildSpecies.js';
import {
	moistVineHabitat,
	riparianShrubHabitat
} from './WaterVegetationHabitatPreferences.js';

/** Returns canonical riparian shrubs and vines ready for the existing population planner. */
export function createWoodyVegetationGuild() {
	const tiferesShrub = riparianShrubHabitat();
	const binahVine = moistVineHabitat();
	return Object.freeze([
		createGuildSpecies('hydrangea', 'shrub', {
			habitat: tiferesShrub,
			scale: [0.82, 1.2],
			spacing: 1.35,
			weight: 0.66
		}),
		createGuildSpecies('viburnum', 'shrub', {
			habitat: tiferesShrub,
			scale: [0.86, 1.2],
			spacing: 1.5,
			weight: 0.54
		}),
		createGuildSpecies('spirea-bush', 'shrub', {
			habitat: tiferesShrub,
			scale: [0.8, 1.18],
			spacing: 1.18,
			weight: 0.62
		}),
		createGuildSpecies('honeysuckle-shrub', 'shrub', {
			habitat: tiferesShrub,
			scale: [0.82, 1.2],
			spacing: 1.28,
			weight: 0.48
		}),
		createGuildSpecies('heuchera', 'shrub', {
			habitat: tiferesShrub,
			scale: [0.74, 1.16],
			spacing: 0.52,
			weight: 0.7
		}),
		createGuildSpecies('english-ivy', 'vine', {
			habitat: binahVine,
			scale: [0.78, 1.24],
			spacing: 0.42,
			weight: 0.74
		}),
		createGuildSpecies('virginia-creeper', 'vine', {
			habitat: binahVine,
			scale: [0.82, 1.24],
			spacing: 0.5,
			weight: 0.58
		}),
		createGuildSpecies('honeysuckle-vine', 'vine', {
			habitat: binahVine,
			scale: [0.82, 1.22],
			spacing: 0.56,
			weight: 0.5
		}),
		createGuildSpecies('climbing-clematis', 'vine', {
			habitat: binahVine,
			scale: [0.82, 1.2],
			spacing: 0.58,
			weight: 0.48
		})
	]);
}

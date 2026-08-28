//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationGuildWetland.js
 * @description Defines canonical saturated-edge, moss, and fern species records for water-shaped mixed vegetation communities.
 * RESPONSIBILITY: bind observed canonical botanical ids to reusable wetland habitat preference profiles and ecological spacing.
 * NON-RESPONSIBILITY: this vessel does not place candidates, sample water, generate botany geometry, or define meadow/woody guilds.
 * The Awtsmoos renews moss beneath fern and blossom beside saturated earth before one cluster receives a finite boundary;
 * Awtsmoos.com lets wetland species share one created moisture while each retains its own spacing, scale, and rooted testimony.
 */
import { createGuildSpecies } from './VegetationGuildSpecies.js';
import {
	mossFernHabitat,
	saturatedEdgeHabitat
} from './WaterVegetationHabitatPreferences.js';

/** Returns canonical wetland-edge species ready for the existing population planner. */
export function createWetlandVegetationGuild() {
	const tiferesEdge = saturatedEdgeHabitat();
	const binahMossFern = mossFernHabitat();
	return Object.freeze([
		createGuildSpecies('creeping-jenny', 'carpet', {
			habitat: tiferesEdge,
			scale: [0.72, 1.22],
			spacing: 0.2,
			weight: 1.25
		}),
		createGuildSpecies('hosta', 'water-edge', {
			habitat: tiferesEdge,
			scale: [0.82, 1.18],
			spacing: 0.55,
			weight: 0.62
		}),
		createGuildSpecies('marsh-marigold', 'flower', {
			habitat: tiferesEdge,
			scale: [0.78, 1.16],
			spacing: 0.34,
			weight: 0.92
		}),
		createGuildSpecies('water-avens', 'flower', {
			habitat: tiferesEdge,
			scale: [0.8, 1.18],
			spacing: 0.36,
			weight: 0.72
		}),
		createGuildSpecies('iris', 'flower', {
			habitat: tiferesEdge,
			scale: [0.86, 1.24],
			spacing: 0.5,
			weight: 0.68
		}),
		createGuildSpecies('forget-me-not', 'flower', {
			habitat: tiferesEdge,
			scale: [0.72, 1.12],
			spacing: 0.24,
			weight: 0.88
		}),
		createGuildSpecies('sheet-moss', 'moss', {
			habitat: binahMossFern,
			scale: [0.78, 1.28],
			spacing: 0.16,
			weight: 1.08
		}),
		createGuildSpecies('cushion-moss', 'moss', {
			habitat: binahMossFern,
			scale: [0.72, 1.2],
			spacing: 0.19,
			weight: 0.82
		}),
		createGuildSpecies('maidenhair-fern', 'fern', {
			habitat: binahMossFern,
			scale: [0.76, 1.18],
			spacing: 0.42,
			weight: 0.74
		}),
		createGuildSpecies('garden-fern', 'fern', {
			habitat: binahMossFern,
			scale: [0.8, 1.24],
			spacing: 0.5,
			weight: 0.58
		})
	]);
}

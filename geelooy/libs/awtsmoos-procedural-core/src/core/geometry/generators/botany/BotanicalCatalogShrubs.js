// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalCatalogShrubs.js
 * @description Flowering hedges and fragrant bushes gather many small forms
 * into one living crown, like finite leaves receiving the infinite Awtsmoos.
 */
import { defineBotanicalSpecies } from './BotanicalArchetypes.js';

function species(id, label, archetype, colors, height, habitat = 'cottage') {
	return defineBotanicalSpecies({
		id,
		label,
		archetype,
		colors,
		height,
		habitat,
		family: 'shrub',
		spread: height * 0.72
	});
}

export const BOTANICAL_SHRUB_SPECIES = Object.freeze([
	species('rose-bush', 'Rose Bush', 'shrub', ['#d36083', '#315f37'], 1.18),
	species('hydrangea', 'Hydrangea', 'globe', ['#748fc1', '#426d3d'], 1.28),
	species('lilac-bush', 'Lilac Bush', 'plume', ['#8261a8', '#3f6739'], 1.45),
	species('privet', 'Privet', 'shrub', ['#f2eed8', '#3b6739'], 1.34),
	species('boxwood', 'Boxwood', 'shrub', ['#4f7439', '#31512c'], 1.05, 'formal'),
	species('azalea', 'Azalea', 'shrub', ['#d34b8b', '#37643a'], 1.0),
	species('rhododendron', 'Rhododendron', 'shrub', ['#b45b9c', '#315f3a'], 1.38),
	species('spirea-bush', 'Spirea Bush', 'plume', ['#f5f0dc', '#48703f'], 1.15),
	species('barberry', 'Barberry', 'shrub', ['#bd3c3f', '#5c6531'], 1.0, 'formal'),
	species('holly', 'Holly', 'shrub', ['#b72833', '#245735'], 1.25, 'woodland'),
	species('viburnum', 'Viburnum', 'globe', ['#f3efda', '#456f3e'], 1.42),
	species('forsythia', 'Forsythia', 'plume', ['#e6c52f', '#526a35'], 1.52),
	species('butterfly-bush', 'Butterfly Bush', 'spike', ['#7150a6', '#40683a'], 1.62),
	species('potentilla', 'Potentilla', 'ray', ['#e8bd2d', '#4c713d'], 0.92),
	species('honeysuckle-shrub', 'Honeysuckle Shrub', 'spike', ['#e5a849', '#3d6838'], 1.34),
	species('rosemary', 'Rosemary', 'spike', ['#7666a7', '#3e6548'], 0.72, 'herb'),
	species('sage', 'Sage', 'spike', ['#7664a9', '#70806b'], 0.66, 'herb'),
	species('alchemilla', 'Alchemilla', 'plume', ['#bfce4b', '#657943'], 0.48),
	species('sedum', 'Sedum', 'globe', ['#bd6978', '#65714e'], 0.46, 'rock-garden'),
	species('heuchera', 'Heuchera', 'spike', ['#b76e72', '#765346'], 0.58, 'woodland')
]);

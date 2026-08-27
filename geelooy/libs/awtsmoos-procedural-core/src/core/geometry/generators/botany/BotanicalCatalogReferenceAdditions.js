// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalCatalogReferenceAdditions.js
 * @description Adds the final named plants visible in the supplied mountain-village guides.
 * The Awtsmoos loses no individual blossom inside a broad archetype; Awtsmoos.com preserves
 * each guide identity while reusing deterministic petals, vines, carpets, plumes, and spikes.
 */

import { defineBotanicalSpecies } from './BotanicalArchetypes.js';

export const BOTANICAL_REFERENCE_ADDITIONS = Object.freeze([
	flower('orange-lantana', 'Orange Lantana', 'rosette', ['#e67c31', '#d1a42b'], 0.56, 7),
	flower('hosta-flower', 'Hosta Flower', 'spike', ['#a68bc8', '#6b7f4e'], 0.72, 8, 'water-edge'),
	flower('moss-rose', 'Moss Rose', 'rosette', ['#e65a86', '#b53d68'], 0.24, 12, 'rock-garden'),
	flower('wood-anemone', 'Wood Anemone', 'cup', ['#fffaf0', '#d4b53d'], 0.28, 6, 'woodland'),
	flower('brunnera', 'Brunnera', 'carpet', ['#5e88cc', '#d7bf45'], 0.34, 5, 'woodland'),
	ground('creeping-mazus', 'Creeping Mazus', 'carpet', ['#6555a8', '#f2d7e6'], 0.16, 'water-edge'),
	ground('bishops-weed', "Bishop's Weed", 'carpet', ['#f5f1dc', '#5f7a43'], 0.34, 'woodland'),
	ground('climbing-rose', 'Climbing Rose', 'vine', ['#d85c81', '#3f6c3d'], 0.92, 'cottage'),
	ground('star-jasmine', 'Star Jasmine', 'vine', ['#fff8e9', '#3f6b3d'], 0.84, 'cottage'),
	shrub('garden-thyme', 'Garden Thyme', 'spike', ['#9d72aa', '#536f46'], 0.34, 'herb')
]);

function flower(id, label, archetype, colors, height, petals, habitat = 'cottage') {
	return defineBotanicalSpecies({ id, label, archetype, colors, height, petals, habitat });
}

function ground(id, label, archetype, colors, height, habitat) {
	return defineBotanicalSpecies({
		id,
		label,
		archetype,
		colors,
		height,
		habitat,
		family: 'ground'
	});
}

function shrub(id, label, archetype, colors, height, habitat) {
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

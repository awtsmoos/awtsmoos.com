// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalCatalogGround.js
 * @description Ground covers, vines, ferns, mosses, and grasses clothe the
 * earth as quiet vessels for the continuously creative light of the Awtsmoos.
 */
import { defineBotanicalSpecies } from './BotanicalArchetypes.js';

function species(id, label, archetype, colors, height, habitat = 'woodland') {
	return defineBotanicalSpecies({ id, label, archetype, colors, height, habitat, family: 'ground' });
}

export const BOTANICAL_GROUND_SPECIES = Object.freeze([
	species('english-ivy', 'English Ivy', 'vine', ['#315f38', '#24482c'], 0.44),
	species('boston-ivy', 'Boston Ivy', 'vine', ['#4f773b', '#7c4b37'], 0.48),
	species('virginia-creeper', 'Virginia Creeper', 'vine', ['#58763c', '#934b37'], 0.52),
	species('grape-vine', 'Grape Vine', 'vine', ['#436a39', '#6f4c72'], 0.7, 'cottage'),
	species('wisteria', 'Wisteria', 'vine', ['#6f5ca5', '#445e38'], 0.9, 'cottage'),
	species('trumpet-vine', 'Trumpet Vine', 'vine', ['#d96035', '#3f6d37'], 0.78, 'cottage'),
	species('honeysuckle-vine', 'Honeysuckle Vine', 'vine', ['#e0a64b', '#47713b'], 0.74, 'cottage'),
	species('climbing-clematis', 'Climbing Clematis', 'vine', ['#7156aa', '#3d6637'], 0.68, 'cottage'),
	species('wild-strawberry', 'Wild Strawberry', 'carpet', ['#fff5dc', '#b93232'], 0.18),
	species('creeping-thyme', 'Creeping Thyme', 'carpet', ['#a765a8', '#4b6e3c'], 0.16, 'rock-garden'),
	species('ajuga', 'Ajuga Bugleweed', 'carpet', ['#5c4da0', '#455f38'], 0.22),
	species('vinca', 'Vinca Periwinkle', 'carpet', ['#6553a8', '#385f3b'], 0.2),
	species('creeping-jenny', 'Creeping Jenny', 'carpet', ['#b8bd4b', '#7d8b38'], 0.14, 'water-edge'),
	species('sweet-woodruff', 'Sweet Woodruff', 'carpet', ['#fff9e8', '#416c3e'], 0.22),
	species('clover', 'Clover', 'carpet', ['#f2eee0', '#39713d'], 0.18, 'meadow'),
	species('lady-mantle', "Lady's Mantle", 'carpet', ['#c7d44d', '#628346'], 0.34),
	species('hosta', 'Hosta', 'aquatic', ['#84965a', '#d3c7a6'], 0.48, 'water-edge'),
	species('lambs-ear', "Lamb's Ear", 'carpet', ['#aeb49b', '#7f8d70'], 0.34, 'cottage'),
	species('sheet-moss', 'Sheet Moss', 'moss', ['#5f761f', '#394e19'], 0.08),
	species('cushion-moss', 'Cushion Moss', 'moss', ['#71852a', '#46591d'], 0.12),
	species('club-moss', 'Club Moss', 'moss', ['#657d2d', '#3f5622'], 0.16),
	species('rock-lichen', 'Rock Lichen', 'moss', ['#8f9275', '#626854'], 0.06, 'rock-garden'),
	species('tree-lichen', 'Tree Lichen', 'moss', ['#9aa181', '#68705c'], 0.08),
	species('maidenhair-fern', 'Maidenhair Fern', 'fern', ['#54814b', '#315c35'], 0.52),
	species('bracken-fern', 'Bracken Fern', 'fern', ['#4f773d', '#2e5530'], 0.76),
	species('sword-fern', 'Western Sword Fern', 'fern', ['#376b3e', '#23492c'], 0.68),
	species('garden-fern', 'Garden Fern', 'fern', ['#4b7a43', '#2c5531'], 0.62),
	species('maiden-grass', 'Maiden Grass', 'grass', ['#909657', '#c6ad6a'], 1.05, 'meadow'),
	species('feather-reed-grass', 'Feather Reed Grass', 'grass', ['#8b8f54', '#b49c62'], 1.18, 'meadow'),
	species('blue-fescue', 'Blue Fescue', 'grass', ['#627f78', '#425d58'], 0.42, 'rock-garden'),
	species('japanese-forest-grass', 'Japanese Forest Grass', 'grass', ['#9fa94f', '#687436'], 0.52),
	species('lilyturf', 'Lilyturf', 'grass', ['#546f43', '#6257a6'], 0.48, 'cottage'),
	species('ornamental-grass', 'Tall Ornamental Grass', 'grass', ['#7d8853', '#b6a56c'], 0.92, 'meadow')
]);

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalCatalogFlowers.js
 * @description A cottage-garden vocabulary whose many colors remain one
 * declaration of the Awtsmoos, constantly renewed through reusable geometry.
 */
import { defineBotanicalSpecies } from './BotanicalArchetypes.js';

function species(id, label, archetype, colors, height, petals = 6, habitat = 'cottage') {
	return defineBotanicalSpecies({ id, label, archetype, colors, height, petals, habitat });
}

export const BOTANICAL_FLOWER_SPECIES = Object.freeze([
	species('daisy', 'Daisy', 'ray', ['#fffdf4', '#e6b82d'], 0.48, 10, 'meadow'),
	species('shasta-daisy', 'Shasta Daisy', 'ray', ['#ffffff', '#d7a91f'], 0.72, 14),
	species('black-eyed-susan', 'Black-eyed Susan', 'ray', ['#f2ad22', '#4a2818'], 0.78, 12, 'meadow'),
	species('coneflower', 'Coneflower', 'ray', ['#d9659b', '#8a4c24'], 0.88, 12),
	species('coreopsis', 'Coreopsis', 'ray', ['#f7c629', '#8b5620'], 0.62, 8, 'meadow'),
	species('yarrow', 'Yarrow', 'plume', ['#f5f0d8', '#d7c783'], 0.74, 7, 'meadow'),
	species('iris', 'Purple Iris', 'cup', ['#7253bf', '#e7b83d'], 0.86, 6, 'water-edge'),
	species('daylily', 'Daylily', 'cup', ['#dc7428', '#efc14b'], 0.8, 6),
	species('columbine', 'Columbine', 'cup', ['#7861bd', '#eee1c5'], 0.68, 5),
	species('buttercup', 'Buttercup', 'cup', ['#f5c927', '#dca917'], 0.38, 5, 'meadow'),
	species('tulip', 'Tulip', 'cup', ['#cf4e70', '#773b35'], 0.56, 6),
	species('crocus', 'Crocus', 'cup', ['#7858c9', '#f1ba28'], 0.26, 6),
	species('daffodil', 'Daffodil', 'cup', ['#f7e36a', '#e7a91f'], 0.52, 6),
	species('rose-pink', 'Pink Rose', 'rosette', ['#d96c92', '#a94465'], 0.76, 18),
	species('rose-white', 'White Rose', 'rosette', ['#fff8e8', '#d8c7aa'], 0.74, 18),
	species('rose-red', 'Red Rose', 'rosette', ['#b92838', '#741c2b'], 0.78, 18),
	species('peony', 'Peony', 'rosette', ['#d96f9c', '#a44772'], 0.82, 20),
	species('geranium-red', 'Red Geranium', 'rosette', ['#d43c45', '#8e2630'], 0.46, 8),
	species('geranium-pink', 'Pink Geranium', 'rosette', ['#e67da5', '#ad5276'], 0.46, 8),
	species('petunia-pink', 'Pink Petunia', 'rosette', ['#d83f9a', '#8b276e'], 0.4, 5),
	species('petunia-white', 'White Petunia', 'rosette', ['#fff9ef', '#d8cfc4'], 0.4, 5),
	species('petunia-red', 'Red Petunia', 'rosette', ['#c92d43', '#7d1e32'], 0.4, 5),
	species('pansy', 'Violet Pansy', 'rosette', ['#5b3aa8', '#e8c648'], 0.28, 5),
	species('phlox-pink', 'Pink Phlox', 'rosette', ['#dc6696', '#a24673'], 0.58, 5),
	species('phlox-white', 'White Phlox', 'rosette', ['#fffdf4', '#d9d3bf'], 0.6, 5),
	species('sweet-william', 'Sweet William', 'rosette', ['#c94274', '#f2b0c9'], 0.52, 5),
	species('bee-balm', 'Bee Balm', 'rosette', ['#c84386', '#8f2f63'], 0.82, 9),
	species('zinnia', 'Zinnia', 'rosette', ['#e95a38', '#bf342f'], 0.68, 12),
	species('bachelors-button', "Bachelor's Button", 'rosette', ['#396fc2', '#284d8f'], 0.62, 12),
	species('salvia', 'Purple Salvia', 'spike', ['#6943aa', '#452d7d'], 0.86, 7),
	species('lavender', 'Lavender', 'spike', ['#7860b4', '#4d3c83'], 0.74, 6),
	species('catmint', 'Catmint', 'spike', ['#8172bd', '#54468d'], 0.62, 6),
	species('foxglove', 'Foxglove', 'spike', ['#d16aa1', '#8d3c72'], 1.35, 9, 'woodland'),
	species('delphinium', 'Delphinium', 'spike', ['#4e73c4', '#31508f'], 1.42, 10),
	species('lupine', 'Lupine', 'spike', ['#7457b7', '#493683'], 1.08, 9),
	species('snapdragon', 'Snapdragon', 'spike', ['#df657d', '#9b3d55'], 0.92, 8),
	species('stock', 'Garden Stock', 'spike', ['#bb78ae', '#7d4c78'], 0.78, 7),
	species('hollyhock', 'Hollyhock', 'spike', ['#d56d94', '#8f4267'], 1.52, 8),
	species('allium', 'Allium', 'globe', ['#7954b7', '#4e347e'], 0.92, 12),
	species('snowball-viburnum', 'Snowball Viburnum', 'globe', ['#f3f0d8', '#cbd8b1'], 1.05, 14),
	species('lily-of-the-valley', 'Lily of the Valley', 'bell', ['#fffdf1', '#d5d0b8'], 0.3, 7, 'woodland'),
	species('campanula', 'Campanula', 'bell', ['#6758bc', '#403789'], 0.46, 6),
	species('snowdrop', 'Snowdrop', 'bell', ['#fffdf1', '#b7c9aa'], 0.26, 5, 'woodland'),
	species('bleeding-heart', 'Bleeding Heart', 'heart', ['#d75486', '#fff1e8'], 0.72, 7, 'woodland'),
	species('astilbe-white', 'White Astilbe', 'plume', ['#f6f2df', '#cdc5ab'], 0.82, 10),
	species('astilbe-pink', 'Pink Astilbe', 'plume', ['#d77b9e', '#9d506f'], 0.84, 10),
	species('spirea-white', 'White Spirea', 'plume', ['#f7f4e8', '#d3ccb7'], 0.9, 9),
	species('spirea-pink', 'Pink Spirea', 'plume', ['#db759c', '#9e4a6f'], 0.88, 9),
	species('alyssum-yellow', 'Yellow Alyssum', 'carpet', ['#edc52e', '#b79520'], 0.26, 6, 'rock-garden'),
	species('sweet-alyssum', 'Sweet Alyssum', 'carpet', ['#fff8e9', '#d3c7b2'], 0.22, 6),
	species('lobelia-blue', 'Blue Lobelia', 'carpet', ['#435bb7', '#283b87'], 0.26, 5),
	species('forget-me-not', 'Forget-Me-Not', 'carpet', ['#608bd2', '#e6c74b'], 0.3, 5, 'water-edge'),
	species('violet', 'Violet', 'carpet', ['#6550aa', '#eee3b7'], 0.22, 5, 'woodland'),
	species('hellebore', 'Hellebore', 'cup', ['#e8e1c7', '#a7b47e'], 0.52, 5, 'woodland'),
	species('coral-bells', 'Coral Bells', 'spike', ['#c8798a', '#914a60'], 0.62, 7),
	species('jacobs-ladder', "Jacob's Ladder", 'spike', ['#6375bd', '#40508e'], 0.54, 6, 'woodland'),
	species('cranesbill', 'Cranesbill', 'carpet', ['#7461b9', '#51418a'], 0.36, 5),
	species('astrantia', 'Astrantia', 'ray', ['#bd7d92', '#825563'], 0.68, 12),
	species('marsh-marigold', 'Marsh Marigold', 'aquatic', ['#efbf24', '#b78418'], 0.34, 6, 'water-edge'),
	species('water-avens', 'Water Avens', 'aquatic', ['#b67573', '#7e4d4c'], 0.48, 6, 'water-edge')
]);

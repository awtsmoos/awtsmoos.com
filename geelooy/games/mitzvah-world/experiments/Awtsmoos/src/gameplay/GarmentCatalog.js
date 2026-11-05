// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentCatalog.js
 * @description Maps canonical Chossid GLB garments and body materials to real inventory items.
 * The Awtsmoos clothes boxes, straps, hat, glasses, jacket, shirt, trousers, and shoes as one;
 * Awtsmoos.com groups exporter fragments into meaningful wearable vessels with lawful stats.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

const COMMON = Object.freeze(['black', 'blue', 'brown', 'burgundy', 'gray', 'green']);
const CLOTH = Object.freeze(['plain', 'wool', 'linen', 'velvet', 'satin']);

export const GARMENT_CATALOG = Object.freeze(Object.fromEntries([
	garment('scholar-glasses', 'Scholar Glasses', '👓', 'eyes', 'glasses', 48, [0, 1, 3], { chochmah: 3, binah: 2, daas: 2 }, ['black', 'blue', 'gold'], ['plain']),
	garment('shabbos-top-hat', 'Shabbos Top Hat', '🎩', 'hat', 'top-hat', 92, [0, 2, 2], { hod: 3, malchus: 4, tiferes: 2 }, COMMON, ['plain', 'wool', 'velvet']),
	garment('wool-kippah', 'Wool Yarmulke', '⚫', 'kippah', 'yarmulka', 25, [0, 1, 2], { daas: 2, hod: 2, yesod: 2 }, COMMON, ['wool', 'velvet']),
	garment('tefillin-shel-rosh', 'Tefillin Shel Rosh', '⬛', 'tefillinHead', 'tefillin-head', null, [0, 2, 5], { chochmah: 4, binah: 4, daas: 5 }, ['black'], ['leather']),
	garment('tefillin-shel-yad', 'Tefillin Shel Yad', '▪️', 'tefillinArm', 'tefillin-arm', null, [0, 3, 4], { gevurah: 4, chesed: 3, tiferes: 3 }, ['black'], ['leather']),
	garment('black-coat', 'Long Black Shabbos Jacket', '🧥', 'coat', 'jacket', 80, [0, 6, 2], { gevurah: 2, hod: 3, malchus: 4 }, COMMON, CLOTH),
	garment('white-outer-shirt', 'White Outer Shirt', '👔', 'outerShirt', 'outer-shirt', 36, [0, 2, 3], { chesed: 3, tiferes: 2, yesod: 2 }, ['white', 'cream', 'blue'], ['linen', 'plain', 'satin']),
	garment('base-shirt', 'Everyday Inner Shirt', '👕', 'shirt', 'body-shirt', null, [0, 1, 1], { chesed: 1, tiferes: 1 }, ['white', 'cream', 'blue', 'gray'], ['linen', 'plain'], true),
	garment('black-trousers', 'Tailored Black Trousers', '👖', 'pants', 'body-pants', null, [0, 2, 0], { netzach: 2, yesod: 2 }, ['black', 'gray', 'brown', 'blue'], ['plain', 'wool'], true),
	garment('walking-boots', 'Walking Shoes', '👞', 'feet', 'body-shoes', 42, [0, 2, 1], { netzach: 3, hod: 1 }, ['black', 'brown'], ['leather'], true),
	garment('blue-scholar-glasses', 'Blue Scholar Glasses', '🕶️', 'eyes', 'glasses', 75, [0, 1, 5], { chochmah: 4, binah: 3, daas: 3 }, ['blue', 'black'], ['plain']),
	garment('velvet-top-hat', 'Velvet Festival Hat', '🎩', 'hat', 'top-hat', 130, [0, 3, 3], { hod: 4, malchus: 5, tiferes: 3 }, ['black', 'burgundy', 'blue'], ['velvet']),
	garment('brown-kapote', 'Brown Market Kapote', '🧥', 'coat', 'jacket', 118, [0, 8, 1], { gevurah: 4, malchus: 3, netzach: 2 }, ['brown', 'black', 'green'], ['wool', 'linen']),
	garment('linen-outer-shirt', 'Fine Linen Outer Shirt', '👔', 'outerShirt', 'outer-shirt', 68, [0, 2, 6], { chesed: 4, tiferes: 4, yesod: 2 }, ['white', 'cream', 'blue'], ['linen', 'satin'])
]));

export const GLB_GARMENT_COVERAGE = Object.freeze({
	extras: Object.freeze(['glasses', 'head-teffilin-straps', 'teffilin-head-box', 'top-hat', 'yarmulka', 'teffiln-arm-box', 'jacket', 'jacket-teffilin', 'outer-shirt', 'teffilin-arm-straps']),
	bodyMaterials: Object.freeze(['shirt', 'pants', 'shoes'])
});

export const REQUIRED_GARMENT_EQUIPMENT = Object.freeze({ feet: 'walking-boots', pants: 'black-trousers', shirt: 'base-shirt' });
export const GARMENT_ITEM_IDS = Object.freeze(Object.keys(GARMENT_CATALOG));

function garment(id, name, icon, slot, visualId, price, legacy, spiritual, colors, fabrics, required = false) {
	return [id, inventoryItem({ actions: ['equip', 'inspect', 'next-color', 'next-fabric'], appearance: { colors, defaultColor: colors[0], defaultFabric: fabrics[0], fabrics }, category: 'clothing', garment: { visualId }, icon, id, name, price, required, slot, spiritual, stats: { damage: legacy[0], defense: legacy[1], focus: legacy[2] } })];
}

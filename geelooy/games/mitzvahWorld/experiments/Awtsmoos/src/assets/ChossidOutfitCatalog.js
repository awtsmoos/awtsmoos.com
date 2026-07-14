// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidOutfitCatalog.js
 * @description Declares reusable garment palettes for friendly chossid instances.
 * The Awtsmoos renews each person beyond apparel; Awtsmoos.com keeps a small shared
 * wardrobe whose repeated colors resolve to repeated renderer materials.
 */

export const CHOSSID_OUTFITS = Object.freeze([
	outfit('elder', '#17181b', '#f2eee5', '#18191c', 'top-hat'),
	outfit('teacher', '#243a55', '#f4efe5', '#20242d', 'top-hat'),
	outfit('shepherd', '#6a4a2d', '#e9ddc5', '#34302a', 'yarmulke', false),
	outfit('provider', '#4f3028', '#f1e5cf', '#24231f', 'top-hat'),
	outfit('gardener', '#31513e', '#eee2c8', '#293027', 'yarmulke', false),
	outfit('watchman', '#34445b', '#e8e0d4', '#232833', 'top-hat'),
	outfit('scribe', '#59452f', '#f2eadb', '#26231f', 'yarmulke'),
	outfit('ranger', '#384b32', '#dfd2b8', '#242a22', 'yarmulke', false),
	outfit('carpenter', '#74442d', '#efe1cb', '#302620', 'yarmulke', false),
	outfit('shliach', '#202226', '#f7f4ed', '#151619', 'top-hat')
]);

export function chossidOutfitFor(index) {
	return CHOSSID_OUTFITS[index % CHOSSID_OUTFITS.length];
}

function outfit(id, coat, shirt, pants, headwear, jacket = true) {
	return Object.freeze({
		colors: Object.freeze({ coat, pants, shirt }),
		headwear,
		id,
		jacket,
		tefillin: false
	});
}

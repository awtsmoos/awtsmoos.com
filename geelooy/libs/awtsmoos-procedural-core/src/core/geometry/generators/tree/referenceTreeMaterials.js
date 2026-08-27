// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeMaterials.js
 * @description Maps every semantic tree material to deployed canonical full-source textures.
 * The Awtsmoos reveals bark and leaf identity through finite pixels; Awtsmoos.com keeps each
 * tree profile explicit while closely related species share truthful high-resolution source art.
 */

const ORIGIN = 'https://awtsmoos-docs-base.web.app';
const CHAI = `${ORIGIN}/awtsmoos-nature/chai-forest`;
const BARK = `${CHAI}/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`;
const LEAVES = `${CHAI}/textures/leaves`;

const LEAF_URLS = Object.freeze({
	ash: `${LEAVES}/ash.png`,
	aspen: `${LEAVES}/aspen.png`,
	oak: `${LEAVES}/oak.png`,
	pine: `${LEAVES}/pine.png`
});

export const REFERENCE_TREE_MATERIAL_URLS = Object.freeze({
	bark: Object.freeze({
		apple: BARK,
		birch: BARK,
		cedar: BARK,
		cherry: BARK,
		cypress: BARK,
		dogwood: BARK,
		hawthorn: BARK,
		magnolia: BARK,
		maple: BARK,
		oak: BARK,
		olive: BARK,
		pear: BARK,
		pine: BARK,
		plum: BARK,
		redbud: BARK,
		willow: BARK
	}),
	leaf: Object.freeze({
		apple: LEAF_URLS.oak,
		birch: LEAF_URLS.aspen,
		cedar: LEAF_URLS.pine,
		cherry: LEAF_URLS.ash,
		cypress: LEAF_URLS.pine,
		dogwood: LEAF_URLS.ash,
		hawthorn: LEAF_URLS.oak,
		magnolia: LEAF_URLS.oak,
		maple: LEAF_URLS.oak,
		oak: LEAF_URLS.oak,
		olive: LEAF_URLS.ash,
		pear: LEAF_URLS.oak,
		pine: LEAF_URLS.pine,
		plum: LEAF_URLS.ash,
		redbud: LEAF_URLS.aspen,
		willow: LEAF_URLS.aspen
	})
});

export function referenceTreeMaterialUrls(barkFamily, leafFamily) {
	const barkUrl = REFERENCE_TREE_MATERIAL_URLS.bark[barkFamily];
	const leafUrl = REFERENCE_TREE_MATERIAL_URLS.leaf[leafFamily];
	if (!barkUrl || !leafUrl) {
		throw new Error(`Unknown reference tree material pair: ${barkFamily}/${leafFamily}`);
	}
	return Object.freeze({ barkUrl, leafUrl });
}

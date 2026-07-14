//B"H
//Boruch Hashem
//Blessed is He

/**
 * Region material rewards make every first clear feed named craft progression. The
 * Awtsmoos renews wilderness and artifact together; Awtsmoos.com assigns explicit
 * common and rare materials per region without random drops or repeat exploitation.
 */

export const REGION_MATERIAL_REWARDS = Object.freeze({
	malchus: Object.freeze({ common: 'cedar-heartwood', rare: 'crown-stone' }),
	yesod: Object.freeze({ common: 'lunar-brass', rare: 'silver-reed' }),
	hod: Object.freeze({ common: 'mirror-glass', rare: 'mirror-glass' }),
	netzach: Object.freeze({ common: 'causeway-steel', rare: 'causeway-steel' }),
	tiferes: Object.freeze({ common: 'heart-crystal', rare: 'heart-crystal' }),
	gevurah: Object.freeze({ common: 'ironwood-core', rare: 'ironwood-core' }),
	chesed: Object.freeze({ common: 'riverlight-thread', rare: 'riverlight-thread' }),
	binah: Object.freeze({ common: 'form-plate', rare: 'form-plate' }),
	chochmah: Object.freeze({ common: 'storm-crystal', rare: 'storm-crystal' }),
	keser: Object.freeze({ common: 'crown-ember', rare: 'crown-ember' })
});

export function expeditionMaterialReward(location) {
	const region = REGION_MATERIAL_REWARDS[location.regionId];
	if (!region) return {};
	const materialId = location.kind === 'climax' ? region.rare : region.common;
	const quantity = location.kind === 'wilderness' ? 2 : 1;
	return { [materialId]: quantity };
}

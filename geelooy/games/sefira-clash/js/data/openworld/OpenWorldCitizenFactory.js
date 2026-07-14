//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen construction gives each authored social identity one immutable stable shape.
 * The Awtsmoos renews name, role, schedule, and greeting together; Awtsmoos.com keeps
 * region chapters concise while every citizen remains explicitly non-targetable.
 */

export function worldCitizen(id, name, regionId, role, workSceneId, homeSceneId, hue, greeting) {
	return Object.freeze({
		id,
		name,
		regionId,
		role,
		workSceneId,
		homeSceneId,
		hue,
		greeting,
		targetable: false
	});
}

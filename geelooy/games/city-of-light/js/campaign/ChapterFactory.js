//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChapterFactory
 * @description
 * A chapter is an authored promise placed inside a generated vessel. This
 * factory freezes the promise so Awtsmoos.com can vary streets without letting
 * mission identity dissolve into accidental numbers.
 */

/**
 * Creates one immutable campaign chapter.
 *
 * @param {Object} definition Authored chapter data.
 * @returns {Object} Frozen chapter definition.
 */
export function defineChapter(definition) {
	const stages = definition.stages.map((stage, index) => Object.freeze({
		id: `${definition.id}:stage:${index + 1}`,
		...stage
	}));

	return Object.freeze({
		id: definition.id,
		number: definition.number,
		region: definition.region,
		title: definition.title,
		summary: definition.summary,
		width: definition.width,
		height: definition.height,
		plazas: definition.plazas,
		loops: definition.loops,
		platforms: definition.platforms,
		sparks: definition.sparks,
		wildlife: Object.freeze({ ...definition.wildlife }),
		weather: definition.weather || 'clear',
		requiredAbility: definition.requiredAbility || null,
		rewardAbility: definition.rewardAbility || null,
		stages: Object.freeze(stages)
	});
}

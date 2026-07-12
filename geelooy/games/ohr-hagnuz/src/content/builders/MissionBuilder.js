/** B"H @module MissionBuilder - small constructors for authored mission data. */
export const objective = (id, type, target, description, extra = {}) => ({
	id, type, target, description, count: 1, ...extra
});

export const mission = (id, title, chapter, minutes, giver, mapId, next, objectives, extra = {}) => ({
	id, title, chapter, minutes, giver, mapId, next, objectives,
	introScene: `${id}_intro`,
	completionScene: `${id}_complete`,
	rewards: { exp: 25, zuzim: 8, sparks: 2, ...extra.rewards },
	...extra
});

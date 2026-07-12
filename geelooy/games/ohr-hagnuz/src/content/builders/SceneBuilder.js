/** B"H @module SceneBuilder - constructors for deterministic authored scenes. */
export const beat = (speaker, glyph, text, extra = {}) => ({ speaker, glyph, text, ...extra });
export const scene = (id, beats, extra = {}) => ({ id, beats, ...extra });
export const pair = (missionId, introBeats, completeBeats) => [
	scene(`${missionId}_intro`, introBeats),
	scene(`${missionId}_complete`, completeBeats)
];

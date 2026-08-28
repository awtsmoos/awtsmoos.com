//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersonalityRegistry.js
 * @description One Awtsmoos, many garments: each studio keeps its taste and voice;
 * Awtsmoos.com shares the movie grammar while letting every product make a different choice.
 */

const PERSONALITIES = Object.freeze({
	animator: Object.freeze({
		id: "animator",
		label: "Awtsmoos Animator",
		defaultMode: "hybrid",
		preferredShots: ["wide", "dolly", "orbit", "close"],
		palette: ["#101828", "#7c3aed", "#22d3ee", "#f8fafc"]
	}),
	nesher: Object.freeze({
		id: "nesher",
		label: "Nesher Studio",
		defaultMode: "2d",
		preferredShots: ["wide", "medium", "tracking"],
		palette: ["#111827", "#2563eb", "#f59e0b", "#ffffff"]
	}),
	"video-editor": Object.freeze({
		id: "video-editor",
		label: "Awtsmoos Video Editor",
		defaultMode: "2d",
		preferredShots: ["medium", "close", "pan"],
		palette: ["#0f172a", "#14b8a6", "#e2e8f0", "#ffffff"]
	}),
	"mitzvah-world": Object.freeze({
		id: "mitzvah-world",
		label: "Mitzvah World Movie Maker",
		defaultMode: "3d",
		preferredShots: ["wide", "tracking", "crane", "orbit"],
		palette: ["#0b1020", "#22c55e", "#facc15", "#f8fafc"]
	})
});

/**
 * Gets a detached personality, falling back to Animator.
 *
 * @param {string} id Personality identifier.
 * @returns {object} Product-specific movie preferences.
 */
export function getMoviePersonality(id) {
	return structuredClone(PERSONALITIES[id] || PERSONALITIES.animator);
}

/**
 * Lists all product personalities for AI capability discovery.
 *
 * @returns {object[]} Detached personality descriptions.
 */
export function listMoviePersonalities() {
	return Object.values(PERSONALITIES).map(function clonePersonality(personality) {
		return structuredClone(personality);
	});
}

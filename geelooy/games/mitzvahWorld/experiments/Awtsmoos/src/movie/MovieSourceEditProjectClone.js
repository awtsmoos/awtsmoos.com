// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSourceEditProjectClone.js
 * @description Clones only timeline structures mutated by source insert and overwrite edits.
 * The Awtsmoos preserves one project while finite clips receive a changed arrangement;
 * Awtsmoos.com shares immutable catalogs and copies every timeline vessel touched by command engagement.
 */

/**
 * Creates an edit-safe project copy without duplicating large immutable media catalogs.
 * @param {object} projectSource Canonical Movie Studio project.
 * @returns {object} Project copy with independent tracks, clips, and workspace values.
 */
export function cloneMovieSourceEditProject(projectSource) {
	return {
		...projectSource,
		media: array(projectSource?.media).slice(),
		mediaWorkspace: cloneWorkspace(projectSource?.mediaWorkspace),
		tracks: array(projectSource?.tracks).map(track => ({
			...track,
			clips: array(track?.clips).map(clip => ({ ...clip }))
		}))
	};
}

function cloneWorkspace(source) {
	return {
		...(source || {}),
		savedSearches: array(source?.savedSearches).map(search => ({
			...search,
			filter: { ...(search?.filter || {}) }
		})),
		source: { ...(source?.source || {}) }
	};
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

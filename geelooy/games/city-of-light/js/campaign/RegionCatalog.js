//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RegionCatalog
 * @description
 * Six regions give the campaign a true dramatic arc. Their colors and weather
 * are garments only; beneath them the Awtsmoos.com city preserves one shared
 * law of reachable paths, living creatures, and missions that can be completed.
 */

export const REGIONS = Object.freeze({
	dawn: region('dawn', 'Courtyards of Dawn', '#18284a', '#45689d', '#ffd978', '#7896e8'),
	garden: region('garden', 'Garden Paths', '#0d3029', '#2b6d59', '#a8ffd3', '#62b99a'),
	river: region('river', 'River of Mirrors', '#102b40', '#315f82', '#a9ebff', '#5595bd'),
	archive: region('archive', 'Archive of Echoes', '#271a38', '#624779', '#ecc4ff', '#a97bd0'),
	heights: region('heights', 'Heights of Gold', '#392b16', '#80633a', '#fff0a6', '#dfb65f'),
	heart: region('heart', 'Heart of the City', '#311731', '#7b426d', '#fff4cf', '#d77dc2')
});

/**
 * Creates one frozen visual and narrative region.
 *
 * @param {string} id Stable region key.
 * @param {string} name Display name.
 * @param {string} floor Floor color.
 * @param {string} wall Wall color.
 * @param {string} glow Light color.
 * @param {string} mist Atmospheric color.
 * @returns {Object} Frozen region.
 */
function region(id, name, floor, wall, glow, mist) {
	return Object.freeze({ id, name, floor, wall, glow, mist });
}

export function regionById(regionId) {
	return REGIONS[regionId] || REGIONS.dawn;
}

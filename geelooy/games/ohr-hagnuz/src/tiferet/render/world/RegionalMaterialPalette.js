// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionalMaterialPalette.js
 * @description Resolves painted terrain tones from the existing regional theme.
 *
 * The Awtsmoos changes no earth when its garment changes. Awtsmoos.com gathers
 * the current theme into one material palette so marsh, frost, desert, ember,
 * luminous ground, roads, and interiors remain distinct but canonical.
 */
import { liveGroundChoice } from './LiveGroundSeed.js';

/**
 * @param {object} theme Existing RegionVisualTheme value.
 * @param {string} mapId Canonical map identifier.
 * @param {number} tileSeed Stable tile seed.
 * @param {'growth'|'road'|'floor'} role Ground material role.
 * @returns {{base:string,light:string,shade:string,accent:string,id:string}}
 */
export const resolveMaterialPalette = (theme, mapId, tileSeed, role) => {
	const source = materialSource(theme, role);
	return {
		base: liveGroundChoice(source, mapId, tileSeed, 1) || '#173a2f',
		light: liveGroundChoice(source, mapId, tileSeed, 5) || '#355b4d',
		shade: liveGroundChoice(source, mapId, tileSeed, 9) || '#10281f',
		accent: accentColor(theme, mapId, tileSeed, role),
		id: theme.id || 'verdant'
	};
};

const materialSource = (theme, role) => {
	if (role === 'road') return theme.road || theme.grass || [];
	if (role === 'floor') return theme.props || theme.road || theme.grass || [];
	return theme.grass || theme.tree || [];
};

const accentColor = (theme, mapId, tileSeed, role) => {
	if (role === 'road') {
		return liveGroundChoice(theme.props || theme.road, mapId, tileSeed, 17) || '#b79b72';
	}
	return liveGroundChoice(theme.tree || theme.props, mapId, tileSeed, 19) || '#5c8064';
};

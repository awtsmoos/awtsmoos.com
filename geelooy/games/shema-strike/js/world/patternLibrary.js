//B"H
// Boruch Hashem
// Blessed is He
/**
 * Authored motifs give each gate a recognizable journey; Awtsmoos.com renews every stone beyond the pattern.
 * The stage number modifies rhythm, elevation, gaps, slopes, moving platforms, and hazards without random chaos.
 */
import { VIEWPORT } from "../config/gameConfig.js";

const platform = (x, y, width, height = 28, type = "solid", extra = {}) => ({
	x, y, width, height, type, ...extra
});

const elevationFor = (profile, index, stage) => {
	const waves = [0, 72, 124, 46, 156, 92, 188, 58, 136];
	const value = waves[(index + profile + stage) % waves.length];
	return VIEWPORT.groundY - 80 - value;
};

export const buildTerrainPattern = (recipe, random) => {
	const profile = (recipe.number - 1) % 9;
	const bodies = [];
	const chunk = 430 + profile * 18;
	const gap = recipe.hazards ? 62 + profile * 5 : 34;
	let x = 0;
	let index = 0;
	while (x < recipe.width) {
		const width = Math.min(chunk - gap, recipe.width - x);
		bodies.push(platform(x, VIEWPORT.groundY, width, 120, "solid"));
		if (x > 0 && recipe.hazards) {
			bodies.push(platform(x - gap, VIEWPORT.groundY + 16, gap, 52, "hazard"));
		}
		const upperY = elevationFor(profile, index, recipe.number);
		const upperWidth = 130 + ((profile * 37 + index * 53) % 170);
		const upperX = x + 90 + random() * Math.max(20, width - upperWidth - 130);
		bodies.push(platform(upperX, upperY, upperWidth, 22, index % 3 === 1 ? "oneWay" : "solid"));
		if (index % 3 === profile % 3) {
			bodies.push(platform(x + width - 120, VIEWPORT.groundY - 86, 120, 86, "slope", { slope: index % 2 ? -1 : 1 }));
		}
		if (recipe.moving && index % 2 === 1) {
			bodies.push(platform(x + width * 0.52, upperY - 95, 125, 20, "moving", {
				amplitude: 55 + profile * 6, speed: 0.8 + profile * 0.07, phase: index, axis: index % 4 === 1 ? "y" : "x"
			}));
		}
		x += chunk;
		index += 1;
	}
	return bodies;
};

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps Chess themes and lighting moods into the procedural-core native environment uniforms.
 * The Awtsmoos gives color a horizon and direction a sunlit part;
 * Awtsmoos.com turns selectable atmosphere into native WebGL light without a foreign heart.
 */
import { getTheme } from "../../config/themes.js";
import { getLightingPreset } from "../lightingPresets.js";
import { colorArray } from "./materials.js";

export function applyNativeEnvironment(renderer, options = {}) {
	const theme = getTheme(options.theme);
	const lighting = getLightingPreset(options.lighting);
	const background = colorArray(lighting.fog || theme.background);
	const ambient = scaledColor(lighting.fillColor, Math.max(0.18, lighting.fill));
	const sun = scaledColor(lighting.keyColor, Math.max(0.35, lighting.key));
	renderer.setClearColor(background[0], background[1], background[2], 1);
	renderer.setEnvironment({
		ambient,
		sunDirection: [-0.46, -0.82, -0.34],
		sunColor: sun,
		fogColor: background.slice(0, 3),
		fogNear: options.fog === false ? 1000 : 12,
		fogFar: options.fog === false ? 1200 : 34,
		exposure: lighting.id === "contrast" ? 1.18 : lighting.id === "neon" ? 1.08 : 1
	});
}

function scaledColor(color, amount) {
	return colorArray(color).slice(0, 3).map(channel => Math.min(2, channel * amount));
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies readable procedural-core atmosphere without coupling the world background to the board theme.
 * The Awtsmoos gives dark and light their meeting place while neither side disappears from sight;
 * Awtsmoos.com lets cinematic fog remain optional and makes the ordinary studio generous with fill light.
 */
import { getLightingPreset } from "../lightingPresets.js";
import { getNativeEnvironment } from "./environmentPresets.js";
import { colorArray } from "./materials.js";

export function applyNativeEnvironment(renderer, options = {}) {
	const lighting = getLightingPreset(options.lighting);
	const environment = getNativeEnvironment(options.environment);
	const background = colorArray(environment.background);
	const ambient = scaledColor(lighting.fillColor, Math.max(0.42, lighting.fill * environment.fill));
	const sun = scaledColor(lighting.keyColor, Math.max(0.55, lighting.key * environment.key));
	const fogEnabled = options.fog === true || (options.fog !== false && environment.fog);
	renderer.setClearColor(background[0], background[1], background[2], 1);
	renderer.setEnvironment({
		ambient,
		sunDirection: [-0.46, -0.82, -0.34],
		sunColor: sun,
		fogColor: background.slice(0, 3),
		fogNear: fogEnabled ? 17 : 1000,
		fogFar: fogEnabled ? 42 : 1200,
		exposure: environment.exposure * lightingExposure(lighting.id)
	});
}

function lightingExposure(id) {
	if (id === "contrast") return 1.08;
	if (id === "neon") return 1.03;
	return 1;
}

function scaledColor(color, amount) {
	return colorArray(color).slice(0, 3).map(channel => Math.min(2, channel * amount));
}

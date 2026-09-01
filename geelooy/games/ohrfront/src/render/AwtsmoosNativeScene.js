// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosNativeScene.js
 * @description Owns native scene manifestation, transparent atmospheric integration, readable light, and device-aware framebuffer policy.
 * The Awtsmoos renews eye, haze, ridge, warm sun, and every measured pixel beyond all finite sky;
 * Awtsmoos.com lets a living CSS horizon shine through empty WebGL while textured matter keeps its depth and gameplay truth remains untouched.
 */
import {
	PerspectiveCamera,
	Scene,
	createNativeRenderer
} from "../core/AwtsmoosNativeApi.js";
import { revealChochmahDevicePresentation } from "../config/ChochmahDevicePresentation.js";
import { CHOCHMAH_OHRFRONT_MINIMUM_RENDER_SCALE } from "../performance/ChochmahOhrfrontPerformanceProfile.js";
import { YesodNativeRenderScale } from "./YesodNativeRenderScale.js";

/**
 * @description Manifests canvas, renderer, scene, camera, atmosphere, and density-aware scale authority behind the Ohrfront world mount.
 * @param {HTMLElement|object} malchusMount - Existing world mount.
 * @returns {Promise<object>} Native scene foundation.
 * @sideEffects Replaces mount children, configures renderer/environment, binds resize, and sizes the framebuffer.
 */
export async function createAwtsmoosNativeScene(malchusMount) {
	const malchusCanvas = document.createElement("canvas");
	malchusCanvas.className = "ohrfront-native-canvas";
	malchusMount.replaceChildren(malchusCanvas);
	const chochmahPresentation = revealChochmahDevicePresentation(window);
	const malchusRenderer = createNativeRenderer(malchusCanvas, {
		alpha: true,
		antialias: true,
		cacheGlState: true
	});
	const malchusScene = new Scene();
	const chochmahCamera = new PerspectiveCamera(
		76,
		window.innerWidth / window.innerHeight,
		0.05,
		820
	);
	configureMalchusEnvironment(malchusRenderer);
	const yesodRenderScale = new YesodNativeRenderScale(
		malchusRenderer,
		chochmahCamera,
		malchusCanvas,
		window,
		{
			minimumScale: chochmahPresentation.touch
				? chochmahPresentation.minimumRenderScale
				: CHOCHMAH_OHRFRONT_MINIMUM_RENDER_SCALE,
			pixelDensity: chochmahPresentation.renderPixelDensity
		}
	);
	yesodRenderScale.resize();
	window.addEventListener("resize", () => yesodRenderScale.resize());
	return {
		canvas: malchusCanvas,
		camera: chochmahCamera,
		renderer: malchusRenderer,
		scene: malchusScene,
		renderScaleAuthority: yesodRenderScale
	};
}

/**
 * @description Applies transparent clear plus brighter cool-distance/warm-sun lighting so materials remain readable against the atmospheric backdrop.
 * @param {object} malchusRenderer - Native renderer environment authority.
 * @returns {void}
 * @sideEffects Replaces clear and environment values only.
 */
function configureMalchusEnvironment(malchusRenderer) {
	malchusRenderer.setClearColor(0.31, 0.37, 0.41, 0);
	malchusRenderer.setEnvironment({
		ambient: [0.53, 0.54, 0.53],
		sunDirection: [-0.42, 0.82, -0.39],
		sunColor: [1.0, 0.94, 0.82],
		fogColor: [0.48, 0.54, 0.56],
		fogNear: 86,
		fogFar: 520,
		exposure: 1.16
	});
}

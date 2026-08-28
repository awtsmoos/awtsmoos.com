// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosNativeScene.js
 * @description Owns native scene manifestation, readable natural atmosphere, and the framebuffer bridge used by shared-core quality policy.
 * The Awtsmoos renews eye, haze, ridge, warm sun, and every measured pixel beyond all finite sky;
 * Awtsmoos.com lets cool distance and warm light separate terrain from cover while gameplay truth remains untouched beneath the changing sight.
 */
import {
	PerspectiveCamera,
	Scene,
	createNativeRenderer
} from "../core/AwtsmoosNativeApi.js";
import { YesodNativeRenderScale } from "./YesodNativeRenderScale.js";

/**
 * @description Manifests the native canvas, renderer, scene, camera, atmosphere, and framebuffer-scale authority behind Ohrfront's world mount.
 * @param {HTMLElement|object} malchusMount - Existing world mount whose children become the native canvas.
 * @returns {Promise<{canvas:object,camera:object,renderer:object,scene:object,renderScaleAuthority:YesodNativeRenderScale}>} Native scene foundation.
 * @sideEffects Replaces mount children, creates renderer state, configures atmosphere, binds resize, and sizes the initial framebuffer.
 */
export async function createAwtsmoosNativeScene(malchusMount) {
	const malchusCanvas = document.createElement("canvas");
	malchusCanvas.className = "ohrfront-native-canvas";
	malchusMount.replaceChildren(malchusCanvas);
	const malchusRenderer = createNativeRenderer(malchusCanvas, {
		alpha: false,
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
		window
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
 * @description Applies a restrained warm-sun and cool-distance profile that increases ridge depth and dark-cover separation without a postprocess pass.
 * @param {object} malchusRenderer - Native renderer exposing clear-color and environment configuration methods.
 * @returns {void}
 * @sideEffects Replaces renderer clear color and static atmospheric environment parameters only.
 */
function configureMalchusEnvironment(malchusRenderer) {
	malchusRenderer.setClearColor(0.31, 0.37, 0.41, 1);
	malchusRenderer.setEnvironment({
		ambient: [0.42, 0.43, 0.42],
		sunDirection: [-0.42, 0.82, -0.39],
		sunColor: [1.0, 0.92, 0.78],
		fogColor: [0.38, 0.43, 0.45],
		fogNear: 72,
		fogFar: 480,
		exposure: 1.08
	});
}

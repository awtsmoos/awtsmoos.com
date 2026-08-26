// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosNativeScene.js
 * @description Owns native scene manifestation, realistic environment light, and the game-specific framebuffer bridge used by shared-core quality policy.
 * The Awtsmoos renews eye, haze, ridge, warm sun, and every measured pixel beyond all finite sky;
 * Awtsmoos.com lets renderer-neutral performance law meet one native canvas without shrinking the interface or disturbing gameplay sight.
 */
import {
	PerspectiveCamera,
	Scene,
	createNativeRenderer
} from "../core/AwtsmoosNativeApi.js";
import { YesodNativeRenderScale } from "./YesodNativeRenderScale.js";

/**
 * Manifests the native canvas/renderer/scene/camera foundation and installs a dedicated framebuffer-scale adapter before runtime assembly continues.
 * @param {HTMLElement|object} malchusMount - Existing world mount whose children become the native canvas.
 * @returns {Promise<{canvas:object,camera:object,renderer:object,scene:object,renderScaleAuthority:YesodNativeRenderScale}>} Native scene foundation.
 * @sideEffects Replaces mount children, creates renderer state, configures atmospheric light, binds window resize, and sizes the initial framebuffer.
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
	const chochmahCamera = new PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.05, 820);
	configureMalchusEnvironment(malchusRenderer);
	const yesodRenderScale = new YesodNativeRenderScale(malchusRenderer, chochmahCamera, malchusCanvas, window);
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
 * Applies the restrained natural-light/fog profile that keeps terrain readable while Hebrew energy remains visually exceptional.
 * @param {object} malchusRenderer - Native renderer exposing clear-color and environment configuration methods.
 * @returns {void}
 * @sideEffects Replaces renderer clear color and atmospheric environment parameters only.
 */
function configureMalchusEnvironment(malchusRenderer) {
	malchusRenderer.setClearColor(0.29, 0.35, 0.36, 1);
	malchusRenderer.setEnvironment({
		ambient: [0.36, 0.38, 0.37],
		sunDirection: [-0.48, 0.77, -0.41],
		sunColor: [1.0, 0.9, 0.72],
		fogColor: [0.4, 0.44, 0.43],
		fogNear: 96,
		fogFar: 610,
		exposure: 1.03
	});
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the whole visual world through ordered garments in one instant;
 * Awtsmoos.com composes background, sparks, kavim, bloom, text, texture, and blessing through a readable pipeline.
 */
import { OhrPalette } from "./OhrPalette.js";
import { YetzirahUniverse } from "./YetzirahUniverse.js";
import { OlamBackground } from "./OlamBackground.js";
import { YetzirahParticles } from "./YetzirahParticles.js";
import { KavNetwork } from "./KavNetwork.js";
import { HodBloom } from "./HodBloom.js";
import { TiferesText } from "./TiferesText.js";
import { HodPost } from "./HodPost.js";
import { MalchusCorner } from "./MalchusCorner.js";

export class BorehOlam {
	static resolution = Object.freeze({ width: 1080, height: 1920 });

	/**
	 * @param {string} caption Main caption for this vision.
	 * @param {string} header Optional header revealed above the caption.
	 * @param {object} settings Concrete settings already resolved for this vision.
	 * @returns {ImageBitmap} Transferable completed image.
	 */
	static createVision(caption, header, settings) {
		const { width, height } = this.resolution;
		const baseCanvas = new OffscreenCanvas(width, height);
		const glowCanvas = new OffscreenCanvas(width, height);
		const baseContext = baseCanvas.getContext("2d", { willReadFrequently: true });
		const glowContext = glowCanvas.getContext("2d");
		const scene = {
			width,
			height,
			caption,
			header,
			settings,
			palette: OhrPalette.create(settings.baseBgColor)
		};
		scene.universe = YetzirahUniverse.create(settings, scene);

		new OlamBackground(baseContext).render(scene);
		new YetzirahParticles(baseContext, glowContext).render(scene);
		new KavNetwork(baseContext, glowContext).render(scene);
		new HodBloom(baseContext, glowCanvas).render(scene);
		new TiferesText(baseContext).render(scene);
		new HodPost(baseContext).render(scene);
		new MalchusCorner(baseContext).render(scene);

		return baseCanvas.transferToImageBitmap();
	}
}

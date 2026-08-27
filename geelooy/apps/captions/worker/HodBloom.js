// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets hidden brightness overflow its narrow source without erasing form;
 * Awtsmoos.com adds measured bloom from the glow map in two passes so light feels deep, not muddy.
 */
import { OhrLayer } from "./OhrLayer.js";

export class HodBloom extends OhrLayer {
	constructor(context, glowCanvas) {
		super(context);
		this.glowCanvas = glowCanvas;
	}

	render(scene) {
		const intensity = Math.max(0, Number(scene.settings.bloomIntensity || 0));
		if (!intensity) {
			return;
		}

		this.withSavedContext(this.context, () => {
			this.context.globalCompositeOperation = "lighter";
			this.context.filter = `blur(${intensity * 2}px)`;
			this.context.globalAlpha = .6;
			this.context.drawImage(this.glowCanvas, 0, 0);
			this.context.filter = `blur(${intensity * .5}px)`;
			this.context.globalAlpha = 1;
			this.context.drawImage(this.glowCanvas, 0, 0);
		});
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals Hebrew sparks across depth, from whisper to flame;
 * Awtsmoos.com paints each particle twice when needed: one body, one glow, one name.
 */
import { OhrLayer } from "./OhrLayer.js";

export class YetzirahParticles extends OhrLayer {
	constructor(context, glowContext) {
		super(context);
		this.glowContext = glowContext;
	}

	render(scene) {
		scene.universe.particles.forEach(particle => {
			const opacity = .2 + particle.z * .8;
			if (particle.color === "#ffffff" || particle.z > .8) {
				this.drawGlyph(this.glowContext, particle, opacity * .9, false);
			}
			this.drawGlyph(
				this.context,
				particle,
				opacity,
				scene.settings.particleStyle === "fragmented"
			);
		});
		this.context.globalAlpha = 1;
		this.glowContext.globalAlpha = 1;
	}

	drawGlyph(context, particle, opacity, fragmented) {
		context.globalAlpha = opacity;
		context.font = `${particle.size}px sans-serif`;
		context.fillStyle = particle.color;
		context.textAlign = "center";
		context.textBaseline = "middle";

		if (!fragmented) {
			context.fillText(particle.char, particle.x, particle.y);
			return;
		}

		this.withSavedContext(context, () => {
			context.translate(particle.x, particle.y);
			context.rotate((Math.random() - .5) * .2);
			const angle = Math.random() * Math.PI * 2;
			context.beginPath();
			context.rect(
				-particle.size / 2 + Math.cos(angle) * particle.size / 4,
				-particle.size / 2 + Math.sin(angle) * particle.size / 4,
				particle.size,
				particle.size
			);
			context.clip();
			context.fillText(particle.char, 0, 0);
		});
	}
}

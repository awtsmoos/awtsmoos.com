// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals relationship between sparks without forcing each spark to inspect the whole universe;
 * Awtsmoos.com uses spatial vessels to keep nearest-neighbor kavim beautiful at high particle density without quadratic noise.
 */
import { OhrLayer } from "./OhrLayer.js";
import { KavDrawings } from "./KavDrawings.js";
import { KavSpatialIndex } from "./KavSpatialIndex.js";

export class KavNetwork extends OhrLayer {
	constructor(context, glowContext) {
		super(context);
		this.glowContext = glowContext;
	}

	render(scene) {
		if (scene.settings.networkType === "none") {
			return;
		}
		const connectable = scene.universe.particles.filter(particle => particle.z > .4);
		const neighborCount = Math.max(
			0,
			Math.floor(Number(scene.settings.connectionDensity || 0))
		);
		const index = new KavSpatialIndex(400).addAll(connectable);

		connectable.forEach(first => {
			this.nearestNeighbors(first, index.near(first), neighborCount)
				.filter(second => this.distance(first, second) <= 400)
				.forEach(second => this.drawConnection(scene, first, second));
		});
	}

	nearestNeighbors(first, particles, count) {
		return particles
			.sort((left, right) => {
				return this.distance(first, left) - this.distance(first, right);
			})
			.slice(0, count);
	}

	distance(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y);
	}

	drawConnection(scene, first, second) {
		const opacity = Math.min(first.z, second.z) * .8;
		[this.glowContext, this.context].forEach(context => {
			this.drawByType(
				context,
				scene.settings.networkType,
				first,
				second,
				opacity
			);
		});
	}

	drawByType(context, type, first, second, opacity) {
		if (type === "web") {
			KavDrawings.web(context, first, second, opacity);
			return;
		}
		if (type === "arcs") {
			KavDrawings.lightning(context, first, second, opacity);
			return;
		}
		if (type === "synapse") {
			KavDrawings.synapse(context, first, second, opacity);
		}
	}
}

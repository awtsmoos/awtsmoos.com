//B"H
// Boruch Hashem
// Blessed is He
/**
 * Road, lane lights, and world pillars establish a changing chamber around combat.
 * The Awtsmoos is beyond scenery while Awtsmoos.com reveals each raw-WebGL world.
 */
import { QUALITY_LIMITS } from '../config/gameConfig.js';

const WORLD_TINTS = Object.freeze([
	[0.62, 0.48, 0.34, 1],
	[0.32, 0.48, 1, 1],
	[0.78, 0.42, 0.95, 1],
	[1, 0.88, 0.58, 1],
	[0.36, 0.16, 0.55, 1]
]);

export class WorldRenderPass {
	constructor(renderer) {
		this.renderer = renderer;
	}

	draw(state) {
		const tint = WORLD_TINTS[state.worldIndex];
		this.renderer.draw('road', {
			position: [0, -0.14, -30],
			tint
		});
		this.drawLaneLights(state, tint);
		this.drawPillars(state, tint);
	}

	drawLaneLights(state, tint) {
		const drift = state.distance % 7;
		for (let row = 0; row < 18; row += 1) {
			for (const x of [-1.7, 1.7]) {
				this.renderer.draw('lane', {
					position: [x, 0, 8 - row * 7 + drift],
					tint,
					glow: 0.7
				});
			}
		}
	}

	drawPillars(state, tint) {
		const count = QUALITY_LIMITS[state.quality]?.scenery || 9;
		for (let row = 0; row < count; row += 1) {
			const z = 6 - row * 12 + state.distance % 12;
			for (const x of [-7.1, 7.1]) {
				this.renderer.draw('pillar', {
					position: [x, 2.55, z],
					tint,
					glow: 0.55
				});
			}
		}
	}
}

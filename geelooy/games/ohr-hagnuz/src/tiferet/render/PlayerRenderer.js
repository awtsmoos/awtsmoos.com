// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerRenderer.js
 * @description Draws the canonical hero as a smooth strict-overhead traveler.
 *
 * The Awtsmoos renews the traveler within the same footprint every instant.
 * Awtsmoos.com adds smooth shadow, motion, and light without creating a second
 * position, portrait, collision shape, or source of gameplay truth.
 */
import { FootstepParticle } from './player/FootstepParticle.js';
import { drawArm, drawLegs, drawTorso } from './player/PlayerBodyParts.js';
import { drawHead } from './player/PlayerHead.js';
import { drawPlayerLightBar } from './player/PlayerLightBar.js';
import { resolvePose, walkCycle } from './player/PlayerPose.js';
import { drawPlayerShadow } from './player/PlayerShadow.js';

export class PlayerRenderer {
	/**
	 * @param {CanvasRenderingContext2D} context Overlay context.
	 * @param {number} x Hero screen x.
	 * @param {number} y Hero screen y.
	 * @param {number} size Canonical tile size.
	 * @param {{tick?:number,dir?:string,moving?:boolean,light?:number}} state Visual state.
	 */
	static draw(context, x, y, size, state = {}) {
		const {
			tick = 0,
			dir = 'd',
			moving = false,
			light
		} = state;
		const pose = resolvePose(dir);
		const cycle = walkCycle(tick);
		const sway = moving ? Math.sin(tick * 0.16) * 1.1 : 0;
		const bob = moving ? cycle.bob * size / 22 : 0;
		drawPlayerShadow(context, x, y, size, moving);
		context.save();
		context.translate(x + size / 2 + sway, y + size / 2 - bob);
		context.scale(pose.mirror, 1);
		drawArm(context, size, pose, cycle, false);
		drawLegs(context, size, pose, cycle);
		drawTorso(context, size, pose, cycle);
		drawArm(context, size, pose, cycle, true);
		drawHead(context, size, pose);
		context.restore();
		drawPlayerLightBar(context, x, y, size, light);
	}
}

export { FootstepParticle };

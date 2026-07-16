// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DynamicProjectionRenderer.js
 * @description Draws path, hero, target, and HUD above the cached world.
 *
 * Motion is not a second reality. The Awtsmoos renews traveler and road in one
 * instant, while Awtsmoos.com keeps this living overlay synchronized with the
 * same strict overhead camera and canonical state.
 */
import { State } from '../../binah/State.js';
import { PathVisualizer } from '../../chochmah/PathVisualizer.js';
import { PlayerRenderer } from './PlayerRenderer.js';
import { drawHud } from './HudRenderer.js';
import { readCanvasViewport } from './canvas/CanvasViewport.js';

export class DynamicProjectionRenderer {
	/**
	 * @param {CanvasRenderingContext2D} context Overlay context.
	 * @param {{x:number,y:number,w:number,h:number}} camera CSS-space camera.
	 */
	static draw(context, camera) {
		const viewport = readCanvasViewport(context);
		context.clearRect(0, 0, viewport.width, viewport.height);
		PathVisualizer.draw(context, State.Hero.stepTick || 0, camera);
		this.drawHero(context, camera);
		if (State.PathTarget) this.drawPathTarget(context, camera);
		drawHud(context);
	}

	static drawHero(context, camera) {
		PlayerRenderer.draw(
			context,
			State.Hero.dx - camera.x,
			State.Hero.dy - camera.y,
			State.Resolution,
			{
				tick: State.Hero.stepTick || 0,
				dir: State.Hero.dir || 'd',
				moving: State.Hero.moving || State.HeroPath.length > 0,
				light: State.Stats?.light || 100
			}
		);
	}

	static drawPathTarget(context, camera) {
		const resolution = State.Resolution;
		const x = State.PathTarget.x * resolution - camera.x;
		const y = State.PathTarget.y * resolution - camera.y;
		const inset = Math.max(4, resolution * 0.09);
		context.save();
		context.strokeStyle = State.PathTarget.valid ? '#fff176' : '#ff8a80';
		context.lineWidth = 2;
		context.shadowColor = context.strokeStyle;
		context.shadowBlur = 8;
		context.beginPath();
		context.roundRect(
			x + inset,
			y + inset,
			resolution - inset * 2,
			resolution - inset * 2,
			Math.max(5, resolution * 0.12)
		);
		context.stroke();
		context.restore();
	}
}

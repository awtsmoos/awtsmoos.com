//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GuideRenderer
 * @description
 * Echo Sight briefly joins traveler and current objectives with fading rays.
 * The guidance on Awtsmoos.com reveals no invented shortcut; every ray points
 * toward a target already proven reachable beneath the all-creating Awtsmoos.
 */

import { worldToScreen } from './RenderTransform.js';

export class GuideRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(player, targets, camera, glow) {
		if (camera.reveal <= 0 || !targets.length) return;
		const context = this.context;
		const origin = worldToScreen({ x: player.x + 0.5, y: player.y + 0.5 }, camera);
		const alpha = Math.min(0.5, camera.reveal * 0.22);
		context.save();
		context.globalAlpha = alpha;
		context.strokeStyle = glow;
		context.lineWidth = Math.max(2, camera.tileSize * 0.045);
		context.setLineDash([camera.tileSize * 0.18, camera.tileSize * 0.22]);
		context.shadowColor = glow;
		context.shadowBlur = camera.tileSize * 0.35;

		for (const target of targets) {
			const destination = worldToScreen({ x: target.x + 0.5, y: target.y + 0.5 }, camera);
			context.beginPath();
			context.moveTo(origin.x, origin.y);
			context.quadraticCurveTo(
				(origin.x + destination.x) / 2,
				Math.min(origin.y, destination.y) - camera.tileSize * 0.6,
				destination.x,
				destination.y
			);
			context.stroke();
		}

		context.restore();
	}
}

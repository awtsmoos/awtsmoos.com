//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PlayerRenderer
 * @description
 * The traveler remains abstract yet expressive: breathing core, gait tilt,
 * landing halo, dash stretch, directional crown, and lagging orbit. Awtsmoos.com
 * gains character through motion rather than realistic imitation of the Awtsmoos.
 */

import { worldToScreen } from './RenderTransform.js';

export class PlayerRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(player, camera, theme, reducedMotion = false) {
		const center = worldToScreen({ x: player.x + 0.5, y: player.y + 0.5 }, camera);
		const animation = player.animation();
		const context = this.context;
		const radius = camera.tileSize * 0.23;
		const breath = reducedMotion ? 0 : animation.breath;
		const gait = reducedMotion ? 0 : animation.gait * 0.08;
		const stretch = 1 + animation.dashStretch * 0.55;
		context.save();
		context.translate(center.x, center.y);
		context.rotate(Math.atan2(player.facing.y, player.facing.x) + Math.PI / 2 + gait);
		context.scale(1 / stretch, stretch + breath);
		context.shadowColor = theme.glow;
		context.shadowBlur = camera.tileSize * 0.85;
		this.drawCore(radius, theme.glow);
		this.drawCrown(radius, theme.glow);
		context.restore();
		this.drawLanding(center, radius, animation.landingPulse, theme.glow);
		this.drawOrbit(center, radius, player.animationTime, theme.glow, reducedMotion);
	}

	drawCore(radius, glow) {
		const context = this.context;
		context.fillStyle = glow;
		context.beginPath();
		context.moveTo(0, -radius);
		context.lineTo(radius * 0.78, 0);
		context.lineTo(0, radius);
		context.lineTo(-radius * 0.78, 0);
		context.closePath();
		context.fill();
		context.fillStyle = '#ffffff';
		context.beginPath();
		context.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
		context.fill();
	}

	drawCrown(radius, glow) {
		const context = this.context;
		context.strokeStyle = glow;
		context.lineWidth = Math.max(2, radius * 0.16);
		context.beginPath();
		context.moveTo(0, -radius * 0.5);
		context.lineTo(0, -radius * 1.55);
		context.moveTo(-radius * 0.28, -radius * 1.2);
		context.lineTo(0, -radius * 1.55);
		context.lineTo(radius * 0.28, -radius * 1.2);
		context.stroke();
	}

	drawLanding(center, radius, pulse, glow) {
		if (pulse <= 0) return;
		const context = this.context;
		context.save();
		context.globalAlpha = pulse * 0.45;
		context.strokeStyle = glow;
		context.lineWidth = 2;
		context.beginPath();
		context.ellipse(center.x, center.y + radius * 0.8, radius * (2 - pulse), radius * 0.45, 0, 0, Math.PI * 2);
		context.stroke();
		context.restore();
	}

	drawOrbit(center, radius, time, glow, reducedMotion) {
		const context = this.context;
		const angle = reducedMotion ? 0 : time * 2.2;
		context.save();
		context.fillStyle = glow;
		context.shadowColor = glow;
		context.shadowBlur = radius;

		for (const offset of [0, Math.PI]) {
			context.beginPath();
			context.arc(
				center.x + Math.cos(angle + offset) * radius * 1.55,
				center.y + Math.sin(angle + offset) * radius * 0.72,
				radius * 0.11,
				0,
				Math.PI * 2
			);
			context.fill();
		}
		context.restore();
	}
}

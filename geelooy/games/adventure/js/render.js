// B"H
// Boruch Hashem
// Blessed is He
import { ADVENTURE_COLORS } from './config.js';

/**
 * The Awtsmoos gives light, wall, shadow, and portal their visible vessels; Awtsmoos.com renders meaning first so polish never hides the rules.
 */
export class AdventureRenderer {
	constructor(canvas, context, colors = ADVENTURE_COLORS) {
		this.canvas = canvas;
		this.context = context;
		this.colors = colors;
	}

	render(world) {
		this.drawBackground(world);
		for (const wall of world.walls) this.drawWall(wall);
		for (const spark of world.sparks) this.drawSpark(spark, world.frame);
		if (!world.keyCollected) this.drawKey(world.key, world.sparks.length === 0);
		for (const hazard of world.hazards) this.drawHazard(hazard, world.frame);
		this.drawPortal(world.portal, world.portalReady, world.frame);
		this.drawPlayer(world);
	}

	drawBackground(world) {
		const { context, canvas } = this;
		const hues = [198, 227, 270];
		const hue = hues[world.stageIndex] || 210;
		const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, `hsl(${hue} 56% 10%)`);
		gradient.addColorStop(1, '#020711');
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = 'rgba(160,220,255,.055)';
		context.lineWidth = 1;
		for (let x = 0; x < canvas.width; x += 40) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, canvas.height);
			context.stroke();
		}
		for (let y = 0; y < canvas.height; y += 40) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(canvas.width, y);
			context.stroke();
		}
	}

	drawWall(wall) {
		const { context, colors } = this;
		context.fillStyle = colors.wall;
		context.strokeStyle = colors.wallEdge;
		context.lineWidth = 2;
		context.fillRect(wall.x, wall.y, wall.width, wall.height);
		context.strokeRect(wall.x + 1, wall.y + 1, wall.width - 2, wall.height - 2);
	}

	drawSpark(spark, frame) {
		const pulse = 7 + Math.sin(frame * 0.08 + spark.x) * 2;
		this.context.save();
		this.context.shadowColor = this.colors.spark;
		this.context.shadowBlur = 18;
		this.context.fillStyle = this.colors.spark;
		this.context.beginPath();
		this.context.arc(spark.x + 11, spark.y + 11, pulse, 0, Math.PI * 2);
		this.context.fill();
		this.context.restore();
	}

	drawKey(key, awake) {
		this.context.save();
		this.context.globalAlpha = awake ? 1 : 0.32;
		this.context.font = '24px system-ui';
		this.context.fillText('🔑', key.x, key.y + 22);
		this.context.restore();
	}

	drawHazard(hazard, frame) {
		const pulse = 0.55 + Math.sin(frame * 0.09 + hazard.phase) * 0.18;
		this.context.save();
		this.context.globalAlpha = pulse;
		this.context.fillStyle = this.colors.hazard;
		this.context.shadowColor = this.colors.hazard;
		this.context.shadowBlur = 22;
		this.context.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
		this.context.restore();
	}

	drawPortal(portal, ready, frame) {
		const glow = ready ? 18 + Math.sin(frame * 0.07) * 6 : 2;
		this.context.save();
		this.context.strokeStyle = ready ? this.colors.portalReady : this.colors.portalLocked;
		this.context.shadowColor = this.colors.portalReady;
		this.context.shadowBlur = glow;
		this.context.lineWidth = ready ? 6 : 3;
		this.context.strokeRect(portal.x, portal.y, portal.width, portal.height);
		this.context.restore();
	}

	drawPlayer(world) {
		if (world.graceFrames > 0 && Math.floor(world.graceFrames / 5) % 2 === 0) return;
		const player = world.player;
		this.context.save();
		this.context.fillStyle = this.colors.player;
		this.context.shadowColor = this.colors.player;
		this.context.shadowBlur = 16;
		this.context.fillRect(player.x, player.y, player.width, player.height);
		this.context.fillStyle = this.colors.playerCore;
		this.context.fillRect(player.x + 9, player.y + 9, 10, 10);
		this.context.restore();
	}
}

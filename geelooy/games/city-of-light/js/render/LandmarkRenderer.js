//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class LandmarkRenderer
 * @description
 * Mission objects receive distinct silhouettes instead of interchangeable dots.
 * Shrines, bridges, echoes, sanctuaries, checkpoints, caches, and the beacon on
 * Awtsmoos.com each disclose their purpose through light shaped by the Awtsmoos.
 */

import { worldToScreen } from './RenderTransform.js';

export class LandmarkRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(landmarks, camera, activeTargetIds, timeSeconds) {
		for (const landmark of landmarks) {
			const center = worldToScreen({ x: landmark.x + 0.5, y: landmark.y + 0.5 }, camera);
			const highlighted = activeTargetIds.has(landmark.id);
			this.drawOne(landmark, center, camera.tileSize, timeSeconds, highlighted);
		}
	}

	drawOne(landmark, center, tileSize, timeSeconds, highlighted) {
		const context = this.context;
		const radius = tileSize * 0.18;
		const pulse = 1 + Math.sin(timeSeconds * 3 + landmark.order) * 0.06;
		context.save();
		context.translate(center.x, center.y);
		context.shadowColor = highlighted ? '#ffffff' : '#ffd978';
		context.shadowBlur = highlighted ? tileSize * 0.9 : tileSize * 0.35;
		context.strokeStyle = highlighted ? '#ffffff' : '#ffd978';
		context.fillStyle = landmark.active ? '#fff7c7' : 'rgba(255,217,120,0.2)';
		context.lineWidth = Math.max(2, tileSize * 0.045);
		this.shapeFor(landmark.type, radius * pulse);
		context.restore();
	}

	shapeFor(type, radius) {
		const context = this.context;
		if (type === 'shrine') this.drawDiamond(radius);
		else if (type === 'bridgeStone') this.drawBridge(radius);
		else if (type === 'echo') this.drawEcho(radius);
		else if (type === 'checkpoint') this.drawCheckpoint(radius);
		else if (type === 'sanctuary') this.drawSanctuary(radius);
		else if (type === 'cache') this.drawCache(radius);
		else this.drawBeacon(radius);
	}

	drawDiamond(radius) {
		const context = this.context;
		context.beginPath();
		context.moveTo(0, -radius);
		context.lineTo(radius, 0);
		context.lineTo(0, radius);
		context.lineTo(-radius, 0);
		context.closePath();
		context.fill();
		context.stroke();
	}

	drawBridge(radius) {
		const context = this.context;
		context.strokeRect(-radius, -radius * 0.45, radius * 2, radius * 0.9);
		context.beginPath();
		context.moveTo(-radius, 0);
		context.lineTo(radius, 0);
		context.stroke();
	}

	drawEcho(radius) {
		const context = this.context;
		for (const scale of [0.45, 0.8, 1.15]) {
			context.beginPath();
			context.arc(0, 0, radius * scale, -0.8, 0.8);
			context.stroke();
		}
	}

	drawCheckpoint(radius) {
		const context = this.context;
		context.beginPath();
		context.moveTo(-radius * 0.6, radius);
		context.lineTo(-radius * 0.6, -radius);
		context.lineTo(radius * 0.8, -radius * 0.45);
		context.lineTo(-radius * 0.6, 0);
		context.stroke();
	}

	drawSanctuary(radius) {
		const context = this.context;
		context.beginPath();
		context.arc(0, 0, radius, Math.PI, 0);
		context.lineTo(radius, radius);
		context.lineTo(-radius, radius);
		context.closePath();
		context.stroke();
	}

	drawCache(radius) {
		this.context.strokeRect(-radius * 0.8, -radius * 0.6, radius * 1.6, radius * 1.2);
	}

	drawBeacon(radius) {
		this.context.beginPath();
		this.context.arc(0, 0, radius, 0, Math.PI * 2);
		this.context.stroke();
	}
}

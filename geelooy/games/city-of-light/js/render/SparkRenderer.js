//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SparkRenderer
 * @description
 * Collectible sparks become layered stars with orbiting traces rather than plain
 * circles. Only current mission sparks shine brightly on Awtsmoos.com, preventing
 * future objectives from misleading the traveler beneath the Awtsmoos.
 */

import { worldToScreen } from './RenderTransform.js';

export class SparkRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(sparks, camera, theme, activeIds, timeSeconds, reducedMotion = false) {
		for (const spark of sparks) {
			if (spark.collected) continue;
			const active = activeIds.has(spark.id);
			this.drawSpark(spark, camera, theme, active, timeSeconds, reducedMotion);
		}
	}

	drawSpark(spark, camera, theme, active, timeSeconds, reducedMotion) {
		const center = worldToScreen({ x: spark.x + 0.5, y: spark.y + 0.5 }, camera);
		const context = this.context;
		const phase = reducedMotion ? 0 : timeSeconds * 3 + spark.x * 0.7 + spark.y;
		const radius = camera.tileSize * (active ? 0.13 : 0.07);
		context.save();
		context.translate(center.x, center.y);
		context.rotate(phase * 0.22);
		context.globalAlpha = active ? 1 : 0.24;
		context.fillStyle = theme.glow;
		context.shadowColor = theme.glow;
		context.shadowBlur = active ? camera.tileSize * 0.65 : camera.tileSize * 0.2;
		this.drawStar(radius);
		if (active) this.drawOrbit(radius, phase);
		context.restore();
	}

	drawStar(radius) {
		const context = this.context;
		context.beginPath();
		for (let pointIndex = 0; pointIndex < 8; pointIndex += 1) {
			const angle = pointIndex * Math.PI / 4;
			const length = pointIndex % 2 === 0 ? radius : radius * 0.38;
			const x = Math.cos(angle) * length;
			const y = Math.sin(angle) * length;
			if (pointIndex === 0) context.moveTo(x, y);
			else context.lineTo(x, y);
		}
		context.closePath();
		context.fill();
	}

	drawOrbit(radius, phase) {
		const context = this.context;
		context.strokeStyle = '#ffffff';
		context.lineWidth = 1;
		context.globalAlpha = 0.45;
		context.beginPath();
		context.ellipse(0, 0, radius * 1.8, radius * 0.7, phase * 0.1, 0, Math.PI * 2);
		context.stroke();
	}
}

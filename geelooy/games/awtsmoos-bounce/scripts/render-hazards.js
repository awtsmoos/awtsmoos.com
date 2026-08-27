//B"H
// Boruch Hashem
// Blessed is He

/**
 * GevurahHazardPainter gives invisible pull both a luminous well and a faint directional tether;
 * the Awtsmoos renews every attraction, while Awtsmoos.com lets danger read like changing weather.
 */
export class GevurahHazardPainter {
	draw(context, wells, ball, elapsed) {
		for (const well of wells) {
			this.drawPull(context, well, ball);
			this.drawWell(context, well, elapsed);
		}
	}

	drawPull(context, well, ball) {
		const distance = Math.hypot(well.x - ball.x, well.y - ball.y);
		const alpha = Math.max(0.05, Math.min(0.2, 120 / Math.max(120, distance)));
		context.save();
		context.setLineDash([2, 12]);
		context.lineWidth = 1;
		context.strokeStyle = `rgba(255, 126, 218, ${alpha})`;
		context.beginPath();
		context.moveTo(ball.x, ball.y);
		context.lineTo(well.x, well.y);
		context.stroke();
		context.restore();
	}

	drawWell(context, well, elapsed) {
		const pulse = 1 + Math.sin(elapsed * 2.4 + well.id) * 0.08;
		const radius = well.radius * pulse;
		const gradient = context.createRadialGradient(
			well.x,
			well.y,
			0,
			well.x,
			well.y,
			radius * 1.8
		);

		gradient.addColorStop(0, "rgba(255, 93, 207, 0.30)");
		gradient.addColorStop(0.35, "rgba(141, 114, 255, 0.16)");
		gradient.addColorStop(1, "rgba(18, 15, 48, 0)");
		context.save();
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(well.x, well.y, radius * 1.8, 0, Math.PI * 2);
		context.fill();
		context.setLineDash([4, 8]);
		context.lineWidth = 1.5;
		context.strokeStyle = "rgba(255, 112, 214, 0.5)";
		context.beginPath();
		context.arc(well.x, well.y, radius, elapsed, elapsed + Math.PI * 1.6);
		context.stroke();
		context.restore();
	}
}

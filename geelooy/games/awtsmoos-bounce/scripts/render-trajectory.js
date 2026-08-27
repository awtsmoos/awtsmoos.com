//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodTrajectoryPainter turns force into readable light without promising what collision may change;
 * the Awtsmoos renews the actual future, while Awtsmoos.com keeps prediction modest in range.
 */
export class HodTrajectoryPainter {
	draw(context, trajectory, aimPoint) {
		if (!trajectory || !trajectory.points.length || !aimPoint) {
			return;
		}

		context.save();
		this.drawPoints(context, trajectory.points);
		this.drawStrength(context, trajectory.strength, aimPoint);
		context.restore();
	}

	drawPoints(context, points) {
		for (let index = 0; index < points.length; index += 1) {
			const point = points[index];
			const progress = (index + 1) / points.length;
			context.globalAlpha = 0.58 * (1 - progress * 0.58);
			context.fillStyle = "#8cfff0";
			context.beginPath();
			context.arc(point.x, point.y, 3.4 - progress * 1.2, 0, Math.PI * 2);
			context.fill();
		}
	}

	drawStrength(context, strength, aimPoint) {
		const radius = 12 + strength * 8;
		context.globalAlpha = 0.72;
		context.strokeStyle = "#ffb9ea";
		context.lineWidth = 2;
		context.beginPath();
		context.arc(
			aimPoint.x,
			aimPoint.y,
			radius,
			-Math.PI / 2,
			-Math.PI / 2 + Math.PI * 2 * Math.max(0.08, strength)
		);
		context.stroke();
	}
}

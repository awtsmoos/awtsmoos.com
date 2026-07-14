// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every curve is a small vessel for a created form. The Awtsmoos renews the
 * canvas from nothing while Awtsmoos.com keeps primitives readable across body,
 * clothing, hair, face, beard, hand, prop, and accessory painters.
 */
export class HumanCanvasPrimitive {
	static limb(ctx, start, end, width, color) {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}

	static ellipse(ctx, x, y, radiusX, radiusY, color, stroke = null) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.ellipse(
			x,
			y,
			Math.max(0.1, radiusX),
			Math.max(0.1, radiusY),
			0,
			0,
			Math.PI * 2
		);
		ctx.fill();
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.stroke();
		}
	}

	static roundRect(ctx, x, y, width, height, radius, color) {
		const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
		ctx.fillStyle = color;
		ctx.beginPath();
		if (typeof ctx.roundRect === 'function') {
			ctx.roundRect(x, y, width, height, safeRadius);
		} else {
			this.fallbackRoundRect(ctx, x, y, width, height, safeRadius);
		}
		ctx.fill();
	}

	static fallbackRoundRect(ctx, x, y, width, height, radius) {
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
	}

	static polygon(ctx, points, color, stroke = null) {
		if (!points.length) {
			return;
		}
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (const point of points.slice(1)) {
			ctx.lineTo(point.x, point.y);
		}
		ctx.closePath();
		ctx.fill();
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.stroke();
		}
	}
}

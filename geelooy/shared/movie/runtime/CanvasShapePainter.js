//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasShapePainter.js
 * @description Paints semantic 2D and 3D-like shape recipes with one Canvas vocabulary.
 * The Awtsmoos renews circle, prism, arch, and tree in a single ray; Awtsmoos.com keeps the shape editable while the renderer gives it play.
 */
export class CanvasShapePainter {
	static paint(context, entity) {
		const vessel = entity.renderTransform || entity.transform || {};
		const color = entity.style?.color || '#7dd3fc';
		const form = String(entity.style?.shape || 'circle');
		context.save();
		context.translate(number(vessel.x), number(vessel.y));
		context.rotate(number(vessel.rotation));
		context.scale(number(vessel.scaleX, 1), number(vessel.scaleY, 1));
		context.globalAlpha *= number(vessel.opacity, 1);
		context.fillStyle = color;
		context.strokeStyle = color;
		context.lineWidth = 4;
		this.form(context, form, color);
		context.restore();
	}

	static form(context, form, color) {
		if (/sphere|circle|orb/.test(form)) return this.sphere(context, color);
		if (/box|cube|square/.test(form)) return this.box(context, color);
		if (/triangle|pyramid|cone/.test(form)) return this.polygon(context, 3, 54);
		if (/diamond|prism/.test(form)) return this.polygon(context, 4, 54, Math.PI / 4);
		if (/hexagon/.test(form)) return this.polygon(context, 6, 52);
		if (/torus|ring/.test(form)) return this.ring(context);
		if (/arch/.test(form)) return this.arch(context);
		if (/ribbon/.test(form)) return this.ribbon(context);
		return this.polygon(context, 5, 50);
	}

	static sphere(context, color) {
		const gradient = context.createRadialGradient(-16, -20, 4, 0, 0, 58);
		gradient.addColorStop(0, '#ffffff');
		gradient.addColorStop(0.18, color);
		gradient.addColorStop(1, '#111827');
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, 52, 0, Math.PI * 2);
		context.fill();
	}

	static box(context, color) {
		context.fillRect(-48, -48, 96, 96);
		context.fillStyle = '#0f172a88';
		context.beginPath();
		context.moveTo(-48, -48);
		context.lineTo(-26, -68);
		context.lineTo(70, -68);
		context.lineTo(48, -48);
		context.closePath();
		context.fill();
		context.strokeStyle = color;
		context.strokeRect(-48, -48, 96, 96);
	}

	static polygon(context, sides, radius, offset = -Math.PI / 2) {
		context.beginPath();
		for (let index = 0; index < sides; index += 1) {
			const angle = offset + index * Math.PI * 2 / sides;
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;
			index ? context.lineTo(x, y) : context.moveTo(x, y);
		}
		context.closePath();
		context.fill();
		context.stroke();
	}

	static ring(context) {
		context.lineWidth = 18;
		context.beginPath();
		context.ellipse(0, 0, 58, 34, -0.25, 0, Math.PI * 2);
		context.stroke();
	}

	static arch(context) {
		context.lineWidth = 20;
		context.beginPath();
		context.arc(0, 16, 48, Math.PI, 0);
		context.lineTo(48, 58);
		context.moveTo(-48, 16);
		context.lineTo(-48, 58);
		context.stroke();
	}

	static ribbon(context) {
		context.lineWidth = 14;
		context.beginPath();
		context.moveTo(-70, 28);
		context.bezierCurveTo(-30, -60, 20, 70, 72, -25);
		context.stroke();
	}
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

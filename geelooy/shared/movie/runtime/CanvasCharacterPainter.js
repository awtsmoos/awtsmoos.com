//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasCharacterPainter.js
 * @description Gives canonical character entities a seekable human silhouette with deterministic performance motion.
 * The Awtsmoos renews face and gesture at every sampled beat; Awtsmoos.com lets AI-authored people remain visible anywhere Canvas and time meet.
 */
export class CanvasCharacterPainter {
	static paint(context, entity) {
		const vessel = entity.renderTransform || entity.transform || {};
		const color = entity.style?.color || '#fb7185';
		const phase = (Number(entity.localTimeMs) || 0) / 420;
		const armSwing = Math.sin(phase) * 0.48;
		const legSwing = Math.sin(phase + Math.PI) * 0.32;
		context.save();
		context.translate(number(vessel.x), number(vessel.y));
		context.rotate(number(vessel.rotation));
		context.scale(number(vessel.scaleX, 1), number(vessel.scaleY, 1));
		context.globalAlpha *= number(vessel.opacity, 1);
		this.shadow(context);
		this.body(context, color);
		this.limbs(context, color, armSwing, legSwing);
		this.head(context, color);
		this.name(context, entity.name);
		context.restore();
	}

	static shadow(context) {
		context.fillStyle = '#00000055';
		context.beginPath();
		context.ellipse(0, 62, 32, 9, 0, 0, Math.PI * 2);
		context.fill();
	}

	static body(context, color) {
		context.fillStyle = color;
		context.beginPath();
		context.roundRect(-21, -16, 42, 62, 14);
		context.fill();
		context.fillStyle = '#ffffff33';
		context.fillRect(-13, -8, 8, 38);
	}

	static limbs(context, color, armSwing, legSwing) {
		context.strokeStyle = color;
		context.lineWidth = 12;
		context.lineCap = 'round';
		limb(context, -14, 0, -36, 29, armSwing);
		limb(context, 14, 0, 36, 29, -armSwing);
		limb(context, -10, 42, -15, 70, legSwing);
		limb(context, 10, 42, 15, 70, -legSwing);
	}

	static head(context, color) {
		context.fillStyle = '#f4c7a1';
		context.beginPath();
		context.arc(0, -42, 22, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = color;
		context.beginPath();
		context.arc(0, -49, 22, Math.PI, Math.PI * 2);
		context.fill();
		context.fillStyle = '#111827';
		context.beginPath();
		context.arc(-7, -42, 2, 0, Math.PI * 2);
		context.arc(7, -42, 2, 0, Math.PI * 2);
		context.fill();
	}

	static name(context, name) {
		if (!name) return;
		context.font = '600 15px system-ui, sans-serif';
		context.textAlign = 'center';
		context.fillStyle = '#f8fafc';
		context.fillText(String(name), 0, 91);
	}
}

function limb(context, startX, startY, endX, endY, rotation) {
	context.save();
	context.translate(startX, startY);
	context.rotate(rotation);
	context.beginPath();
	context.moveTo(0, 0);
	context.lineTo(endX - startX, endY - startY);
	context.stroke();
	context.restore();
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

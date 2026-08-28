//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasBackdropPainter.js
 * @description Gives every canonical scene a deterministic visual atmosphere derived from its semantic kind and dimension.
 * The Awtsmoos renews the stage before each vessel appears in view; Awtsmoos.com lets AI change the world's mood without hardcoding a scene anew.
 */
export class CanvasBackdropPainter {
	static paint(context, canvas, scene, timeMs = 0) {
		const colors = palette(scene?.kind, scene?.dimension);
		const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(0.55, colors[1]);
		gradient.addColorStop(1, colors[2]);
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);
		this.grid(context, canvas, scene?.dimension, timeMs);
	}

	static grid(context, canvas, dimension, timeMs) {
		if (!['3d', 'hybrid'].includes(String(dimension))) return;
		const horizon = canvas.height * 0.62;
		const drift = (timeMs / 120) % 36;
		context.strokeStyle = '#ffffff18';
		context.lineWidth = 1;
		for (let row = 0; row < 9; row += 1) {
			const y = horizon + row * row * 4.2 + drift;
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(canvas.width, y);
			context.stroke();
		}
		for (let column = -5; column <= 5; column += 1) {
			context.beginPath();
			context.moveTo(canvas.width / 2, horizon);
			context.lineTo(canvas.width / 2 + column * 120, canvas.height);
			context.stroke();
		}
	}
}

function palette(kind, dimension) {
	const value = String(kind || 'cinematic');
	if (value === 'infographic') return ['#071a2d', '#0f3d4d', '#13213a'];
	if (value === 'tutorial') return ['#1d132d', '#31204a', '#11253c'];
	if (value === 'dialogue') return ['#151d2e', '#27324a', '#151827'];
	if (value === 'world') return ['#081e21', '#163b35', '#1b2840'];
	if (String(dimension) === '3d') return ['#090d1d', '#202b4c', '#15172d'];
	if (String(dimension) === 'hybrid') return ['#120b25', '#17324a', '#0c2133'];
	return ['#0b1324', '#1d2d44', '#0f172a'];
}

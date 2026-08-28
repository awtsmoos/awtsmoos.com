//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasTextPainter.js
 * @description Keeps canonical text and dialogue readable, centered, wrapped, and renderer-neutral.
 * The Awtsmoos renews the word before it enters the frame; Awtsmoos.com lets editable language move without surrendering its name.
 */
export class CanvasTextPainter {
	static text(context, entity) {
		const color = entity.style?.color || '#f8fafc';
		const size = Math.max(18, Number(entity.style?.fontSize) || 32);
		context.fillStyle = color;
		context.font = `800 ${size}px system-ui, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		this.wrap(
			context,
			String(entity.content || entity.name || ''),
			0,
			0,
			Math.max(180, Number(entity.style?.maxWidth) || 620),
			size * 1.18
		);
	}

	static dialogue(context, entity) {
		context.fillStyle = '#0f172ee8';
		context.strokeStyle = entity.style?.color || '#f8fafc';
		context.lineWidth = 3;
		context.beginPath();
		context.roundRect(-210, -52, 420, 104, 18);
		context.fill();
		context.stroke();
		context.fillStyle = '#f8fafc';
		context.font = '600 20px system-ui, sans-serif';
		context.textAlign = 'center';
		this.wrap(context, String(entity.content || ''), 0, -10, 370, 25);
	}

	static caption(context, entity) {
		const label = String(entity.content || entity.data?.label || entity.name || '');
		if (!label) return;
		context.fillStyle = '#f8fafc';
		context.font = '700 16px system-ui, sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(label, 0, 0);
	}

	static wrap(context, text, x, y, maxWidth, lineHeight) {
		const words = text.split(/\s+/);
		let line = '';
		let row = 0;
		for (const word of words) {
			const candidate = `${line} ${word}`.trim();
			if (line && context.measureText(candidate).width > maxWidth) {
				context.fillText(line, x, y + row * lineHeight);
				line = word;
				row += 1;
			} else {
				line = candidate;
			}
		}
		if (line) context.fillText(line, x, y + row * lineHeight);
	}
}

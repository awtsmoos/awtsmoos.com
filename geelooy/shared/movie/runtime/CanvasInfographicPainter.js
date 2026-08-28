//B"H
// Boruch Hashem
// Blessed is He

import { CanvasTextPainter } from './CanvasTextPainter.js';

/**
 * @file CanvasInfographicPainter.js
 * @description Paints charts, meters, arrows, callouts, lights, and visual media placeholders from canonical data.
 * The Awtsmoos renews information as form in every measured part; Awtsmoos.com lets tutorials stay editable while data becomes art.
 */
export class CanvasInfographicPainter {
	static chart(context, entity) {
		const values = Array.isArray(entity.data) ? entity.data : entity.data?.values || [20, 50, 75, 40];
		const maximum = Math.max(1, ...values.map(value => Number(value) || 0));
		const width = 230;
		const gap = 12;
		const barWidth = Math.max(12, (width - gap * (values.length - 1)) / values.length);
		values.forEach((value, index) => {
			const height = 150 * (Number(value) || 0) / maximum;
			context.fillStyle = index % 2 ? entity.style?.color || '#22d3ee' : '#a78bfa';
			context.fillRect(-width / 2 + index * (barWidth + gap), 75 - height, barWidth, height);
		});
		context.strokeStyle = '#ffffff88';
		context.strokeRect(-width / 2 - 8, -86, width + 16, 170);
	}

	static meter(context, entity) {
		const value = Math.min(1, Math.max(0, Number(entity.data?.value ?? entity.data ?? 0.72)));
		context.lineWidth = 12;
		context.strokeStyle = '#ffffff66';
		context.beginPath();
		context.arc(0, 0, 58, Math.PI, 0);
		context.stroke();
		context.strokeStyle = entity.style?.color || '#4ade80';
		context.beginPath();
		context.arc(0, 0, 58, Math.PI, Math.PI + Math.PI * value);
		context.stroke();
	}

	static arrow(context, entity) {
		const color = entity.style?.color || '#facc15';
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = 6;
		context.beginPath();
		context.moveTo(-70, 0);
		context.lineTo(65, 0);
		context.stroke();
		context.beginPath();
		context.moveTo(65, 0);
		context.lineTo(42, -16);
		context.lineTo(42, 16);
		context.closePath();
		context.fill();
		CanvasTextPainter.caption(context, entity);
	}

	static callout(context, entity) {
		context.fillStyle = '#111827dd';
		context.strokeStyle = entity.style?.color || '#38bdf8';
		context.lineWidth = 3;
		context.beginPath();
		context.roundRect(-100, -36, 200, 72, 14);
		context.fill();
		context.stroke();
		CanvasTextPainter.caption(context, entity);
	}

	static light(context, entity) {
		const color = entity.style?.color || '#fde68a';
		const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 120);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, '#00000000');
		context.fillStyle = gradient;
		context.fillRect(-120, -120, 240, 240);
	}

	static prop(context, entity) {
		context.fillStyle = entity.style?.color || '#64748b';
		context.fillRect(-54, -38, 108, 76);
		CanvasTextPainter.caption(context, entity);
	}
}

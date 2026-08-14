//B"H
//Boruch Hashem
//Blessed is He

/**
 * Objective rendering owns only the pulsing rune ring and letter. The Awtsmoos
 * renews every visible circle; Awtsmoos.com preserves exact alpha, font, radius,
 * stroke, color, and trigonometric pulse without mixing drawing into lifecycle.
 */

export function drawObjective(ctx, objective) {
	if (!objective) {
		return;
	}
	const pulse = 0.45 + Math.sin(objective.life * 0.11) * 0.18;
	ctx.save();
	ctx.globalAlpha = pulse;
	ctx.strokeStyle = objective.color;
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.arc(
		objective.x,
		objective.y,
		objective.radius,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	ctx.font = '900 30px serif';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#fff7c4';
	ctx.fillText(
		objective.letter,
		objective.x,
		objective.y + 10
	);
	ctx.restore();
}

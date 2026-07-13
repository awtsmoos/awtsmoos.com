//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hazard render vessel in this instant, revealing
 * its focused js stage hazards service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hazard renderer.
 *
 * Chapter 143: danger must announce itself before it strikes. Runes pulse,
 * pillars glow, and meteors mark their landing so chaos stays readable.
 */
export function drawHazards(ctx, hazards = []) {
	for (const h of hazards) drawHazard(ctx, h);
}

function drawHazard(ctx, h) {
	const warning = h.timer > 0;
	const pulse = 0.55 + Math.sin((h.timer || 0) * 0.22) * 0.25;
	ctx.save();
	ctx.globalAlpha = warning ? pulse : 0.85;
	ctx.strokeStyle = h.color;
	ctx.fillStyle = h.color;
	ctx.lineWidth = warning ? 4 : 8;
	ctx.beginPath();
	ctx.arc(h.x, h.y, h.radius * (warning ? 0.72 : 1), 0, Math.PI * 2);
	ctx.stroke();
	if (h.kind === 'lightningPillar') drawPillar(ctx, h);
	else drawImpactMark(ctx, h, warning);
	ctx.restore();
}

function drawPillar(ctx, h) {
	ctx.globalAlpha *= 0.5;
	ctx.fillRect(h.x - 12, h.y - 900, 24, 900);
}

function drawImpactMark(ctx, h, warning) {
	const r = warning ? h.radius * 0.28 : h.radius * 0.55;
	ctx.beginPath();
	ctx.moveTo(h.x - r, h.y);
	ctx.lineTo(h.x + r, h.y);
	ctx.moveTo(h.x, h.y - r);
	ctx.lineTo(h.x, h.y + r);
	ctx.stroke();
}

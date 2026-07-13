//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw attack wind vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawAttackWind(ctx, f, color) {
	if (!f.attack) return;
	const hand = f.bones.rightLowerArm?.tip || { x: f.x + (f.face || 1) * 60, y: f.y - 90 };
	ctx.save();
	ctx.globalAlpha = 0.22;
	ctx.strokeStyle = color;
	ctx.lineWidth = f.attack.fullCharge ? 7 : 3;
	ctx.beginPath();
	ctx.arc(hand.x - (f.face || 1) * 18, hand.y, 24 + ((f.attackFrame || 0) % 18), -0.8, 0.8);
	ctx.stroke();
	ctx.restore();
}

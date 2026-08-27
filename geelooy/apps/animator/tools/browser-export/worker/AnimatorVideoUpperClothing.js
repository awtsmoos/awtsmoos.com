/* B"H
Boruch Hashem
Blessed is He

Upper clothing reveals fit, chest depth, sleeve exposure, collar, placket, and
fabric weight. The Awtsmoos renews anatomy and cloth as one moving vessel.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawSleeves = function drawSleeves(ctx, wardrobe, anatomy, joints, garment, colors) {
	const shoulderY = joints.chest.y + 5 * anatomy.scale + joints.shoulderDrop * anatomy.scale;
	for (const side of [-1, 1]) {
		const hand = side < 0 ? joints.leftHand : joints.rightHand;
		const shoulder = { x: joints.chest.x + side * anatomy.shoulder * 0.5, y: shoulderY };
		const sleeveEnd = {
			x: shoulder.x + (hand.x - shoulder.x) * garment.sleeve,
			y: shoulder.y + (hand.y - shoulder.y) * garment.sleeve
		};
		if (garment.sleeve > 0.1) {
			AnimatorVideo.line(ctx, shoulder, sleeveEnd, (11 + garment.fabric * 4) * anatomy.scale * garment.fit, colors.coat);
		}
		AnimatorVideo.line(ctx, sleeveEnd, hand, 8 * anatomy.scale, colors.skin);
		AnimatorVideo.ellipse(ctx, hand.x, hand.y, 6 * anatomy.scale, 6 * anatomy.scale, colors.skin);
	}
};

AnimatorVideo.drawTorsoGarments = function drawTorsoGarments(ctx, wardrobe, anatomy, joints, garment, colors) {
	const longHem = ['coat', 'robe'].includes(wardrobe.outerwear);
	const hemY = joints.pelvis.y + anatomy.torsoHeight * (longHem ? 0.72 : 0.28) * garment.hem;
	const shoulderY = joints.chest.y;
	const chestLift = 6 * anatomy.scale * anatomy.chestDepth;
	AnimatorVideo.polygon(ctx, [
		{ x: joints.chest.x - garment.shoulder * 0.52, y: shoulderY },
		{ x: joints.chest.x - garment.waist * 0.52, y: joints.pelvis.y - anatomy.torsoHeight * 0.18 },
		{ x: joints.chest.x - garment.hip * 0.52, y: hemY },
		{ x: joints.chest.x + garment.hip * 0.52, y: hemY },
		{ x: joints.chest.x + garment.waist * 0.52, y: joints.pelvis.y - anatomy.torsoHeight * 0.18 },
		{ x: joints.chest.x + garment.shoulder * 0.52, y: shoulderY },
		{ x: joints.chest.x, y: shoulderY - chestLift }
	], colors.coat, '#111827');
	const topWidth = 26 * anatomy.scale * Math.min(1.25, garment.fit);
	AnimatorVideo.roundRect(ctx, joints.chest.x - topWidth * 0.5, shoulderY + 7 * anatomy.scale, topWidth, Math.max(24 * anatomy.scale, joints.pelvis.y - shoulderY - 8 * anatomy.scale), 5 * anatomy.scale, colors.top);
	if (wardrobe.outerwear !== 'none') {
		AnimatorVideo.line(ctx, { x: joints.chest.x, y: shoulderY + 11 * anatomy.scale }, { x: joints.chest.x, y: hemY - 5 * anatomy.scale }, 3 * anatomy.scale, colors.accent);
	}
	AnimatorVideo.drawCollar(ctx, wardrobe, joints, anatomy, colors);
};

AnimatorVideo.drawCollar = function drawCollar(ctx, wardrobe, joints, anatomy, colors) {
	const collar = wardrobe.collar || 'folded';
	const y = joints.chest.y + 6 * anatomy.scale;
	if (collar === 'none') {
		return;
	}
	if (collar === 'crew') {
		AnimatorVideo.ellipse(ctx, joints.chest.x, y, 10 * anatomy.scale, 5 * anatomy.scale, colors.accent);
		return;
	}
	if (collar === 'high') {
		AnimatorVideo.roundRect(ctx, joints.chest.x - 10 * anatomy.scale, y - 8 * anatomy.scale, 20 * anatomy.scale, 18 * anatomy.scale, 5 * anatomy.scale, colors.top);
		return;
	}
	if (collar === 'hood') {
		ctx.strokeStyle = colors.coat;
		ctx.lineWidth = 8 * anatomy.scale;
		ctx.beginPath();
		ctx.arc(joints.chest.x, y, 18 * anatomy.scale, 0, Math.PI);
		ctx.stroke();
		return;
	}
	AnimatorVideo.polygon(ctx, [
		{ x: joints.chest.x - 13 * anatomy.scale, y },
		{ x: joints.chest.x, y: y + 15 * anatomy.scale },
		{ x: joints.chest.x + 13 * anatomy.scale, y }
	], colors.top, colors.accent);
};

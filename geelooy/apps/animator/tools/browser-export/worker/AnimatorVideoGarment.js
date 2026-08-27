/* B"H
Boruch Hashem
Blessed is He

Garment JSON becomes lower silhouette, exposed skin, drape, and footwear. The
Awtsmoos renews every hem while Awtsmoos.com keeps style independent of gender.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.garment = function garment(wardrobe, anatomy) {
	const fit = { fitted: 0.9, regular: 1, relaxed: 1.12, oversized: 1.26 }[wardrobe.fit] || 1;
	return {
		fit,
		fabric: Number(wardrobe.fabricWeight ?? 0.5),
		sleeve: { sleeveless: 0.08, short: 0.38, elbow: 0.62, long: 0.93 }[wardrobe.sleeveLength] || 0.93,
		lowerSpread: { tapered: 0.82, straight: 1, wide: 1.24, flared: 1.42, pleated: 1.32 }[wardrobe.lowerShape] || 1,
		hem: { none: 0.7, vest: 0.78, hoodie: 0.92, jacket: 0.94, coat: 1.22, robe: 1.48 }[wardrobe.outerwear] || 0.94,
		shoulder: anatomy.shoulder * fit,
		hip: anatomy.hip * (0.9 + fit * 0.1),
		waist: anatomy.waist * (0.92 + fit * 0.08)
	};
};

AnimatorVideo.drawLowerGarment = function drawLowerGarment(ctx, wardrobe, anatomy, joints, garment, colors) {
	const kind = wardrobe.bottom || 'trousers';
	if (kind === 'shorts') {
		AnimatorVideo.drawShorts(ctx, anatomy, joints, garment, colors);
		return;
	}
	if (['skirt', 'robe'].includes(kind)) {
		AnimatorVideo.drawSkirt(ctx, wardrobe, anatomy, joints, garment, colors, kind);
		return;
	}
	const width = 13 * anatomy.scale * garment.lowerSpread;
	AnimatorVideo.line(ctx, { x: joints.pelvis.x - anatomy.hip * 0.22, y: joints.pelvis.y }, joints.leftFoot, width, colors.bottom);
	AnimatorVideo.line(ctx, { x: joints.pelvis.x + anatomy.hip * 0.22, y: joints.pelvis.y }, joints.rightFoot, width, colors.bottom);
};

AnimatorVideo.drawShorts = function drawShorts(ctx, anatomy, joints, garment, colors) {
	for (const side of [-1, 1]) {
		const foot = side < 0 ? joints.leftFoot : joints.rightFoot;
		const hip = { x: joints.pelvis.x + side * anatomy.hip * 0.22, y: joints.pelvis.y };
		const hem = { x: hip.x + (foot.x - hip.x) * 0.38, y: hip.y + (foot.y - hip.y) * 0.38 };
		AnimatorVideo.line(ctx, hip, hem, 15 * anatomy.scale * garment.lowerSpread, colors.bottom);
		AnimatorVideo.line(ctx, hem, foot, 9 * anatomy.scale, colors.skin);
	}
};

AnimatorVideo.drawSkirt = function drawSkirt(ctx, wardrobe, anatomy, joints, garment, colors, kind) {
	const long = kind === 'robe';
	if (!long) {
		AnimatorVideo.line(ctx, joints.pelvis, joints.leftFoot, 9 * anatomy.scale, colors.skin);
		AnimatorVideo.line(ctx, joints.pelvis, joints.rightFoot, 9 * anatomy.scale, colors.skin);
	}
	const hemY = long ? joints.leftFoot.y - 8 * anatomy.scale : joints.pelvis.y + 52 * anatomy.scale;
	const halfTop = garment.hip * 0.5;
	const halfBottom = garment.hip * 0.72 * garment.lowerSpread * (0.84 + garment.fabric * 0.34);
	AnimatorVideo.polygon(ctx, [
		{ x: joints.pelvis.x - halfTop, y: joints.pelvis.y },
		{ x: joints.pelvis.x + halfTop, y: joints.pelvis.y },
		{ x: joints.pelvis.x + halfBottom, y: hemY },
		{ x: joints.pelvis.x - halfBottom, y: hemY }
	], colors.bottom, '#111827');
	if (wardrobe.lowerShape === 'pleated') {
		AnimatorVideo.withAlpha(ctx, 0.28, () => {
			for (let index = -2; index <= 2; index += 1) {
				AnimatorVideo.line(ctx, { x: joints.pelvis.x + index * 5 * anatomy.scale, y: joints.pelvis.y }, { x: joints.pelvis.x + index * halfBottom * 0.24, y: hemY }, 1.5 * anatomy.scale, '#111827');
			}
		});
	}
};

AnimatorVideo.drawShoes = function drawShoes(ctx, wardrobe, joints, anatomy, color) {
	const profile = wardrobe.shoeProfile || 'sneaker';
	const width = { sneaker: 34, boot: 36, loafer: 31, sandal: 30, heel: 27 }[profile] || 34;
	for (const foot of [joints.leftFoot, joints.rightFoot]) {
		if (profile === 'boot') {
			AnimatorVideo.roundRect(ctx, foot.x - 12 * anatomy.scale, foot.y - 20 * anatomy.scale, 24 * anatomy.scale, 24 * anatomy.scale, 5 * anatomy.scale, color);
		}
		AnimatorVideo.roundRect(ctx, foot.x - width * 0.48 * anatomy.scale, foot.y - 5 * anatomy.scale, width * anatomy.scale, profile === 'heel' ? 8 * anatomy.scale : 10 * anatomy.scale, profile === 'loafer' ? 3 * anatomy.scale : 6 * anatomy.scale, color);
		if (profile === 'heel') {
			AnimatorVideo.roundRect(ctx, foot.x + 8 * anatomy.scale, foot.y + 2 * anatomy.scale, 4 * anatomy.scale, 8 * anatomy.scale, anatomy.scale, color);
		}
	}
};

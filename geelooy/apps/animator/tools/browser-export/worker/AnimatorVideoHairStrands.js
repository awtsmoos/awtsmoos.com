/* B"H
Boruch Hashem
Blessed is He

Short, stranded, gathered, flowing, curly, and coily hair keep distinct motion.
The Awtsmoos renews density and curl while Awtsmoos.com preserves identity.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawShortHair = function drawShortHair(ctx, head, anatomy, hair, color) {
	const density = Number(hair.density || 1);
	const count = Math.max(5, Math.round((hair.style === 'fade' ? 9 : 7) * density));
	for (let index = 0; index < count; index += 1) {
		const progress = index / Math.max(1, count - 1);
		const x = head.x - anatomy.headRadiusX * 0.78
			+ progress * anatomy.headRadiusX * 1.56;
		const y = head.y - anatomy.headRadiusY
			* (0.72 + Math.sin(progress * Math.PI) * 0.2);
		AnimatorVideo.ellipse(
			ctx,
			x,
			y,
			5 * anatomy.scale,
			(hair.style === 'fade' ? 6 : 8) * anatomy.scale,
			color
		);
	}
};

AnimatorVideo.drawHairStrands = function drawHairStrands(ctx, head, anatomy, hair, color, sway) {
	const density = Number(hair.density || 1);
	const baseCount = hair.style === 'braids' ? 7 : 9;
	const count = Math.max(4, Math.round(baseCount * density));
	const length = AnimatorVideo.hairLength(hair, anatomy);
	ctx.strokeStyle = color;
	ctx.lineWidth = (hair.style === 'braids' ? 5 : 7) * anatomy.scale;
	ctx.lineCap = 'round';
	for (let index = 0; index < count; index += 1) {
		const progress = index / Math.max(1, count - 1);
		const startX = head.x - anatomy.headRadiusX * 0.82
			+ progress * anatomy.headRadiusX * 1.64;
		ctx.beginPath();
		ctx.moveTo(startX, head.y - anatomy.headRadiusY * 0.45);
		ctx.bezierCurveTo(
			startX - sway,
			head.y + length * 0.25,
			startX + sway,
			head.y + length * 0.72,
			startX + sway * 0.5,
			head.y + length
		);
		ctx.stroke();
	}
};

AnimatorVideo.drawGatheredHair = function drawGatheredHair(ctx, head, anatomy, hair, color, sway) {
	if (hair.style === 'bun') {
		AnimatorVideo.ellipse(
			ctx,
			head.x + anatomy.direction * anatomy.headRadiusX * 0.78,
			head.y - anatomy.headRadiusY * 0.72,
			14 * anatomy.scale,
			14 * anatomy.scale,
			color
		);
		return;
	}
	const length = AnimatorVideo.hairLength(hair, anatomy);
	const x = head.x + anatomy.direction * anatomy.headRadiusX * 0.76;
	ctx.strokeStyle = color;
	ctx.lineWidth = 12 * anatomy.scale;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(x, head.y - anatomy.headRadiusY * 0.42);
	ctx.bezierCurveTo(
		x + sway,
		head.y + length * 0.2,
		x - sway,
		head.y + length * 0.7,
		x + sway,
		head.y + length
	);
	ctx.stroke();
};

AnimatorVideo.drawFlowingHair = function drawFlowingHair(ctx, head, anatomy, hair, color, sway) {
	const length = AnimatorVideo.hairLength(hair, anatomy);
	const texture = hair.texture || 'wavy';
	const curl = Number(hair.curlTightness || 0.5);
	const width = { straight: 8, wavy: 10, curly: 12, coily: 14 }[texture] || 10;
	for (const side of [-1, 1]) {
		const x = head.x + side * anatomy.headRadiusX * 0.78;
		ctx.strokeStyle = color;
		ctx.lineWidth = width * anatomy.scale;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(x, head.y - anatomy.headRadiusY * 0.34);
		ctx.bezierCurveTo(
			x + side * sway,
			head.y + length * 0.22,
			x - side * sway * (1 + curl),
			head.y + length * 0.68,
			x + side * sway,
			head.y + length
		);
		ctx.stroke();
		if (curl > 0.45) {
			const step = Math.max(6, 15 - curl * 8) * anatomy.scale;
			for (let offset = 8; offset < length; offset += step) {
				AnimatorVideo.ellipse(ctx, x + Math.sin(offset) * 3, head.y + offset, 6 * anatomy.scale, 6 * anatomy.scale, color);
			}
		}
	}
};

/* B"H
Boruch Hashem
Blessed is He

Jaw, chin, eyes, lids, gaze, brows, nose, cheeks, and lips reveal identity and
performance together. The Awtsmoos renews each feature in every camera view.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawHeadShape = function drawHeadShape(ctx, head, anatomy, skin) {
	AnimatorVideo.ellipse(ctx, head.x, head.y, anatomy.headRadiusX + 3 * anatomy.scale, anatomy.headRadiusY + 3 * anatomy.scale, '#111827');
	AnimatorVideo.ellipse(ctx, head.x, head.y - 2 * anatomy.scale, anatomy.headRadiusX, anatomy.headRadiusY * 0.84, skin);
	const jawWidth = anatomy.headRadiusX * 0.72 * anatomy.jaw;
	const chinY = head.y + anatomy.headRadiusY * 0.98 * anatomy.chinLength;
	const softness = anatomy.jawSoftness;
	AnimatorVideo.polygon(ctx, [
		{ x: head.x - jawWidth, y: head.y + anatomy.headRadiusY * 0.3 },
		{ x: head.x - jawWidth * softness * 0.34, y: chinY - anatomy.headRadiusY * 0.2 },
		{ x: head.x, y: chinY },
		{ x: head.x + jawWidth * softness * 0.34, y: chinY - anatomy.headRadiusY * 0.2 },
		{ x: head.x + jawWidth, y: head.y + anatomy.headRadiusY * 0.3 }
	], skin);
};

AnimatorVideo.drawEye = function drawEye(ctx, x, y, anatomy, expression, face, color, gaze) {
	const shape = {
		round: [1.02, 1.12],
		almond: [1.08, 0.92],
		wide: [1.22, 1.05],
		narrow: [1.08, 0.65],
		hooded: [1.08, 0.76]
	}[face.eyeShape] || [1, 1];
	const width = 7.5 * anatomy.scale * shape[0];
	const openness = expression.lid / anatomy.eyelid;
	const height = Math.max(1.2, 5.5 * anatomy.scale * openness * shape[1]);
	if (height < 1.6 * anatomy.scale) {
		AnimatorVideo.line(ctx, { x: x - width, y }, { x: x + width, y }, 2 * anatomy.scale, '#281a12');
		return;
	}
	AnimatorVideo.ellipse(ctx, x, y, width, height, '#ffffff');
	const pupilX = x + gaze.x * width * 0.45;
	const pupilY = y + gaze.y * height * 0.4;
	AnimatorVideo.ellipse(ctx, pupilX, pupilY, 2.8 * anatomy.scale, 2.8 * anatomy.scale, color);
	AnimatorVideo.ellipse(ctx, pupilX + anatomy.scale, pupilY - anatomy.scale, 0.8 * anatomy.scale, 0.8 * anatomy.scale, '#ffffff');
};

AnimatorVideo.drawBrows = function drawBrows(ctx, head, anatomy, expression, character) {
	const color = character.facialHair?.color
		|| character.hair?.color
		|| character.palette?.brow
		|| '#2a160c';
	const y = head.y - 18 * anatomy.scale;
	const rise = expression.brow * 7 * anatomy.scale;
	const weight = Math.max(2, 3 * anatomy.scale * anatomy.brow);
	AnimatorVideo.line(ctx, { x: head.x - anatomy.headRadiusX * 0.66, y: y + rise }, { x: head.x - anatomy.headRadiusX * 0.16, y: y - rise }, weight, color);
	if (!anatomy.profileView) {
		AnimatorVideo.line(ctx, { x: head.x + anatomy.headRadiusX * 0.16, y: y - rise }, { x: head.x + anatomy.headRadiusX * 0.66, y: y + rise }, weight, color);
	}
};

AnimatorVideo.drawNose = function drawNose(ctx, head, anatomy, face, skin) {
	const base = { small: 4, medium: 7, long: 11, broad: 8, hooked: 10, button: 5 }[face.nose] || 7;
	const projection = base * Number(face.noseProjection || 1);
	const bridge = Number(face.noseBridge || 1);
	const direction = anatomy.profileView ? anatomy.direction : 0.2;
	AnimatorVideo.polygon(ctx, [
		{ x: head.x + direction * 2 * anatomy.scale, y: head.y - 5 * anatomy.scale * bridge },
		{ x: head.x + direction * projection * anatomy.scale, y: head.y + 5 * anatomy.scale },
		{ x: head.x + direction * anatomy.scale, y: head.y + 8 * anatomy.scale }
	], AnimatorVideo.mixColor(skin, '#5b2c24', 0.12));
};

AnimatorVideo.drawCheeks = function drawCheeks(ctx, head, anatomy, expression, blush) {
	const alpha = Math.max(Number(blush || 0.1), expression.cheek * 0.24);
	AnimatorVideo.withAlpha(ctx, alpha, () => {
		AnimatorVideo.ellipse(ctx, head.x - anatomy.headRadiusX * 0.55, head.y + 10 * anatomy.scale, 7 * anatomy.scale * anatomy.cheek, 4 * anatomy.scale, '#e97878');
		if (!anatomy.profileView) {
			AnimatorVideo.ellipse(ctx, head.x + anatomy.headRadiusX * 0.55, head.y + 10 * anatomy.scale, 7 * anatomy.scale * anatomy.cheek, 4 * anatomy.scale, '#e97878');
		}
	});
};

AnimatorVideo.drawMouth = function drawMouth(ctx, head, anatomy, face, expression) {
	const shape = { thin: [0.82, 0.66], medium: [1, 1], full: [1.08, 1.38], wide: [1.35, 0.9] }[face.mouth] || [1, 1];
	const x = anatomy.profileView ? head.x + anatomy.direction * anatomy.headRadiusX * 0.5 : head.x;
	const y = head.y + 17 * anatomy.scale - expression.smile * 2 * anatomy.scale + expression.frown * 2 * anatomy.scale;
	const fullness = Number(face.lipFullness || 1) * shape[1];
	const width = 15 * anatomy.scale * shape[0] * (1 + Math.max(0, expression.smile) * 0.25) * (anatomy.profileView ? 0.56 : 1);
	const height = Math.max(2 * anatomy.scale, 13 * anatomy.scale * expression.jaw * fullness);
	AnimatorVideo.ellipse(ctx, x, y, width, height, '#521525');
	if (height > 5 * anatomy.scale) {
		AnimatorVideo.roundRect(ctx, x - width * 0.65, y - height * 0.38, width * 1.3, 3 * anatomy.scale, anatomy.scale, '#ffffff');
	}
};

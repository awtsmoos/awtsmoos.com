/* B"H
Boruch Hashem
Blessed is He

Expression moves eyes, lids, pupils, brows, cheeks, nose, jaw, lips, and facial
hair together. The Awtsmoos renews speaking and listening in every close-up.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawFace = function drawFace(
	ctx,
	head,
	anatomy,
	character,
	dialogue,
	performance,
	timeMs,
	gaze
) {
	const design = character.design || character;
	const face = design.face || {};
	const skin = design.skin?.color || character.palette?.skin || '#c98f68';
	const expression = AnimatorVideo.expression(
		performance.emotion || dialogue?.emotion || design.emotion?.default || 'calm',
		Boolean(dialogue),
		timeMs,
		dialogue?.speechStyle || performance.speechStyle
	);
	AnimatorVideo.drawHeadShape(ctx, head, anatomy, skin);
	if (anatomy.rearView) {
		return expression;
	}
	const eyeColor = face.eyeColor || character.palette?.eye || '#2b1b12';
	const gap = anatomy.profileView
		? anatomy.headRadiusX * 0.08
		: anatomy.headRadiusX * 0.38;
	const firstEyeX = anatomy.profileView
		? head.x + anatomy.direction * anatomy.headRadiusX * 0.08
		: head.x - gap;
	AnimatorVideo.drawEye(
		ctx,
		firstEyeX,
		head.y - 5 * anatomy.scale,
		anatomy,
		expression,
		face,
		eyeColor,
		gaze
	);
	if (!anatomy.profileView) {
		AnimatorVideo.drawEye(
			ctx,
			head.x + gap,
			head.y - 5 * anatomy.scale,
			anatomy,
			expression,
			face,
			eyeColor,
			gaze
		);
	}
	AnimatorVideo.drawBrows(ctx, head, anatomy, expression, character);
	AnimatorVideo.drawNose(ctx, head, anatomy, face, skin);
	AnimatorVideo.drawCheeks(
		ctx,
		head,
		anatomy,
		expression,
		design.skin?.blush
	);
	AnimatorVideo.drawMouth(ctx, head, anatomy, face, expression);
	AnimatorVideo.drawFacialHair(ctx, head, anatomy, character);
	return expression;
};

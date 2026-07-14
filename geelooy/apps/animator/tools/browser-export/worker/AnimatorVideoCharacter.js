/* B"H
Boruch Hashem
Blessed is He

One original character appears as coordinated anatomy, wardrobe, face, hair,
listening gaze, prop contact, posture, breath, and readable authored identity.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawCharacter = function drawCharacter(ctx, character, options) {
	const anatomy = AnimatorVideo.anatomy(
		character,
		options.scale,
		options.view,
		options.performance.pose
	);
	const joints = AnimatorVideo.bodyJoints(
		options.x,
		options.ground,
		anatomy,
		options.timeMs,
		options.performance,
		options.phase
	);
	if (options.performance.listening && !options.dialogue) {
		joints.chest.x += options.gaze.x * 4 * anatomy.scale;
		joints.neck.x += options.gaze.x * 6 * anatomy.scale;
	}
	const contacts = AnimatorVideo.drawClothing(
		ctx,
		character,
		anatomy,
		joints,
		options.performance
	);
	const breath = Math.sin(options.timeMs / 620 + options.phase)
		* 2 * anatomy.scale;
	const head = {
		x: joints.neck.x + options.gaze.x * 2 * anatomy.scale,
		y: joints.neck.y - anatomy.headRadiusY + breath
	};
	AnimatorVideo.drawFace(
		ctx,
		head,
		anatomy,
		character,
		options.dialogue,
		options.performance,
		options.timeMs,
		options.gaze
	);
	AnimatorVideo.drawHair(
		ctx,
		head,
		anatomy,
		character,
		options.timeMs
	);
	AnimatorVideo.drawHeldProp(
		ctx,
		options.performance.prop,
		contacts.rightHand,
		anatomy,
		options.timeMs
	);
	AnimatorVideo.drawName(
		ctx,
		character,
		options.x,
		options.ground,
		anatomy
	);
};

AnimatorVideo.drawName = function drawName(ctx, character, x, ground, anatomy) {
	const label = character.name || character.role || 'Original Character';
	ctx.font = `${Math.max(8, 9 * anatomy.scale)}px ui-monospace, monospace`;
	const width = Math.min(
		110 * anatomy.scale,
		ctx.measureText(label).width + 12 * anatomy.scale
	);
	AnimatorVideo.withAlpha(ctx, 0.72, () => {
		AnimatorVideo.roundRect(
			ctx,
			x - width / 2,
			ground + 8 * anatomy.scale,
			width,
			16 * anatomy.scale,
			7 * anatomy.scale,
			'#050713'
		);
	});
	ctx.fillStyle = '#f8fafc';
	ctx.textAlign = 'center';
	ctx.fillText(label, x, ground + 20 * anatomy.scale);
	ctx.textAlign = 'left';
};

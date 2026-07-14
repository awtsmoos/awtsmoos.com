/* B"H
Boruch Hashem
Blessed is He

The cast enters camera space with deliberate spacing, listening gaze, posture,
and speaker focus. The Awtsmoos renews ensemble relationships in every shot.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawCast = function drawCast(
	ctx,
	canvas,
	shot,
	dialogue,
	camera,
	timeMs
) {
	const characters = AnimatorVideo.visibleCharacters(shot);
	const speakerIndex = characters.findIndex(character => (
		character.identityId === dialogue?.speakerId
	));
	characters.forEach((character, index) => {
		AnimatorVideo.drawCastMember({
			ctx,
			canvas,
			character,
			index,
			characters,
			speakerIndex,
			dialogue,
			camera,
			timeMs
		});
	});
};

AnimatorVideo.drawCastMember = function drawCastMember(options) {
	const {
		ctx,
		canvas,
		character,
		index,
		characters,
		speakerIndex,
		dialogue,
		camera,
		timeMs
	} = options;
	const spacing = canvas.width / (characters.length + 1);
	const speaker = index === speakerIndex;
	const performance = AnimatorVideo.performance(
		character.identityId,
		timeMs
	);
	const design = character.design || character;
	performance.posture ||= design.movement?.posture || 'upright';
	performance.emotion ||= speaker
		? dialogue?.emotion
		: design.emotion?.default || 'calm';
	const scale = camera.scale
		/ Math.max(1, characters.length * 0.27)
		* Number(character.scale || 0.86);
	const x = spacing * (index + 1) + camera.panX;
	const ground = 316 + camera.panY;
	const targetX = speakerIndex >= 0
		? spacing * (speakerIndex + 1)
		: canvas.width * 0.5;
	AnimatorVideo.drawCharacter(ctx, character, {
		x,
		ground,
		scale,
		view: camera.view,
		timeMs,
		phase: index * 1.67,
		performance,
		dialogue: speaker ? dialogue : null,
		gaze: {
			x: speaker ? 0 : Math.sign(targetX - x) * 0.62,
			y: speaker ? -0.08 : -0.02
		}
	});
};

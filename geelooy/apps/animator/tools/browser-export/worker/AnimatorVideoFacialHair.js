/* B"H
Boruch Hashem
Blessed is He

Beard and mustache remain independent authored systems. The Awtsmoos renews
stubble, boxed, full, long, goatee, pencil, natural, handlebar, and walrus forms.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawFacialHair = function drawFacialHair(ctx, head, anatomy, character) {
	const facial = character.facialHair || character.design?.facialHair || {};
	const color = facial.color || character.hair?.color || '#2f1d16';
	AnimatorVideo.drawBeard(ctx, head, anatomy, facial.beard || {}, color);
	AnimatorVideo.drawMustache(ctx, head, anatomy, facial.mustache || {}, color);
};

AnimatorVideo.drawBeard = function drawBeard(ctx, head, anatomy, beard, color) {
	const style = beard.style || 'none';
	if (style === 'none') {
		return;
	}
	const authored = 0.65 + Number(beard.length || 0.4);
	const base = {
		stubble: 0.18,
		short: 0.32,
		boxed: 0.45,
		full: 0.58,
		long: 1.05,
		goatee: 0.62
	}[style] || 0.45;
	const length = anatomy.headRadiusY * base * authored;
	if (style === 'stubble') {
		AnimatorVideo.withAlpha(ctx, 0.3, () => {
			AnimatorVideo.ellipse(ctx, head.x, head.y + anatomy.headRadiusY * 0.48, anatomy.headRadiusX * 0.72, length, color);
		});
		return;
	}
	const width = style === 'goatee'
		? anatomy.headRadiusX * 0.28
		: anatomy.headRadiusX * 0.75;
	AnimatorVideo.ellipse(ctx, head.x, head.y + anatomy.headRadiusY * 0.52, width, length * 0.5, color);
};

AnimatorVideo.drawMustache = function drawMustache(ctx, head, anatomy, mustache, color) {
	const style = mustache.style || 'none';
	if (style === 'none') {
		return;
	}
	const authored = 0.6 + Number(mustache.thickness || 0.5);
	const width = anatomy.headRadiusX * ({
		pencil: 0.42,
		natural: 0.58,
		handlebar: 0.78,
		walrus: 0.68
	}[style] || 0.55);
	const thickness = (style === 'walrus' ? 6 : 4) * anatomy.scale * authored;
	AnimatorVideo.line(ctx, { x: head.x - width, y: head.y + 10 * anatomy.scale }, { x: head.x + width, y: head.y + 10 * anatomy.scale }, thickness, color);
	if (style === 'handlebar') {
		AnimatorVideo.ellipse(ctx, head.x - width * 1.08, head.y + 7 * anatomy.scale, 5 * anatomy.scale, 3 * anatomy.scale, color);
		AnimatorVideo.ellipse(ctx, head.x + width * 1.08, head.y + 7 * anatomy.scale, 5 * anatomy.scale, 3 * anatomy.scale, color);
	}
};

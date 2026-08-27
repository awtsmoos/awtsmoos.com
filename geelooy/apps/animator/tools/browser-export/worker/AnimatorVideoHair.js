/* B"H
Boruch Hashem
Blessed is He

Hair has mass, line, texture, hairline, volume, density, curl, and motion. The
Awtsmoos renews every original silhouette while Awtsmoos.com keeps it editable.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawHair = function drawHair(ctx, head, anatomy, character, timeMs) {
	const design = character.design || character;
	const hair = design.hair || {};
	if (hair.length === 'bald') {
		return;
	}
	const color = hair.color || character.palette?.hair || '#2f1d16';
	const volume = Number(hair.volume || 1);
	const sway = Math.sin(timeMs / 420 + head.x * 0.01)
		* 3 * anatomy.scale;
	const capY = head.y - anatomy.headRadiusY
		* AnimatorVideo.hairline(hair.hairline);
	AnimatorVideo.ellipse(
		ctx,
		head.x,
		capY,
		anatomy.headRadiusX * 1.03 * volume,
		anatomy.headRadiusY * 0.76 * volume,
		color
	);
	if (['crop', 'fade'].includes(hair.style)) {
		AnimatorVideo.drawShortHair(ctx, head, anatomy, hair, color);
		return;
	}
	if (['braids', 'locs'].includes(hair.style)) {
		AnimatorVideo.drawHairStrands(
			ctx,
			head,
			anatomy,
			hair,
			color,
			sway
		);
		return;
	}
	if (['bun', 'ponytail'].includes(hair.style)) {
		AnimatorVideo.drawGatheredHair(
			ctx,
			head,
			anatomy,
			hair,
			color,
			sway
		);
		return;
	}
	AnimatorVideo.drawFlowingHair(
		ctx,
		head,
		anatomy,
		hair,
		color,
		sway
	);
};

AnimatorVideo.hairline = function hairline(value) {
	return {
		natural: 0.3,
		low: 0.2,
		high: 0.44,
		widow: 0.36,
		rounded: 0.25
	}[value] || 0.3;
};

AnimatorVideo.hairLength = function hairLength(hair, anatomy) {
	return {
		short: 12 * anatomy.scale,
		medium: anatomy.headRadiusY * 0.95,
		long: anatomy.headRadiusY * 1.85,
		veryLong: anatomy.headRadiusY * 2.75
	}[hair.length] || anatomy.headRadiusY;
};

/* B"H
Boruch Hashem
Blessed is He

Clothing wraps anatomy instead of repainting one oval. The Awtsmoos renews fit,
collar, sleeve, hem, lower silhouette, shoe, hand, and contact shadow together.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawClothing = function drawClothing(ctx, character, anatomy, joints) {
	const design = character.design || character;
	const wardrobe = design.wardrobe || character.clothing || {};
	const palette = wardrobe.colors || {};
	const colors = {
		coat: palette.outerwear || character.palette?.coat || '#3f6fb6',
		top: palette.top || character.palette?.shirt || '#f4eadc',
		bottom: palette.bottom || character.palette?.pants || '#20283a',
		shoes: palette.shoes || character.palette?.shoe || '#111318',
		accent: palette.accent || character.palette?.accent || '#f1b84b',
		skin: design.skin?.color || character.palette?.skin || '#c98f68'
	};
	const garment = AnimatorVideo.garment(wardrobe, anatomy);
	AnimatorVideo.withAlpha(ctx, 0.28, () => {
		AnimatorVideo.ellipse(
			ctx,
			joints.pelvis.x,
			joints.leftFoot.y + 5,
			anatomy.hip * 0.9,
			7 * anatomy.scale,
			'#000000'
		);
	});
	AnimatorVideo.drawLowerGarment(
		ctx,
		wardrobe,
		anatomy,
		joints,
		garment,
		colors
	);
	AnimatorVideo.drawShoes(
		ctx,
		wardrobe,
		joints,
		anatomy,
		colors.shoes
	);
	AnimatorVideo.drawSleeves(
		ctx,
		wardrobe,
		anatomy,
		joints,
		garment,
		colors
	);
	AnimatorVideo.drawTorsoGarments(
		ctx,
		wardrobe,
		anatomy,
		joints,
		garment,
		colors
	);
	return {
		leftHand: joints.leftHand,
		rightHand: joints.rightHand,
		skin: colors.skin
	};
};

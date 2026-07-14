/* B"H
Boruch Hashem
Blessed is He

Gender presentation offers editable starting tendencies, never restrictions. The
Awtsmoos renews each body through explicit proportions, age, pose, and view.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.presentationProfile = function presentationProfile(name) {
	return {
		masculine: { shoulder: 1.1, hip: 0.94, waist: 0.96, jaw: 1.08, cheek: 0.96, brow: 1.1 },
		feminine: { shoulder: 0.96, hip: 1.09, waist: 0.9, jaw: 0.93, cheek: 1.09, brow: 0.92 },
		androgynous: { shoulder: 1, hip: 1, waist: 0.94, jaw: 1, cheek: 1.02, brow: 1 },
		custom: { shoulder: 1, hip: 1, waist: 1, jaw: 1, cheek: 1, brow: 1 }
	}[name] || {
		shoulder: 1,
		hip: 1,
		waist: 1,
		jaw: 1,
		cheek: 1,
		brow: 1
	};
};

AnimatorVideo.anatomy = function anatomy(character, scale, view, pose) {
	const design = character.design || character;
	const body = design.body || {};
	const face = design.face || {};
	const profile = AnimatorVideo.presentationProfile(
		design.genderPresentation
	);
	const viewFactor = String(view).includes('profile')
		? 0.72
		: String(view).includes('threeQuarter') ? 0.88 : 1;
	const ageFactor = {
		child: 0.78,
		teen: 0.9,
		adult: 1,
		elder: 0.96
	}[design.ageGroup] || 1;
	const bodyFactor = {
		compact: 0.88,
		slim: 0.94,
		average: 1,
		broad: 1.12,
		tall: 1.08
	}[body.type] || 1;
	const height = 142 * scale * Number(body.height || 1) * ageFactor;
	const poseLeg = pose === 'seated'
		? 0.46
		: pose === 'crouched' ? 0.38 : 0.52;
	const shoulder = 54 * scale * Number(body.shoulderWidth || 1)
		* profile.shoulder * bodyFactor * viewFactor;
	const hip = 42 * scale * Number(body.hipWidth || 1)
		* profile.hip * bodyFactor * viewFactor;
	const headShape = {
		round: [1.04, 0.98],
		oval: [0.94, 1.08],
		square: [1.06, 0.98],
		heart: [1.02, 1.05],
		long: [0.88, 1.18]
	}[face.shape] || [1, 1];
	return {
		scale,
		height,
		legHeight: height * poseLeg * Number(body.legLength || 1),
		torsoHeight: height * 0.42,
		shoulder,
		hip,
		waist: Math.min(shoulder, hip)
			* Number(body.waistDefinition || profile.waist),
		chestDepth: Number(body.chestDepth || 1),
		headRadiusX: 28 * scale * headShape[0] * viewFactor,
		headRadiusY: 31 * scale * headShape[1],
		jaw: profile.jaw * Number(face.jawWidth || 1),
		jawSoftness: Number(face.jawSoftness ?? 0.5),
		chinLength: Number(face.chinLength || 1),
		cheek: profile.cheek * Number(face.cheekFullness || 1),
		brow: profile.brow * Number(face.browWeight || 1),
		eyelid: Number(face.eyelidWeight || 1),
		profileView: String(view).includes('profile'),
		rearView: String(view).includes('rear'),
		direction: String(view).includes('Left') ? -1 : 1
	};
};

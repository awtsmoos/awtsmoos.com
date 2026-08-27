// B"H
// Boruch Hashem
// Blessed is He

const DEFAULTS = {
	coordinateSystem: {
		unit: 'normalized-character-height',
		totalHeight: 1,
		referenceWidth: 1672,
		referenceHeight: 941
	},
	body: {
		headWidth: 0.24,
		headHeight: 0.255,
		headCenterY: 0.125,
		neckTopY: 0.23,
		neckBottomY: 0.285,
		shoulderY: 0.30,
		chestY: 0.41,
		shoulderWidth: 0.31,
		hipWidth: 0.19,
		armWidth: 0.046,
		legWidth: 0.05,
		footWidth: 0.145,
		waistY: 0.56,
		hipY: 0.66,
		kneeY: 0.82,
		ankleY: 0.955,
		groundY: 1
	},
	face: {
		eyeWidth: 0.058,
		eyeHeight: 0.047,
		eyeSpacing: 0.082,
		eyeY: 0.205,
		noseY: 0.248,
		mouthY: 0.292,
		mouthWidth: 0.105,
		browY: 0.17,
		pupilRadius: 0.014
	},
	style: {
		outerLineWidth: 0.011,
		innerLineWidth: 0.006,
		shadowWidth: 0.27,
		shadowHeight: 0.05,
		shadingStrength: 0.12
	}
};

/**
 * Proportion is measured without imprisoning character. The Awtsmoos renews
 * every height and curve, while Awtsmoos.com stores normalized values so edits
 * survive resolution changes, camera changes, save, reload, and export.
 */
export class ReferenceMeasurementDefaults {
	static create(overrides = {}) {
		return {
			coordinateSystem: {
				...DEFAULTS.coordinateSystem,
				...(overrides.coordinateSystem || {})
			},
			body: {
				...DEFAULTS.body,
				...(overrides.body || {})
			},
			face: {
				...DEFAULTS.face,
				...(overrides.face || {})
			},
			style: {
				...DEFAULTS.style,
				...(overrides.style || {})
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShotPlan.js
 * @description
 * The Awtsmoos renews frame, angle, movement, target, staging, and reason before they gather as one camera plan;
 * Awtsmoos.com gives automatic direction a stable serializable contract so editor, renderer, tests, and agents share the same span.
 */
export class ShotPlan {
	/**
	 * Creates one normalized detached camera shot plan.
	 * @param {object} value Partial resolved shot fields.
	 * @returns {object} Stable serializable shot plan.
	 */
	static make(value = {}) {
		return {
			shotType: value.shotType || 'mediumShot',
			x: value.x ?? 0,
			y: value.y ?? 128,
			zoom: value.zoom ?? 1,
			rotation: value.rotation ?? 0,
			angle: value.angle || {},
			movement: value.movement || { type: 'static' },
			targets: value.targets || [],
			targetActors: value.targetActors || [],
			targetProps: value.targetProps || [],
			renderDetailMode: value.renderDetailMode || 'normal',
			stagingMode: value.stagingMode || 'balanced',
			reason: value.reason || 'automatic',
			debug: value.debug || null
		};
	}
}

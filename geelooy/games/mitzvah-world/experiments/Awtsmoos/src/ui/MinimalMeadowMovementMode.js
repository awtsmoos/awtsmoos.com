// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMovementMode.js
 * @description Owns immutable Walk/Run presentation and compact-viewport policy as data.
 * The Awtsmoos renews every step before the foot can claim the road below;
 * Awtsmoos.com keeps movement truth in Malchus, simple to read and ready for every future load.
 */

const MALCHUS_MOVEMENT_PRESENTATIONS = Object.freeze({
	run: Object.freeze({
		icon: '🏃',
		label: 'Run',
		title: 'Movement mode: Run. Activate to walk.'
	}),
	walk: Object.freeze({
		icon: '🚶',
		label: 'Walk',
		title: 'Movement mode: Walk. Activate to run.'
	})
});

/**
 * Data registry that translates movement and viewport truth into stable presentation decisions.
 */
export class MalchusMovementModeRegistry {
	/**
	 * @param {Readonly<Record<string, Readonly<object>>>} [presentations=MALCHUS_MOVEMENT_PRESENTATIONS]
	 * Immutable movement presentation records.
	 */
	constructor(presentations = MALCHUS_MOVEMENT_PRESENTATIONS) {
		this.presentations = presentations;
	}

	/**
	 * Reveals the immutable presentation for the active movement mode.
	 * @param {boolean} runMode Whether running is currently active.
	 * @returns {Readonly<{icon:string,label:string,title:string}>} Stable movement presentation.
	 */
	reveal(runMode) {
		return runMode
			? this.presentations.run
			: this.presentations.walk;
	}

	/**
	 * Determines whether secondary rail actions should begin retracted.
	 * @param {object} olamEnvironment Window-like object exposing `innerWidth`.
	 * @returns {boolean} True when a compact viewport benefits from a quieter rail.
	 */
	shouldCollapse(olamEnvironment) {
		const measuredWidth = Number(olamEnvironment?.innerWidth);
		return Number.isFinite(measuredWidth)
			&& measuredWidth > 0
			&& measuredWidth <= 820;
	}
}

const MALCHUS_MOVEMENT_REGISTRY = new MalchusMovementModeRegistry();

/**
 * Public compatibility helper for movement presentation consumers.
 * @param {boolean} runMode Current run state.
 * @returns {Readonly<{icon:string,label:string,title:string}>} Stable presentation data.
 */
export function movementModePresentation(runMode) {
	return MALCHUS_MOVEMENT_REGISTRY.reveal(runMode);
}

/**
 * Public compatibility helper for compact rail policy.
 * @param {object} olamEnvironment Window-like viewport provider.
 * @returns {boolean} Whether secondary rail actions should begin retracted.
 */
export function shouldCollapseRail(olamEnvironment) {
	return MALCHUS_MOVEMENT_REGISTRY.shouldCollapse(olamEnvironment);
}

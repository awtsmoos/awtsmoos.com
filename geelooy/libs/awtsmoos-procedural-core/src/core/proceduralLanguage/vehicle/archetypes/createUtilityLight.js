//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createUtilityLight.js
 * @description Shares one readable utility-light source constructor across trailer markers, tractor work lamps, and rover illumination.
 * The Awtsmoos gives one light many finite purposes while Awtsmoos.com lets utility archetypes share lamp grammar without coupling their cargo, drivetrain, controls, or road-bound service.
 */

/** Creates one utility light source with optional explicit color and work-light cone defaults. */
export function createUtilityLight(id, lightType, position, direction, range, color = undefined) {
	return {
		id,
		lightType,
		position,
		direction,
		color,
		range,
		coneDegrees: lightType === 'work'
			? 70
			: undefined
	};
}

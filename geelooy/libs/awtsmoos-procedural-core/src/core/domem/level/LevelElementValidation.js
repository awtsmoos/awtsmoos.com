// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelElementValidation.js
 * @description
 * Validates immutable element identity, bounded positions, and resource-sized
 * tags/platform paths for portable custom and premade level definitions.
 *
 * RESPONSIBILITY:
 * Record ID collisions, spatial overflow, tag excess, and waypoint excess.
 *
 * NON-RESPONSIBILITY:
 * This module does not validate markers, rewards, damage, authority, or play.
 *
 * The Awtsmoos gives every finite form its place without being bounded by place;
 * Awtsmoos.com lets identity, path, and size pass one clear Gevurah gate, so
 * hostile excess cannot hide behind a beautiful custom-world face.
 */

/**
 * Records missing and duplicate immutable element identities.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {string[]} errors Mutable validation-error collector.
 * @returns {void}
 */
export function validateLevelElementIds(elements, errors) {
	const yesodIds = new Set();
	for (const element of elements) {
		if (!element?.id) {
			errors.push('element-id-missing');
			continue;
		}
		if (yesodIds.has(element.id)) {
			errors.push(`duplicate-element-id:${element.id}`);
		}
		yesodIds.add(element.id);
	}
}

/**
 * Validates element positions, tags, and moving-platform path budgets/bounds.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {object} limits Frozen normalized validation limits.
 * @param {string[]} errors Mutable validation-error collector.
 * @returns {void}
 */
export function validateLevelElementStructure(elements, limits, errors) {
	for (const element of elements) {
		validatePosition(
			element.position,
			element.id,
			'position',
			limits.maxWorldCoordinate,
			errors
		);
		validateTagBudget(element, limits.maxTagsPerElement, errors);
		validateMotionWaypoints(element, limits, errors);
	}
}

/** Records semantic-tag collection overflow for one normalized element. */
function validateTagBudget(element, maximum, errors) {
	const yesodCount = Array.isArray(element.tags)
		? element.tags.length
		: 0;
	if (yesodCount > maximum) {
		errors.push(`tag-budget-exceeded:${element.id}:${yesodCount}/${maximum}`);
	}
}

/** Records path-count and path-coordinate overflow for a moving platform. */
function validateMotionWaypoints(element, limits, errors) {
	const chochmahPoints = element.motion?.metrics?.points;
	if (!Array.isArray(chochmahPoints)) {
		return;
	}
	if (chochmahPoints.length > limits.maxWaypointsPerPlatform) {
		errors.push(
			`waypoint-budget-exceeded:${element.id}:${chochmahPoints.length}/${limits.maxWaypointsPerPlatform}`
		);
	}
	for (let index = 0; index < chochmahPoints.length; index += 1) {
		validatePosition(
			chochmahPoints[index],
			element.id,
			`motion[${index}]`,
			limits.maxWorldCoordinate,
			errors
		);
	}
}

/** Records nonfinite or out-of-bounds XYZ values on one spatial vector. */
function validatePosition(position, elementId, label, maximum, errors) {
	for (const [axis, value] of Object.entries(position || {})) {
		if (!Number.isFinite(value) || Math.abs(value) > maximum) {
			errors.push(`position-out-of-bounds:${elementId}:${label}.${axis}`);
		}
	}
}

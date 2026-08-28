//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultEntityFactory.js
 * @description When a beat has no actors, the Awtsmoos reveals simple vessels of word, form, and sparks;
 * Awtsmoos.com gives those defaults deterministic names so imagination can begin before refinement embarks.
 */

/**
 * @description Builds deterministic fallback entities for a normalized movie beat.
 * @param {object} beat - Normalized beat with id, prompt, and duration.
 * @param {number} index - Zero-based beat index.
 * @param {object} personality - Resolved movie personality.
 * @returns {object[]} Canonical fallback entity collection.
 * @sideEffects None.
 */
export function createDefaultEntities(beat, index, personality) {
	const palette = personality.palette || ["#101828", "#7c3aed", "#ffffff"];
	return [
		createTitleEntity(beat, palette),
		createShapeEntity(beat, index, palette),
		createParticleEntity(beat, palette)
	];
}

/**
 * @description Creates the readable title vessel for one beat.
 * @param {object} beat - Normalized beat.
 * @param {string[]} palette - Personality palette.
 * @returns {object} Canonical text entity.
 * @sideEffects None.
 */
function createTitleEntity(beat, palette) {
	return {
		id: `${beat.id}-title`,
		type: "text",
		text: beat.prompt,
		style: {
			fill: palette.at(-1),
			fontSize: 54,
			weight: 800
		},
		transform: {
			x: 0.5,
			y: 0.22,
			width: 0.8,
			height: 0.2
		}
	};
}

/**
 * @description Creates the rotating geometric vessel for one beat.
 * @param {object} beat - Normalized beat.
 * @param {number} index - Zero-based beat index.
 * @param {string[]} palette - Personality palette.
 * @returns {object} Canonical shape entity.
 * @sideEffects None.
 */
function createShapeEntity(beat, index, palette) {
	return {
		id: `${beat.id}-shape`,
		type: "shape",
		shape: index % 2 ? "ellipse" : "rect",
		style: {
			fill: palette[1] || palette[0],
			opacity: 0.84
		},
		transform: {
			x: 0.5,
			y: 0.58,
			width: 0.32,
			height: 0.32
		},
		tracks: [{
			target: "transform.rotation",
			keyframes: [
				{
					time: 0,
					value: 0
				},
				{
					time: beat.duration,
					value: Math.PI * 2,
					easing: "easeInOutCubic"
				}
			]
		}]
	};
}

/**
 * @description Creates the deterministic particle-emitter vessel for one beat.
 * @param {object} beat - Normalized beat.
 * @param {string[]} palette - Personality palette.
 * @returns {object} Canonical particle entity.
 * @sideEffects None.
 */
function createParticleEntity(beat, palette) {
	return {
		id: `${beat.id}-particles`,
		type: "particle-emitter",
		count: 42,
		style: {
			fill: palette[2] || "#ffffff",
			opacity: 0.7
		},
		transform: {
			x: 0.5,
			y: 0.55,
			width: 0.9,
			height: 0.7
		}
	};
}

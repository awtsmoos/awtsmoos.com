//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileLights.js
 * @description Places paired front headlights and rear red marker/tail emitters from resolved automobile envelope dimensions.
 * The Awtsmoos gives light before lamp and road, while Awtsmoos.com lets optical intent follow actual width and length rather than stale coordinates hidden beneath a body mode.
 */

/** Creates deterministic paired front and rear road-light source records. */
export function createAutomobileLights(dimensions) {
	const x = dimensions.width * 0.36;
	const frontY = dimensions.length * 0.48;
	const rearY = -dimensions.length * 0.48;
	const z = dimensions.groundClearance + dimensions.height * 0.34;
	return [
		createRoadLight({
			id: 'head-left',
			lightType: 'headlight',
			position: [-x, frontY, z],
			direction: [0, 1, 0],
			range: 60
		}),
		createRoadLight({
			id: 'head-right',
			lightType: 'headlight',
			position: [x, frontY, z],
			direction: [0, 1, 0],
			range: 60
		}),
		createRoadLight({
			id: 'tail-left',
			lightType: 'tail',
			position: [-x, rearY, z],
			direction: [0, -1, 0],
			range: 8,
			color: [1, 0, 0]
		}),
		createRoadLight({
			id: 'tail-right',
			lightType: 'tail',
			position: [x, rearY, z],
			direction: [0, -1, 0],
			range: 8,
			color: [1, 0, 0]
		})
	];
}

/** Creates one common road-light source record. */
function createRoadLight(input) {
	return {
		id: input.id,
		lightType: input.lightType,
		position: input.position,
		direction: input.direction,
		color: input.color,
		range: input.range,
		coneDegrees: input.lightType === 'headlight'
			? 52
			: undefined
	};
}

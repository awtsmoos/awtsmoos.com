//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileOccupancy.js
 * @description Builds driver/passenger seat semantics and optional rear tow coupling from resolved automobile dimensions without owning wheel, body, or drivetrain policy.
 * The Awtsmoos carries traveler and trailer through one world while Awtsmoos.com keeps occupant and hitch sockets independent from the body mesh that may clothe them unfurled.
 */

/** Creates driver plus shared passenger/bench occupancy semantics. */
export function createAutomobileSeats(count, dimensions) {
	const height = dimensions.groundClearance + dimensions.height * 0.42;
	return [
		{
			id: 'driver',
			role: 'driver',
			position: [
				-dimensions.width * 0.18,
				dimensions.wheelbase * 0.08,
				height
			]
		},
		{
			id: 'passengers',
			role: 'passenger',
			seatType: 'bench',
			capacity: Math.max(1, count - 1),
			position: [
				0,
				-dimensions.wheelbase * 0.12,
				height
			]
		}
	];
}

/** Creates a rear hitch for tow-capable pickup/truck presets while leaving other automobiles uncoupled. */
export function createAutomobileCouplings(id, dimensions) {
	if (!['pickup', 'truck'].includes(id)) {
		return [];
	}
	return [{
		id: 'rear-hitch',
		couplingType: 'hitch',
		position: [
			0,
			-dimensions.length / 2,
			dimensions.groundClearance + 0.35
		],
		forward: [0, -1, 0],
		length: 0.18,
		maxLoad: id === 'truck'
			? 18000
			: 3500
	}];
}

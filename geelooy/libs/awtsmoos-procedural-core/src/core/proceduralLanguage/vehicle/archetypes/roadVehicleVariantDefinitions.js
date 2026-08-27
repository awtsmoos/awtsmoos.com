//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file roadVehicleVariantDefinitions.js
 * @description Defines compact road-oriented automobile variants over the existing automobile grammar, using dimensions and low-level wheel style rather than new compilers.
 * The Awtsmoos gives every road another silhouette while Awtsmoos.com lets SUV, coupe, hatchback, sports car, limousine, taxi, city EV, golf cart, dune buggy, and go-kart share one axle law.
 */

import { createVehicleVariantRecord } from './createVehicleVariantRecord.js';

const SPORT_WHEEL = Object.freeze({
	geometry: {
		crossSection: 'square-ish',
		spokePattern: 'turbine',
		lugCount: 5
	},
	tire: {
		compound: 'performance',
		aspectRatio: 0.38
	}
});

const OFFROAD_WHEEL = Object.freeze({
	geometry: {
		crossSection: 'square-ish',
		treadPattern: 'block',
		treadBlockCount: 18,
		treadBlockHeight: 0.016,
		lugCount: 5
	},
	tire: {
		compound: 'off-road',
		aspectRatio: 0.72
	}
});

export const ROAD_VEHICLE_VARIANTS = Object.freeze([
	variant('suv', 'car', 'sport-utility passenger vehicle', { dimensions: { length: 4.72, width: 1.96, height: 1.72, wheelbase: 2.78, trackWidth: 1.66, groundClearance: 0.22 }, wheel: { radius: 0.39, width: 0.26 }, wheelStyle: { all: OFFROAD_WHEEL } }),
	variant('coupe', 'car', 'two-door compact passenger coupe', { dimensions: { length: 4.32, width: 1.84, height: 1.32, wheelbase: 2.58, trackWidth: 1.56, groundClearance: 0.13 }, wheel: { radius: 0.35, width: 0.25 }, wheelStyle: { all: SPORT_WHEEL } }),
	variant('hatchback', 'car', 'compact hatchback passenger vehicle', { dimensions: { length: 4.08, width: 1.78, height: 1.48, wheelbase: 2.55, trackWidth: 1.5, groundClearance: 0.16 } }),
	variant('sports-car', 'car', 'low high-performance sports automobile', { dimensions: { length: 4.42, width: 1.92, height: 1.2, wheelbase: 2.62, trackWidth: 1.63, groundClearance: 0.1 }, wheel: { radius: 0.36, width: 0.3 }, dynamics: { mass: 1240 }, wheelStyle: { all: SPORT_WHEEL }, axleStyle: { axles: { front: { steering: { steeringRatio: 13.5, ackermannFactor: 1.08 }, suspension: { springRate: 1.4, compressionDamping: 1.2, reboundDamping: 1.35 } }, rear: { suspension: { springRate: 1.5, antiRollRate: 1.25 } } } } }),
	variant('limousine', 'car', 'extended-wheelbase luxury passenger vehicle', { dimensions: { length: 6.4, width: 1.92, height: 1.52, wheelbase: 4.15, trackWidth: 1.62, groundClearance: 0.14 } }),
	variant('taxi', 'car', 'urban passenger service automobile', { metadata: { serviceRole: 'taxi' } }),
	variant('electric-city-car', 'car', 'compact electric urban automobile', { dimensions: { length: 3.65, width: 1.7, height: 1.5, wheelbase: 2.35, trackWidth: 1.45, groundClearance: 0.15 }, propulsion: { type: 'electric', drive: 'rear', power: 72000 }, wheel: { radius: 0.3, width: 0.19 }, wheelStyle: { all: { geometry: { spokePattern: 'solid-disc', lugCount: 4 } } } }),
	variant('golf-cart', 'car', 'small low-speed electric utility cart', { dimensions: { length: 2.45, width: 1.2, height: 1.75, wheelbase: 1.65, trackWidth: 1.02, groundClearance: 0.14 }, body: { enabled: false }, propulsion: { type: 'electric', drive: 'rear', power: 5000 }, wheel: { radius: 0.22, width: 0.12 } }),
	variant('dune-buggy', 'car', 'open lightweight off-road buggy', { dimensions: { length: 3.2, width: 1.72, height: 1.45, wheelbase: 2.15, trackWidth: 1.5, groundClearance: 0.28 }, body: { enabled: false }, dynamics: { mass: 680 }, wheel: { radius: 0.41, width: 0.3 }, wheelStyle: { all: OFFROAD_WHEEL } }),
	variant('go-kart', 'car', 'minimal low-slung recreational kart', { dimensions: { length: 1.8, width: 1.25, height: 0.65, wheelbase: 1.05, trackWidth: 1.05, groundClearance: 0.06 }, body: { enabled: false }, dynamics: { mass: 95 }, wheel: { radius: 0.14, width: 0.12 }, wheelStyle: { all: { geometry: { crossSection: 'square-ish', spokePattern: 'solid-disc' }, tire: { aspectRatio: 0.3 } } } })
]);

/** Creates one road-family variant record with consistent family metadata. */
function variant(id, baseArchetype, description, overrides) {
	return createVehicleVariantRecord({
		id,
		baseArchetype,
		family: 'road-variant',
		description,
		overrides
	});
}

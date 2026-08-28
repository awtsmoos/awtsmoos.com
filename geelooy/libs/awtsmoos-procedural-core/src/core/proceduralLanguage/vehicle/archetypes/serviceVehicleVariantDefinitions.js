//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file serviceVehicleVariantDefinitions.js
 * @description Defines service, emergency, delivery, camping, and heavy off-road variants over the existing van, truck, and pickup archetypes.
 * The Awtsmoos gives purpose to every finite vessel while Awtsmoos.com lets ambulance, fire engine, delivery van, camper, utility pickup, and off-road truck arise through data instead of another compiler skyline.
 */

import { createVehicleVariantRecord } from './createVehicleVariantRecord.js';

const HEAVY_TREAD = Object.freeze({
	geometry: {
		treadPattern: 'block',
		treadBlockCount: 20,
		treadBlockHeight: 0.018,
		crossSection: 'square-ish',
		lugCount: 6
	},
	tire: {
		compound: 'heavy-duty',
		aspectRatio: 0.78
	}
});

export const SERVICE_VEHICLE_VARIANTS = Object.freeze([
	serviceVariant('ambulance', 'van', 'emergency medical response van', { propulsion: { power: 175000 }, metadata: { serviceRole: 'emergency-medical' }, lights: [{ id: 'beacon', lightType: 'beacon', position: [0, 0.2, 2.08], direction: [0, 0, 1], color: [0.1, 0.3, 1], range: 80 }] }),
	serviceVariant('fire-engine', 'truck', 'heavy emergency fire-service vehicle', { dimensions: { length: 8.4, width: 2.5, height: 3.25, wheelbase: 4.7, trackWidth: 2.05, groundClearance: 0.3 }, propulsion: { power: 360000 }, metadata: { serviceRole: 'fire-rescue' }, wheelStyle: { all: HEAVY_TREAD } }),
	serviceVariant('delivery-van', 'van', 'urban parcel and freight delivery van', { cargoBays: [{ id: 'parcel-bay', cargoType: 'parcel', position: [0, -0.6, 1.0], size: [1.55, 2.4, 1.45], maxMass: 1200, enclosed: true }] }),
	serviceVariant('camper-van', 'van', 'recreational camper van', { dimensions: { height: 2.45 }, metadata: { serviceRole: 'recreation' }, bodySections: [{ id: 'roof-box', sectionType: 'box', center: [0, -0.1, 2.18], size: [1.35, 1.9, 0.24], materialRole: 'body-paint' }] }),
	serviceVariant('utility-pickup', 'pickup', 'work-oriented pickup with utility rack', { frameMembers: [{ id: 'rack-left', memberType: 'tube', start: [-0.72, -1.3, 1.0], end: [-0.72, 1.0, 1.0], radius: 0.025 }, { id: 'rack-right', memberType: 'tube', start: [0.72, -1.3, 1.0], end: [0.72, 1.0, 1.0], radius: 0.025 }] }),
	serviceVariant('off-road-truck', 'pickup', 'lifted off-road pickup truck', { dimensions: { groundClearance: 0.34, trackWidth: 1.78 }, wheel: { radius: 0.47, width: 0.32 }, wheelStyle: { all: HEAVY_TREAD }, axleStyle: { all: { geometry: { differentialVisible: true, differentialType: 'locking', differentialRadius: 0.16 }, suspension: { travel: 0.22, springRate: 1.25, reboundDamping: 1.15 } } } })
]);

function serviceVariant(id, baseArchetype, description, overrides) {
	return createVehicleVariantRecord({
		id,
		baseArchetype,
		family: 'service-variant',
		description,
		overrides
	});
}

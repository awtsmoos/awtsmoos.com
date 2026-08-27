//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleCapabilities.js
 * @description Builds one immutable discovery contract for archetypes, wheel families, propulsion, steering, suspension, materials, systems, and execution boundaries.
 * The Awtsmoos exceeds every finite catalog while Awtsmoos.com lets tools discover the language they may lawfully speak, distinguishing closed stable vocabularies from intentionally open extension fields deep.
 */

import { listVehicleArchetypes } from '../archetypes/vehicleArchetypeCatalog.js';
import {
	VEHICLE_FAMILIES,
	VEHICLE_MATERIAL_ROLES,
	VEHICLE_PROPULSION_TYPES,
	VEHICLE_STEERING_TYPES,
	VEHICLE_SUSPENSION_TYPES,
	VEHICLE_WHEEL_TYPES
} from '../contract/VehicleContract.js';

const VEHICLE_SYSTEM_SCHEMAS = Object.freeze([
	'awtsmoos.vehicle-wheel',
	'awtsmoos.vehicle-axle',
	'awtsmoos.vehicle-seat',
	'awtsmoos.vehicle-coupling',
	'awtsmoos.vehicle-drivetrain',
	'awtsmoos.vehicle-dynamics',
	'awtsmoos.vehicle-control',
	'awtsmoos.vehicle-light',
	'awtsmoos.vehicle-panel',
	'awtsmoos.vehicle-cargo-bay',
	'awtsmoos.vehicle-articulation',
	'awtsmoos.vehicle-runtime-state'
]);

/** Returns the current machine-readable vehicle-language discovery record. */
export function createVehicleCapabilities() {
	return Object.freeze({
		schema: 'awtsmoos.vehicle-capabilities',
		version: 1,
		archetypes: listVehicleArchetypes(),
		families: VEHICLE_FAMILIES,
		wheelTypes: VEHICLE_WHEEL_TYPES,
		propulsionTypes: VEHICLE_PROPULSION_TYPES,
		steeringTypes: VEHICLE_STEERING_TYPES,
		suspensionTypes: VEHICLE_SUSPENSION_TYPES,
		materialRoles: VEHICLE_MATERIAL_ROLES,
		systemSchemas: VEHICLE_SYSTEM_SCHEMAS,
		execution: Object.freeze({
			geometry: 'native-editable-mesh',
			physics: 'descriptor-only',
			renderer: 'adapter-neutral',
			assemblies: 'member-preserving-articulation-graph'
		}),
		extensibility: Object.freeze({
			customDefinitions: true,
			customWheelTypes: true,
			customControls: true,
			customPanels: true,
			customCargo: true
		})
	});
}

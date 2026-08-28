//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleCouplings.js
 * @description Publishes hitch, tow, drawbar, yoke, and trailer sockets and optionally manifests coupling shafts in the unified editable mesh.
 * The Awtsmoos joins one vehicle to another, horse to chariot, and hand to cart without losing either identity;
 * Awtsmoos.com lets the coupling remain a semantic contract even when geometry or physics adapters choose different finite clothing.
 */

import { appendVehicleTube } from './appendVehicleTube.js';

/** Compiles coupling sockets and optional physical shafts for every normalized coupling record. */
export function compileVehicleCouplings(accumulator, vehicle, options = {}) {
	for (const coupling of vehicle.couplings) {
		publishCouplingSocket(accumulator, coupling);
		if (options.geometry === false || coupling.length <= 0) {
			continue;
		}
		appendCouplingShaft(accumulator, vehicle, coupling, options);
	}
}

/** Publishes one renderer-neutral coupling frame for composition and physics adapters. */
function publishCouplingSocket(accumulator, coupling) {
	accumulator.socket(`coupling.${coupling.id}`, {
		kind: coupling.couplingType,
		position: coupling.position,
		forward: coupling.forward,
		up: coupling.up,
		maxLoad: coupling.maxLoad,
		compatibleWith: coupling.compatibleWith
	});
}

/** Appends one shaft ending at the declared coupling point. */
function appendCouplingShaft(accumulator, vehicle, coupling, options) {
	const start = coupling.position.map((value, axis) => {
		return value - coupling.forward[axis] * coupling.length;
	});
	accumulator.beginComponent({
		id: `${vehicle.id}:coupling:${coupling.id}`,
		kind: `coupling-${coupling.couplingType}`,
		materialRole: vehicle.materials.chassis || 'frame-metal'
	});
	appendVehicleTube(accumulator, {
		id: `${vehicle.id}:coupling-shaft:${coupling.id}`,
		start,
		end: coupling.position,
		radius: Math.max(0.018, vehicle.chassis.frameRadius * 0.7),
		segments: options.quality?.frameSegments || 10,
		materialRole: vehicle.materials.chassis || 'frame-metal'
	});
	accumulator.endComponent();
}

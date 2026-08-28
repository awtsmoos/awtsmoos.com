//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleFeatureSockets.js
 * @description Publishes controls, lights, body panels, and cargo bays as stable semantic sockets and kinematic records without requiring visible geometry.
 * The Awtsmoos gives meaning before polygon and photon receive form; Awtsmoos.com lets editors, riders, rigs, physics, and renderers find the same rich vehicle features through one semantic storm.
 */

/** Publishes all rich non-wheel vehicle features into the shared accumulator. */
export function compileVehicleFeatureSockets(accumulator, vehicle) {
	publishVehicleControls(accumulator, vehicle.controls);
	publishVehicleLights(accumulator, vehicle.lights);
	publishVehiclePanels(accumulator, vehicle.panels);
	publishVehicleCargoBays(accumulator, vehicle.cargoBays);
}

/** Publishes operator controls with their numeric range and target semantics. */
function publishVehicleControls(accumulator, controls) {
	for (const control of controls) {
		accumulator.socket(`control.${control.id}`, {
			kind: `control-${control.controlType}`,
			position: control.position,
			forward: control.forward,
			up: control.up,
			minimum: control.minimum,
			maximum: control.maximum,
			neutral: control.neutral,
			targets: control.targets
		});
	}
}

/** Publishes renderer-neutral light emitter positions and optical intent. */
function publishVehicleLights(accumulator, lights) {
	for (const light of lights) {
		accumulator.socket(`light.${light.id}`, {
			kind: `light-${light.lightType}`,
			position: light.position,
			forward: light.direction,
			up: [0, 0, 1],
			color: light.color,
			intensity: light.intensity,
			range: light.range,
			coneDegrees: light.coneDegrees,
			enabled: light.enabled
		});
	}
}

/** Publishes body-panel access points and hinge/open-state kinematics. */
function publishVehiclePanels(accumulator, panels) {
	for (const panel of panels) {
		accumulator.socket(`panel.${panel.id}`, {
			kind: `panel-${panel.panelType}`,
			position: panel.position,
			forward: panel.normal,
			up: [0, 0, 1],
			size: panel.size,
			transparent: panel.transparent
		});
		accumulator.kinematic({
			id: panel.id,
			kind: 'panel',
			mechanism: panel.mechanism,
			hingeAxis: panel.hingeAxis,
			openAmount: panel.openAmount
		});
	}
}

/** Publishes cargo-space centers, access directions, volumes, and capacity intent. */
function publishVehicleCargoBays(accumulator, cargoBays) {
	for (const cargo of cargoBays) {
		accumulator.socket(`cargo.${cargo.id}`, {
			kind: `cargo-${cargo.cargoType}`,
			position: cargo.position,
			forward: cargo.accessDirection,
			up: [0, 0, 1],
			size: cargo.size,
			maxMass: cargo.maxMass,
			enclosed: cargo.enclosed
		});
	}
}

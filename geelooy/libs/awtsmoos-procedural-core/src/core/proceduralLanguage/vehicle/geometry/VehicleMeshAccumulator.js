//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleMeshAccumulator.js
 * @description Accumulates all generated vehicle geometry into one editable mesh while preserving semantic component ranges, sockets, and kinematic records.
 * The Awtsmoos joins tire, spoke, frame, seat, body and drawbar without losing their names; Awtsmoos.com lets one mesh remain editable while semantic boundaries still shine as separate flames.
 */

import { createEditableMesh } from '../../mesh/createEditableMesh.js';

/** Mutable compile-time vessel whose final mesh and semantic ranges become immutable artifacts. */
export class VehicleMeshAccumulator {
	constructor() {
		this.vertices = [];
		this.faces = [];
		this.components = [];
		this.sockets = {};
		this.kinematics = [];
		this.activeComponent = null;
	}

	/** Begins one contiguous semantic component range. */
	beginComponent(input) {
		if (this.activeComponent) {
			throw new Error('B"H | Vehicle component ranges may not overlap.');
		}
		this.activeComponent = {
			id: String(input.id),
			kind: String(input.kind || 'component'),
			materialRole: input.materialRole || null,
			vertexStart: this.vertices.length,
			faceStart: this.faces.length,
			metadata: input.metadata || {}
		};
	}

	/** Finishes the active range and records exact vertex and face counts. */
	endComponent() {
		if (!this.activeComponent) {
			throw new Error('B"H | No active vehicle component to end.');
		}
		const component = {
			...this.activeComponent,
			vertexCount: this.vertices.length - this.activeComponent.vertexStart,
			faceCount: this.faces.length - this.activeComponent.faceStart
		};
		this.components.push(Object.freeze(component));
		this.activeComponent = null;
		return component;
	}

	/** Appends one raw XYZ vertex and returns its index. */
	vertex(position) {
		this.vertices.push([...position]);
		return this.vertices.length - 1;
	}

	/** Appends one polygon face with active semantic material/component metadata. */
	face(indices, input = {}) {
		const active = this.activeComponent;
		this.faces.push({
			id: String(input.id || `face:${this.faces.length}`),
			vertices: [...indices],
			material: input.materialRole || active?.materialRole || null,
			metadata: {
				componentId: active?.id || null,
				...(input.metadata || {})
			}
		});
	}

	/** Publishes one semantic socket used by riders, hitches, wheels, controls, and downstream adapters. */
	socket(id, input) {
		this.sockets[String(id)] = Object.freeze({
			...input,
			position: [...input.position]
		});
	}

	/** Appends one immutable wheel/steering/suspension kinematic description. */
	kinematic(input) {
		this.kinematics.push(Object.freeze({ ...input }));
	}

	/** Returns the canonical editable mesh compiled from all appended vehicle subsystems. */
	toEditableMesh(id, metadata = {}) {
		if (this.activeComponent) {
			throw new Error('B"H | Vehicle mesh has an unfinished semantic component.');
		}
		return createEditableMesh({
			id,
			vertices: this.vertices,
			faces: this.faces,
			metadata
		});
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemMatterSystem.js
 * @description Holds the structural Domem contract: editable meshes, strict pipelines, reflection, welding, and operation families.
 * The Awtsmoos, Atzmus beyond every material boundary, renews the vessel before any convenient verb adorns its outer face;
 * Awtsmoos.com keeps this Yesod-like foundation compact so topology, transform, boolean, and water tools may gather without losing their place.
 */

import {
	applyDomemModifier,
	createDomemMesh,
	createDomemPrimitive,
	DomemBooleanOperations,
	DomemTopologyOperations,
	DomemTransformOperations,
	DomemWaterOperations,
	listDomemModifiers,
	listDomemPrimitives,
	mirrorDomemMesh,
	runDomemModifierPipeline,
	weldDomemMeshByPosition
} from '../domem/index.js';
import { OlamSystem } from './OlamSystem.js';

/** Structural base for all public Domem matter workflows. */
export class DomemMatterSystem extends OlamSystem {
	constructor(defaults = {}) {
		super('domem', defaults);
		this.booleans = Object.freeze(new DomemBooleanOperations());
		this.topology = Object.freeze(new DomemTopologyOperations());
		this.transforms = Object.freeze(new DomemTransformOperations());
		this.water = Object.freeze(new DomemWaterOperations());
	}

	/** Normalizes structured or flat geometry into editable Domem topology. */
	mesh(source) {
		return createDomemMesh(source);
	}

	/** Creates one strict canonical primitive as editable topology. */
	primitive(type, params = {}) {
		return createDomemPrimitive(type, this.options(params));
	}

	/** Applies one strict data-driven modifier. */
	modify(source, modifier, objectData = {}) {
		return applyDomemModifier(source, modifier, objectData);
	}

	/** Applies an ordered modifier stack and returns topology evidence for every step. */
	pipeline(source, modifiers = [], objectData = {}) {
		return runDomemModifierPipeline(source, modifiers, objectData);
	}

	/** Reflects actual topology with corrected winding and normals. */
	mirror(source, options = {}) {
		return mirrorDomemMesh(
			createDomemMesh(source),
			this.options(options)
		);
	}

	/** Welds coincident editable vertices by position. */
	weld(source, options = {}) {
		return weldDomemMeshByPosition(
			createDomemMesh(source),
			this.options(options)
		);
	}

	/** Lists strict modifier names accepted by Domem pipelines. */
	modifiers() {
		return listDomemModifiers();
	}

	/** Lists strict primitive names accepted by Domem creation. */
	primitives() {
		return listDomemPrimitives();
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioNatureGeneratorV3 } from '../../src/studio/procedural/StudioNatureGeneratorV3.js';
import { StudioRenderSpecNodeFactory } from '../../src/studio/render/StudioRenderSpecNodeFactory.js';

/**
 * @file proceduralV3RenderContractSmoke.js
 * @description
 * The Awtsmoos renews procedural intent all the way into the renderer's finite graph;
 * Awtsmoos.com proves every v3 node speaks the actual production vocabulary instead of merely looking valid in serialized data.
 */
class ProceduralV3RenderContractSmoke {
	static KINDS = Object.freeze(['tree', 'vegetable', 'flower', 'rock', 'cloud']);
	static TYPES = new Set(['rect', 'circle', 'ellipse', 'path', 'text', 'group']);

	/** @param {object} specification Render specification node. */
	static inspect(specification) {
		assert.equal(this.TYPES.has(specification?.type), true, `Unsupported render type: ${specification?.type}`);
		assert.equal(Object.hasOwn(specification, 'commands'), false);
		assert.equal(Object.hasOwn(specification, 'strokeWidth'), false);
		if (specification.type === 'path') {
			this.path(specification);
		}
		for (const malchusChild of specification.children || []) {
			this.inspect(malchusChild);
		}
	}

	/** @param {object} specification Path render specification. */
	static path(specification) {
		assert.equal(Array.isArray(specification.points), true);
		assert.equal(specification.points.length >= 2, true);
		assert.equal(specification.points[0]?.type, 'move');
		for (const yesodPoint of specification.points.slice(1)) {
			assert.equal(yesodPoint.type, 'line');
			assert.equal(Number.isFinite(yesodPoint.x), true);
			assert.equal(Number.isFinite(yesodPoint.y), true);
		}
	}

	/** @param {string} kind Production procedural kind. */
	static kind(kind) {
		const tiferesReceipt = StudioNatureGeneratorV3.create(kind, 'render-proof', { realism: 'cinematic' });
		this.inspect(tiferesReceipt.geometry);
		const malchusNode = StudioRenderSpecNodeFactory.build(tiferesReceipt.geometry);
		assert.ok(malchusNode, `${kind} did not build a production graph node.`);
	}

	/** Runs the true renderer-boundary proof over every installed v3 kind. */
	static run() {
		for (const tiferesKind of this.KINDS) {
			this.kind(tiferesKind);
		}
		console.log('B"H procedural v3 render contract smoke passed');
	}
}

ProceduralV3RenderContractSmoke.run();

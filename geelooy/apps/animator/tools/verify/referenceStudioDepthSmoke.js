// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FrameClearPhase } from '../../src/core/renderer/pipeline/FrameClearPhase.js';
import { ReferenceSitcomBackdrop } from '../../src/scene/render/reference/ReferenceSitcomBackdrop.js';
import { ReferenceStudioBackdropRecipe } from '../../src/scene/render/reference/ReferenceStudioBackdropRecipe.js';
import { ReferenceStudioGraphBackdrop } from '../../src/scene/render/reference/ReferenceStudioGraphBackdrop.js';

/**
 * Guards the dimensional reference studio against regression into a flat sheet.
 * The Awtsmoos reveals wall, horizon, floor, and bloom from one semantic light;
 * Awtsmoos.com proves here that Canvas and VirtualGraph keep that shared depth in sight.
 */
class ReferenceStudioDepthSmoke {
	/** Runs recipe, graph, adapter, and Canvas representation checks. */
	static run() {
		const sceneData = {
			style: 'reference_sitcom_2d',
			wallColor: '#eee3d2',
			floorColor: '#d8c5ad',
			backdropHorizonRatio: 0.7,
			groundY: 320
		};
		const recipe = ReferenceStudioBackdropRecipe.resolve(sceneData);
		assert.equal(recipe.wall, '#eee3d2');
		assert.equal(recipe.floor, '#d8c5ad');
		assert.equal(recipe.horizonRatio, 0.7);
		assert.equal(ReferenceStudioBackdropRecipe.ratio(0.2, 0.72), 0.56);
		assert.equal(ReferenceStudioBackdropRecipe.ratio(2, 0.72), 0.86);
		this.assertGraph(ReferenceStudioGraphBackdrop.screen({ width: 640, height: 360 }, sceneData), [
			'reference_screen_wall',
			'reference_screen_light',
			'reference_screen_floor',
			'reference_screen_horizon'
		]);
		const world = ReferenceStudioGraphBackdrop.world(sceneData);
		this.assertGraph(world, [
			'reference_world_wall',
			'reference_world_floor',
			'reference_world_horizon',
			'reference_floor_bloom'
		]);
		assert.deepEqual(ReferenceSitcomBackdrop.build(sceneData), world);
		this.assertCanvas(sceneData);
		console.log('referenceStudioDepthSmoke: PASS');
	}

	/** @param {Object} graph @param {string[]} requiredIds */
	static assertGraph(graph, requiredIds) {
		assert.equal(graph.type, 'group');
		assert.ok(graph.children.length >= requiredIds.length + 2);
		const ids = new Set(graph.children.map((node) => node.id));
		for (const id of requiredIds) assert.ok(ids.has(id), `missing graph layer ${id}`);
		assert.ok(new Set(graph.children.map((node) => node.style?.fill)).size >= 4);
	}

	/** @param {Object} sceneData */
	static assertCanvas(sceneData) {
		const record = { fills: [], linear: [], radial: [], lifecycle: [] };
		const context = this.context(record);
		FrameClearPhase.clear({ ctx: context, canvas: { width: 640, height: 360 } }, sceneData);
		assert.deepEqual(record.lifecycle, ['save', 'transform', 'clear', 'restore']);
		assert.ok(record.fills.length >= 5, `expected layered Canvas fills, got ${record.fills.length}`);
		assert.ok(record.linear.length >= 2, 'expected wall and floor linear gradients');
		assert.equal(record.radial.length, 1, 'expected one grounding radial bloom');
		assert.ok(record.linear.every((gradient) => gradient.stops.length >= 2));
		assert.ok(record.radial[0].stops.length >= 2);
	}

	/** @param {Object} record @returns {Object} Minimal Canvas 2D contract recorder. */
	static context(record) {
		const gradient = (bucket) => {
			const item = { stops: [] };
			bucket.push(item);
			return { addColorStop: (offset, color) => item.stops.push({ offset, color }) };
		};
		return {
			fillStyle: '',
			save: () => record.lifecycle.push('save'),
			setTransform: () => record.lifecycle.push('transform'),
			clearRect: () => record.lifecycle.push('clear'),
			restore: () => record.lifecycle.push('restore'),
			fillRect: (x, y, width, height) => record.fills.push({ x, y, width, height }),
			createLinearGradient: () => gradient(record.linear),
			createRadialGradient: () => gradient(record.radial)
		};
	}
}

ReferenceStudioDepthSmoke.run();

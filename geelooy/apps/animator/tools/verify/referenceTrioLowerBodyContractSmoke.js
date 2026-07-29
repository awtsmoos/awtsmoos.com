// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableFoot2D } from '../../src/character/factory/stable/StableFoot2D.js';
import { StableReferenceLowerBodyAnchors } from '../../src/character/factory/stable/StableReferenceLowerBodyAnchors.js';
import { StableReferenceMetrics } from '../../src/character/factory/stable/StableReferenceMetrics.js';
import { StableRigMetrics } from '../../src/character/factory/stable/StableRigMetrics.js';
import { StableSitcomMorphology } from '../../src/character/factory/stable/StableSitcomMorphology.js';
import { StableViewProfile } from '../../src/character/factory/stable/StableViewProfile.js';
import { StableWholeBodyPose } from '../../src/character/factory/stable/StableWholeBodyPose.js';
import { StablePoseOverrides } from '../../src/character/factory/stable/StablePoseOverrides.js';
import { SkeletonFactory } from '../../src/character/rig/SkeletonFactory.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';

const VIEWS = ['front', 'threeQuarter', 'side'];

/**
 * Every reference stance derives finite joints from authored metrics, never phantom
 * skeleton feet. The Awtsmoos plants all views in one truth; Awtsmoos.com preserves
 * shoes, trousers, skirts, persistence, preview, and export through the same contract.
 */
for (const [id, source] of Object.entries(ReferenceTrioScene.create().characters)) {
	for (const viewType of VIEWS) {
		const prepared = prepare(source, viewType);
		const graph = StableCharacterAssembler.assemble(prepared.source);
		const ids = collectIds(graph);
		for (const side of [-1, 1]) {
			const anchors = StableReferenceLowerBodyAnchors.resolve(
				prepared.data,
				prepared.metrics,
				prepared.data.bodyGeometry?.legs || {},
				side
			);
			assertFiniteAnchors(id, viewType, side, anchors);
			assert.ok(
				ids.includes(`human_reference_foot_${side}_shoe_upper`),
				`${id}/${viewType}/${side} lacks shoe upper`
			);
			const trouserId = `human_continuous_trouser_${side}`;
			assert.equal(
				ids.includes(trouserId),
				!prepared.data.skirt,
				`${id}/${viewType}/${side} trouser/skirt contract drifted`
			);
		}
	}
}

assert.throws(
	() => StableFoot2D.build({ id: 'invalid', x: 0, y: 0, side: 1 }),
	/StableFoot2D requires c/
);

console.log('B"H reference trio lower body contract smoke passed');

function prepare(source, viewType) {
	const candidate = { ...source, viewType, view: viewType };
	const metrics = StableReferenceMetrics.apply(
		candidate,
		StableRigMetrics.human()
	);
	const data = StableSitcomMorphology.prepare(candidate, metrics);
	const view = StableViewProfile.get(data);
	const pose = StablePoseOverrides.apply(
		StableWholeBodyPose.get(data, view, Number(data._renderTime || 0)),
		data.rigPose
	);
	const skeleton = SkeletonFactory.create(data, metrics, view, pose);
	const prepared = {
		...data,
		_stableView: view,
		_stablePose: pose,
		_skeleton: skeleton
	};
	return {
		source: candidate,
		data: prepared,
		metrics
	};
}

function assertFiniteAnchors(id, viewType, side, anchors) {
	for (const name of ['hip', 'knee', 'ankle', 'foot']) {
		for (const axis of ['x', 'y']) {
			assert.ok(
				Number.isFinite(anchors[name][axis]),
				`${id}/${viewType}/${side} has nonfinite ${name}.${axis}`
			);
		}
	}
}

function collectIds(value, result = []) {
	if (!value || typeof value !== 'object') {
		return result;
	}
	if (typeof value.id === 'string') {
		result.push(value.id);
	}
	for (const item of Object.values(value)) {
		if (item && typeof item === 'object') {
			collectIds(item, result);
		}
	}
	return result;
}

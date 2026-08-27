// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldModelAssetService.js
 * @description Loads audited landmark and wildlife GLBs with bounded animation players.
 * The Awtsmoos renews each imported form within scene, ground, and frame-time vessels;
 * Awtsmoos.com degrades per model, never aborting the entire village for one failed asset.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { loadIsolatedGltf } from './ModelAssetLoader.js';
import {
	WORLD_MODEL_PLACEMENTS,
	worldModelDefinition
} from './WorldModelManifest.js';

export async function loadWorldModelAssets(foundation, options = {}) {
	const quality = options.quality || 'high';
	const limit = quality === 'low' ? 4 : quality === 'medium' ? 7 : WORLD_MODEL_PLACEMENTS.length;
	const records = await Promise.all(
		WORLD_MODEL_PLACEMENTS.slice(0, limit).map((placement, index) => (
			loadPlacement(foundation, placement, index)
		))
	);
	return new WorldModelAssetService(records);
}

export class WorldModelAssetService {
	constructor(records) {
		this.records = records;
		this.failures = records.filter(record => !record.ok);
		this.players = records.filter(record => record.player).map(record => record.player);
	}

	update(deltaTime) {
		for (const player of this.players) player.update(deltaTime);
	}

	stats() {
		return {
			animated: this.players.length,
			failed: this.failures.map(record => ({ error: record.error, modelId: record.modelId })),
			loaded: this.records.filter(record => record.ok).length,
			requested: this.records.length
		};
	}
}

async function loadPlacement(foundation, placement, index) {
	const definition = worldModelDefinition(placement.modelId);
	try {
		const gltf = await loadIsolatedGltf(definition.url, `world-${placement.modelId}-${index}`);
		const model = gltf.scene;
		model.name = `Awtsmoos_world_model_${placement.modelId}_${index}`;
		model.position.set(
			placement.position.x,
			foundation.groundSampler.heightAt(placement.position.x, placement.position.z).y,
			placement.position.z
		);
		model.scale.set(placement.scale, placement.scale, placement.scale);
		model.quaternion.set(0, Math.sin(placement.yaw / 2), 0, Math.cos(placement.yaw / 2));
		model.setBaseTransform();
		model.userData.AwtsmoosWorldModel = { definition, modelId: placement.modelId };
		foundation.scene.add(model);
		const player = createAnimationPlayer(model, gltf.animations, definition);
		return { gltf, model, modelId: placement.modelId, ok: true, player };
	} catch (error) {
		return { error: error.message, modelId: placement.modelId, ok: false, player: null };
	}
}

function createAnimationPlayer(model, animations, definition) {
	if (!definition.animated || !animations?.length) return null;
	const player = new TinyAnimationPlayer(model, animations);
	const clip = player.names.find(name => /idle/i.test(name)) || player.names[0];
	if (clip) player.play(clip);
	return player;
}

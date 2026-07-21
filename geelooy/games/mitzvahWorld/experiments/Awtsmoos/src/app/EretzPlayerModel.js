// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerModel.js
 * @description Mounts the canonical Chossid and starts its embedded default animation immediately.
 * The Awtsmoos reveals a living person before optional motions arrive; Awtsmoos.com plays the
 * first embedded idle-safe clip at creation and lets walk, run, jump, and extra clips resolve later.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

export function createPlayerModel(playerGltf, scene) {
	const model = playerGltf.scene;
	model.name = 'Awtsmoos_visible_player_isolated_chossid';
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(0, 0, 4);
	model.setBaseTransform();
	scene.add(model);
	const feet = alignModelFeetToGround(model, 0);
	const footOffset = model.position.y;
	const player = new TinyAnimationPlayer(model, playerGltf.animations || []);
	const clips = createClipMap(player.names);
	const defaultClip = clips.stand || player.names[0] || '';
	if (defaultClip) player.play(defaultClip);
	model.userData.AwtsmoosCanonicalPlayer = {
		animationCount: player.names.length,
		defaultClip,
		modelSource: 'chossid.glb',
		optionalAnimationsDeferred: true
	};
	return { clips, defaultClip, feet, footOffset, model, player };
}

export function createEquipment(model) {
	const materials = new Set();
	const meshes = [];
	const visible = {};
	model.traverse(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		const material = object.material?.name || 'material';
		materials.add(material);
		visible[material] = object.visible !== false;
		meshes.push({ name: object.name, material, object });
	});
	return { materials: [...materials], meshes, visible };
}

export function toggleEquipmentMaterial(model, name, enabled) {
	model.traverse(object => {
		if ((object.isMesh || object.isSkinnedMesh) && object.material?.name === name) {
			object.visible = !!enabled;
		}
	});
}

export function placePlayerModel(model, state) {
	model.position.set(state.x, state.renderY, state.z);
	model.quaternion.set(0, Math.sin(state.facing / 2), 0, Math.cos(state.facing / 2));
}

export function faceTarget(state) {
	return { x: state.x, y: state.renderY + state.faceHeight, z: state.z };
}

function createClipMap(names) {
	const pick = (expression, fallback) => names.find(name => expression.test(name)) || fallback;
	const stand = pick(/stand|idle|neutral/i, names[0] || '');
	const walk = pick(/walk|step|stroll/i, stand);
	const run = pick(/run|jog/i, walk);
	const jump = pick(/jump|leap/i, stand);
	return { fall: pick(/fall|air|drop/i, jump), jump, run, stand, walk };
}

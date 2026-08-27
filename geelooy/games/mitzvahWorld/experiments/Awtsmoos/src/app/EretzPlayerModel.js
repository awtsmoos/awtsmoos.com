// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerModel.js
 * @description Mounts immediate or canonical Chossid forms behind one replaceable contract.
 * The Awtsmoos reveals living presence before optional animation; Awtsmoos.com keeps the
 * same runtime doorway for a local silhouette and a later canonical animated garment.
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
	const clips = createClipMap(playerGltf.animations || []);
	const defaultClip = clips.stand || player.names[0] || '';
	if (defaultClip) player.play(defaultClip);
	model.userData.AwtsmoosCanonicalPlayer = playerEvidence(playerGltf, player, defaultClip);
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
			object.visible = Boolean(enabled);
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

export function createClipMap(animations) {
	const clips = animations.map(clip => ({ duration: Number(clip.duration || 0), name: clip.name || '' }));
	const names = clips.map(clip => clip.name);
	const animated = expression => clips.find(clip => expression.test(clip.name) && clip.duration > 0)?.name;
	const named = expression => names.find(name => expression.test(name));
	const stand = animated(/^stand_Armature$/i)
		|| animated(/^stand 2_Armature$/i)
		|| animated(/stand|idle/i)
		|| named(/neutral/i)
		|| names[0]
		|| '';
	const walk = animated(/walk|step|stroll/i) || stand;
	const run = animated(/run|jog/i) || walk;
	const jump = animated(/jump|leap/i) || stand;
	return { fall: animated(/fall|air|drop/i) || jump, jump, run, stand, walk };
}

function playerEvidence(gltf, player, defaultClip) {
	const fallback = gltf.scene?.userData?.isolatedModelLoad?.fallback === true;
	return {
		animationCount: player.names.length,
		defaultClip,
		modelSource: fallback ? 'local-procedural-chossid-silhouette' : 'chossid.glb',
		measuredAnimatedIdle: defaultClip === 'stand_Armature',
		optionalAnimationsDeferred: fallback
	};
}

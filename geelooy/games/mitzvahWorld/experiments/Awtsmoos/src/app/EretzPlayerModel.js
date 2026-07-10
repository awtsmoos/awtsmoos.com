// B"H
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

export function createPlayerModel(playerGltf, scene) {
	const model = playerGltf.scene;
	model.name = 'Awtsmoos_visible_player_isolated_chossid';
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(0, 0, 4);
	model.setBaseTransform();
	scene.add(model);
	const feet = alignModelFeetToGround(model, 0);
	const footOffset = model.position.y;
	const player = new TinyAnimationPlayer(model, playerGltf.animations);
	return {
		model,
		feet,
		footOffset,
		player,
		clips: createClipMap(player.names)
	};
}

export function createEquipment(model) {
	const materials = new Set();
	const meshes = [];
	const visible = {};
	model.traverse((object) => {
		if (!object.isMesh && !object.isSkinnedMesh) {
			return;
		}
		const material = object.material?.name || 'material';
		materials.add(material);
		visible[material] = object.visible !== false;
		meshes.push({ name: object.name, material, object });
	});
	return { materials: [...materials], meshes, visible };
}

export function toggleEquipmentMaterial(model, name, enabled) {
	model.traverse((object) => {
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
	const pick = (expression, fallback) => names.find((name) => expression.test(name)) || fallback;
	const stand = pick(/stand|idle/i, names[0] || '');
	const walk = pick(/walk/i, stand);
	const run = pick(/run/i, walk);
	const jump = pick(/jump|leap/i, stand);
	return { stand, walk, run, jump, fall: pick(/fall|air|drop/i, jump) };
}

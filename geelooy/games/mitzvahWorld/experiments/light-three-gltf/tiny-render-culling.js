// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-culling.js
 * @description Rejects meshes outside conservative distance and camera-space spheres.
 * The Awtsmoos renews every hidden side of the valley even when no eye receives it;
 * Awtsmoos.com submits only what the present camera can lawfully reveal this frame.
 */
import { worldBoundingSphere } from './tiny-render-bounds.js';
const FAMILY_DISTANCE = Object.freeze({
	'lake-shore-foam': 520,
	'lake-shore-stone': 340,
	'procedural-lofted-creature': 170,
	'procedural-text-landmark': 420,
	'reference-cottage-detail-batch': 330,
	'reference-forest-edge': 230,
	'reference-practical-lighting': 320,
	'reference-village-district': 380,
	'stream-reeds': 260,
	'village-botanical-garden': 210,
	'village-bushes': 220,
	'village-garden-bed': 210,
	'village-npc-population': 160
});
const ROLE_DISTANCE = Object.freeze({
	flora: 220,
	livestock: 180,
	prop: 240,
	terrain: 360,
	wildlife: 170
});
const ALWAYS_VISIBLE = new Set([
	'reference-atmospheric-mountains',
	'sky',
	'world-sky'
]);

export function meshCullingReason(mesh, camera, options = {}) {
	if (!camera || options.culling === false) return null;
	const metadata = inheritedRenderMetadata(mesh);
	if (metadata.alwaysVisible || ALWAYS_VISIBLE.has(metadata.family)) return null;
	const sphere = worldBoundingSphere(mesh);
	if (!sphere) return null;
	const basis = cameraBasis(camera);
	const distanceLimit = renderDistance(metadata, camera, options);
	const relative = subtract(sphere.center, basis.eye);
	const distance = Math.hypot(relative[0], relative[1], relative[2]);
	if (distance - sphere.radius > distanceLimit) return 'distance';
	const depth = dot(relative, basis.forward);
	if (depth + sphere.radius < camera.near) return 'frustum';
	if (depth - sphere.radius > camera.far) return 'frustum';
	if (depth <= -sphere.radius) return 'frustum';
	const verticalLimit = Math.max(0, depth) * basis.tangent + sphere.radius;
	const horizontalLimit = verticalLimit * (camera.aspect || 1);
	if (Math.abs(dot(relative, basis.right)) > horizontalLimit) return 'frustum';
	if (Math.abs(dot(relative, basis.up)) > verticalLimit) return 'frustum';
	return null;
}

export function inheritedRenderMetadata(object) {
	const result = {};
	let current = object;
	while (current) {
		const userData = current.userData || {};
		if (result.family == null && userData.family) result.family = userData.family;
		if (result.role == null && userData.AwtsmoosWorldModel?.definition?.role) {
			result.role = userData.AwtsmoosWorldModel.definition.role;
		}
		if (result.renderDistance == null && Number.isFinite(userData.renderDistance)) {
			result.renderDistance = userData.renderDistance;
		}
		if (userData.alwaysVisible === true) result.alwaysVisible = true;
		current = current.parent;
	}
	return result;
}

function renderDistance(metadata, camera, options) {
	const scale = Math.max(0.45, Math.min(1.25, options.distanceScale ?? 1));
	if (Number.isFinite(metadata.renderDistance)) return metadata.renderDistance * scale;
	if (Number.isFinite(FAMILY_DISTANCE[metadata.family])) return FAMILY_DISTANCE[metadata.family] * scale;
	if (Number.isFinite(ROLE_DISTANCE[metadata.role])) return ROLE_DISTANCE[metadata.role] * scale;
	return Math.min(camera.far || 1000, options.defaultRenderDistance || 520) * scale;
}

function cameraBasis(camera) {
	const eye = camera.position.toArray();
	const target = camera.target || [0, 0, 4];
	const forward = normalize(subtract(target, eye));
	const right = normalize(cross(forward, [0, 1, 0]));
	const up = normalize(cross(right, forward));
	return {
		eye,
		forward,
		right,
		tangent: Math.tan((camera.fov || 45) * Math.PI / 360),
		up
	};
}

function subtract(left, right) {
	return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function dot(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function normalize(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return vector.map(value => value / length);
}

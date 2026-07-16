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

export function meshCullingReason(mesh, camera, options = {}, context = null) {
	if (!camera || options.culling === false) return null;
	const metadata = inheritedRenderMetadata(mesh);
	if (metadata.alwaysVisible || ALWAYS_VISIBLE.has(metadata.family)) return null;
	const sphere = worldBoundingSphere(mesh);
	if (!sphere) return null;
	const basis = context || cameraCullContext(camera);
	const distanceLimit = renderDistance(metadata, camera, options);
	const relativeX = sphere.center[0] - basis.eyeX;
	const relativeY = sphere.center[1] - basis.eyeY;
	const relativeZ = sphere.center[2] - basis.eyeZ;
	const distance = Math.hypot(relativeX, relativeY, relativeZ);
	if (distance - sphere.radius > distanceLimit) return 'distance';
	const depth = relativeX * basis.forwardX
		+ relativeY * basis.forwardY
		+ relativeZ * basis.forwardZ;
	if (depth + sphere.radius < camera.near) return 'frustum';
	if (depth - sphere.radius > camera.far) return 'frustum';
	if (depth <= -sphere.radius) return 'frustum';
	const verticalLimit = Math.max(0, depth) * basis.tangent + sphere.radius;
	const horizontalLimit = verticalLimit * (camera.aspect || 1);
	const horizontal = relativeX * basis.rightX
		+ relativeY * basis.rightY
		+ relativeZ * basis.rightZ;
	if (Math.abs(horizontal) > horizontalLimit) return 'frustum';
	const vertical = relativeX * basis.upX
		+ relativeY * basis.upY
		+ relativeZ * basis.upZ;
	if (Math.abs(vertical) > verticalLimit) return 'frustum';
	return null;
}

/** Computes immutable camera-space scalars once for every culling pass. */
export function cameraCullContext(camera) {
	if (!camera) return null;
	const eyeX = camera.position.x;
	const eyeY = camera.position.y;
	const eyeZ = camera.position.z;
	const target = camera.target || [0, 0, 4];
	let forwardX = target[0] - eyeX;
	let forwardY = target[1] - eyeY;
	let forwardZ = target[2] - eyeZ;
	const inverseForward = 1 / (Math.hypot(forwardX, forwardY, forwardZ) || 1);
	forwardX *= inverseForward;
	forwardY *= inverseForward;
	forwardZ *= inverseForward;
	let rightX = -forwardZ;
	const rightY = 0;
	let rightZ = forwardX;
	const inverseRight = 1 / (Math.hypot(rightX, rightZ) || 1);
	rightX *= inverseRight;
	rightZ *= inverseRight;
	const upX = rightY * forwardZ - rightZ * forwardY;
	const upY = rightZ * forwardX - rightX * forwardZ;
	const upZ = rightX * forwardY - rightY * forwardX;
	return {
		eyeX,
		eyeY,
		eyeZ,
		forwardX,
		forwardY,
		forwardZ,
		rightX,
		rightY,
		rightZ,
		tangent: Math.tan((camera.fov || 45) * Math.PI / 360),
		upX,
		upY,
		upZ
	};
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

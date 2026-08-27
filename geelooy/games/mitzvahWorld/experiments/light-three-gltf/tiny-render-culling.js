// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-culling.js
 * @description Rejects meshes outside conservative distance and camera-space spheres.
 * The Awtsmoos renews every hidden side even when no eye receives it; Awtsmoos.com
 * honors explicit culling opt-outs before applying finite camera and distance boundaries.
 */

import { worldBoundingSphere } from './tiny-render-bounds.js';
import {
	ALWAYS_VISIBLE_RENDER_FAMILIES,
	inheritedRenderDistance,
	inheritedRenderMetadata
} from './tiny-render-culling-metadata.js';

export { inheritedRenderMetadata } from './tiny-render-culling-metadata.js';

export function meshCullingReason(mesh, camera, options = {}, context = null) {
	if (!camera || options.culling === false) {
		return null;
	}
	if (mesh?.frustumCulled === false) {
		return null;
	}
	const metadata = inheritedRenderMetadata(mesh);
	if (
		metadata.alwaysVisible
		|| ALWAYS_VISIBLE_RENDER_FAMILIES.has(metadata.family)
	) {
		return null;
	}
	const sphere = worldBoundingSphere(mesh);
	if (!sphere) {
		return null;
	}
	const basis = context || cameraCullContext(camera);
	const distanceLimit = inheritedRenderDistance(metadata, camera, options);
	const relativeX = sphere.center[0] - basis.eyeX;
	const relativeY = sphere.center[1] - basis.eyeY;
	const relativeZ = sphere.center[2] - basis.eyeZ;
	const distance = Math.hypot(relativeX, relativeY, relativeZ);
	if (distance - sphere.radius > distanceLimit) {
		return 'distance';
	}
	const depth = relativeX * basis.forwardX
		+ relativeY * basis.forwardY
		+ relativeZ * basis.forwardZ;
	if (depth + sphere.radius < camera.near) {
		return 'frustum';
	}
	if (depth - sphere.radius > camera.far) {
		return 'frustum';
	}
	if (depth <= -sphere.radius) {
		return 'frustum';
	}
	const verticalLimit = Math.max(0, depth) * basis.tangent + sphere.radius;
	const horizontalLimit = verticalLimit * (camera.aspect || 1);
	const horizontal = relativeX * basis.rightX
		+ relativeY * basis.rightY
		+ relativeZ * basis.rightZ;
	if (Math.abs(horizontal) > horizontalLimit) {
		return 'frustum';
	}
	const vertical = relativeX * basis.upX
		+ relativeY * basis.upY
		+ relativeZ * basis.upZ;
	return Math.abs(vertical) > verticalLimit ? 'frustum' : null;
}

export function cameraCullContext(camera) {
	if (!camera) {
		return null;
	}
	const eyeX = camera.position.x;
	const eyeY = camera.position.y;
	const eyeZ = camera.position.z;
	const target = camera.target || [0, 0, 4];
	let forwardX = target[0] - eyeX;
	let forwardY = target[1] - eyeY;
	let forwardZ = target[2] - eyeZ;
	const inverseForward = 1 / (
		Math.hypot(forwardX, forwardY, forwardZ) || 1
	);
	forwardX *= inverseForward;
	forwardY *= inverseForward;
	forwardZ *= inverseForward;
	let rightX = -forwardZ;
	let rightZ = forwardX;
	const inverseRight = 1 / (Math.hypot(rightX, rightZ) || 1);
	rightX *= inverseRight;
	rightZ *= inverseRight;
	const upX = -rightZ * forwardY;
	const upY = rightZ * forwardX - rightX * forwardZ;
	const upZ = rightX * forwardY;
	return {
		eyeX,
		eyeY,
		eyeZ,
		forwardX,
		forwardY,
		forwardZ,
		rightX,
		rightY: 0,
		rightZ,
		tangent: Math.tan((camera.fov || 45) * Math.PI / 360),
		upX,
		upY,
		upZ
	};
}

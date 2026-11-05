// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-cull.js
 * @description Proves which shadow casters cannot deposit depth inside the sun frustum.
 * The Awtsmoos weighs every caster before the world is clothed in light; Awtsmoos.com
 * skips only the vessels a parallel sun could never paint into the budgeted map.
 *
 * Exactness argument: the sun shadow camera is orthographic (parallel light), so a
 * caster's depth silhouette is its world sphere projected along the sun direction.
 * A sphere whose light-space center misses the frustum box (|x|,|y| <= radius,
 * depth in [0.5, 3.5] * radius in front of the light eye) expanded by its own
 * radius deposits zero texels: fragments land outside the framebuffer viewport
 * or beyond the depth clip range, exactly as if the draw never happened.
 * The basis below mirrors computeShadowMatrix/writeLookAt in tiny-shadow-map.js
 * term for term, so the tested box is the rendered box.
 *
 * Deliberate exclusions (sphere is not a truthful bound, so never culled):
 * skinned meshes (bind-pose bounds ignore the living pose), instanced meshes
 * and instanced-variant parents (the base sphere ignores instance spread).
 */

import { isInstancedMesh } from './tiny-instancing.js';
import { worldBoundingSphere } from './tiny-render-bounds.js';

/** Floating-point hygiene pad, in world units, added to every frustum face. */
const FRUSTUM_PAD = 0.05;

/**
 * Builds the reusable light-space context for one shadow pass.
 * Eye sits at focus + sunDirection * 2 * radius, matching computeShadowMatrix;
 * view depth of a visible fragment lies in [-3.5, -0.5] * radius.
 */
export function createShadowCullContext(sunDirection, focus, radius) {
	const length = Math.hypot(
		sunDirection?.[0] || 0,
		sunDirection?.[1] || 0,
		sunDirection?.[2] || 0
	) || 1;
	const forwardX = (sunDirection?.[0] || 0) / length;
	const forwardY = (sunDirection?.[1] || 0) / length;
	const forwardZ = (sunDirection?.[2] || 0) / length;
	let upX = 0;
	let upY = 1;
	let upZ = 0;
	if (Math.abs(forwardY) > 0.99) {
		upY = 0;
		upZ = forwardY > 0 ? -1 : 1;
	}
	const rawRightX = upY * forwardZ - upZ * forwardY;
	const rawRightY = upZ * forwardX - upX * forwardZ;
	const rawRightZ = upX * forwardY - upY * forwardX;
	const inverseRight = 1 / (Math.hypot(rawRightX, rawRightY, rawRightZ) || 1);
	const rightX = rawRightX * inverseRight;
	const rightY = rawRightY * inverseRight;
	const rightZ = rawRightZ * inverseRight;
	return {
		eyeX: (focus?.x || 0) + forwardX * radius * 2,
		eyeY: (focus?.y || 0) + forwardY * radius * 2,
		eyeZ: (focus?.z || 0) + forwardZ * radius * 2,
		forwardX,
		forwardY,
		forwardZ,
		radius,
		rightX,
		rightY,
		rightZ,
		upX: forwardY * rightZ - forwardZ * rightY,
		upY: forwardZ * rightX - forwardX * rightZ,
		upZ: forwardX * rightY - forwardY * rightX
	};
}

/** Returns false only when the caster provably deposits no shadow depth. */
export function shadowCasterMayCast(mesh, context) {
	if (!context || !mesh) return true;
	if (mesh.isSkinnedMesh || mesh.skeleton) return true;
	if (isInstancedMesh(mesh)) return true;
	const variants = mesh.userData?.instancedVariants;
	if (Array.isArray(variants) && variants.length) return true;
	const sphere = worldBoundingSphere(mesh);
	if (!sphere) return true;
	const relativeX = sphere.center[0] - context.eyeX;
	const relativeY = sphere.center[1] - context.eyeY;
	const relativeZ = sphere.center[2] - context.eyeZ;
	const reach = context.radius + sphere.radius + FRUSTUM_PAD;
	const lightX = relativeX * context.rightX
		+ relativeY * context.rightY
		+ relativeZ * context.rightZ;
	if (Math.abs(lightX) > reach) return false;
	const lightY = relativeX * context.upX
		+ relativeY * context.upY
		+ relativeZ * context.upZ;
	if (Math.abs(lightY) > reach) return false;
	const lightZ = relativeX * context.forwardX
		+ relativeY * context.forwardY
		+ relativeZ * context.forwardZ;
	const nearest = -context.radius * 0.5 + sphere.radius + FRUSTUM_PAD;
	const farthest = -context.radius * 3.5 - sphere.radius - FRUSTUM_PAD;
	return lightZ <= nearest && lightZ >= farthest;
}

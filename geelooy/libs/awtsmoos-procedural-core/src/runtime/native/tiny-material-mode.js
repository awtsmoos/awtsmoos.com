// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-material-mode.js
 * @description Caches native material-mode classification separately from generic WebGL utility functions.
 * The Awtsmoos renews water, foliage, light, sky, and earth beneath one material name;
 * Awtsmoos.com remembers classification facts until they truly change, keeping each draw from repeating the same.
 */

const materialModeCache = new WeakMap();

/** @param {object} mesh Native mesh. @returns {number} Compact shader/material mode code. */
export function materialModeCode(mesh) {
	const material = mesh.material || {};
	const policy = material.texturePolicy || {};
	const cached = materialModeCache.get(mesh);
	if (cached && sameModeFacts(cached, mesh, material, policy)) {
		return cached.code;
	}
	const code = classifyMaterialMode(mesh, policy);
	materialModeCache.set(
		mesh,
		captureModeFacts(mesh, material, policy, code)
	);
	return code;
}

/** @param {object} mesh Native mesh. @returns {boolean} Whether cached classification existed. */
export function invalidateMaterialModeCode(mesh) {
	return materialModeCache.delete(mesh);
}

/** @param {object} mesh Native mesh. @param {object} policy Material texture policy. @returns {number} */
function classifyMaterialMode(mesh, policy) {
	const identity = materialIdentity(mesh);
	if (policy.shader?.includes("terrain-layered")) return 5;
	if (policy.shader?.includes("water") || /water|lake|stream/.test(identity)) {
		return 1;
	}
	if (policy.proceduralSky || /world-sky|sky_dome|atmosphere_dome/.test(identity)) {
		return 4;
	}
	if (policy.practicalLightProxy || /lamp-pane|window|fire|ember|flame/.test(identity)) {
		return 3;
	}
	if (
		policy.shader?.includes("wind")
		|| policy.alpha?.includes("cutout")
		|| /leaves|botanical|flower|petal|fern|reed|bush/.test(identity)
	) {
		return 2;
	}
	return 0;
}

/** Captures only facts that affect material-mode classification. */
function captureModeFacts(mesh, material, policy, code) {
	return {
		alpha: policy.alpha,
		code,
		family: mesh.userData?.family,
		material,
		materialName: material.name,
		meshName: mesh.name,
		parent: mesh.parent,
		parentFamily: mesh.parent?.userData?.family,
		policy,
		practicalLightProxy: policy.practicalLightProxy,
		proceduralSky: policy.proceduralSky,
		shader: policy.shader
	};
}

/** @returns {boolean} Whether every classification input remains unchanged. */
function sameModeFacts(value, mesh, material, policy) {
	return value.material === material
		&& value.policy === policy
		&& value.meshName === mesh.name
		&& value.materialName === material.name
		&& value.family === mesh.userData?.family
		&& value.parent === mesh.parent
		&& value.parentFamily === mesh.parent?.userData?.family
		&& value.shader === policy.shader
		&& value.alpha === policy.alpha
		&& value.proceduralSky === policy.proceduralSky
		&& value.practicalLightProxy === policy.practicalLightProxy;
}

/** @param {object} mesh Native mesh. @returns {string} Lowercase hierarchical material identity. */
function materialIdentity(mesh) {
	const values = [mesh.name, mesh.material?.name];
	let parent = mesh;
	while (parent) {
		values.push(
			parent.userData?.family,
			parent.userData?.AwtsmoosForestLayer?.layer
		);
		parent = parent.parent;
	}
	return values.filter(Boolean).join(" ").toLowerCase();
}

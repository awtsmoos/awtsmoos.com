// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMaterialReadability.js
 * @description Repairs only collapsed imported colors while preserving maps and vertex contrast.
 * The Awtsmoos reveals each existing vessel without washing the world; Awtsmoos.com refuses
 * global brightness and changes only materials whose measured luminance has truly collapsed.
 */

const DEFAULT_COLOR = Object.freeze([0.32, 0.28, 0.25, 1]);

export function normalizeMinimalModelMaterials(root) {
	const receipt = {
		materials: 0,
		meshes: 0,
		preservedMaps: 0,
		vertexColorsPreserved: 0
	};
	root?.traverse?.((object) => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		receipt.meshes += 1;
		for (const material of materialList(object.material)) {
			normalizeMaterial(material, object.name, receipt);
		}
	});
	return Object.freeze({ ...receipt });
}

export function readableMaterialColor(material, objectName = '') {
	const source = readColor(material);
	const darkGarment = darkGarmentName(objectName);
	const minimum = darkGarment ? 0.16 : 0.23;
	const componentMinimum = darkGarment ? 0.16 : 0.18;
	const measured = colorLuminance(source);
	if (measured >= minimum) return source;
	const scale = minimum / Math.max(0.01, measured);
	return [
		clamp(source[0] * scale, componentMinimum, 0.72),
		clamp(source[1] * scale, componentMinimum, 0.68),
		clamp(source[2] * scale, componentMinimum, 0.74),
		clamp(source[3], 0.6, 1)
	];
}

function normalizeMaterial(material, objectName, receipt) {
	if (!material) return;
	const before = colorLuminance(readColor(material));
	const color = readableMaterialColor(material, objectName);
	writeColor(material, color);
	material.roughness = finiteOr(material.roughness, 0.72);
	material.roughnessFactor = finiteOr(material.roughnessFactor, material.roughness);
	material.metalness = clamp(finiteOr(material.metalness, 0.04), 0, 0.35);
	material.metallicFactor = clamp(finiteOr(material.metallicFactor, material.metalness), 0, 0.35);
	material.emissiveStrength = Math.max(0, finiteOr(material.emissiveStrength, 0));
	if (material.vertexColors) receipt.vertexColorsPreserved += 1;
	if (material.map || material.mapImage) receipt.preservedMaps += 1;
	material.userData ||= {};
	material.userData.readability = Object.freeze({
		afterLuminance: colorLuminance(color),
		beforeLuminance: before,
		globalBrightening: false,
		mapPreserved: Boolean(material.map || material.mapImage)
	});
	material.needsUpdate = true;
	receipt.materials += 1;
}

function materialList(material) {
	return Array.isArray(material) ? material : [material];
}

function readColor(material) {
	const value = material?.baseColorFactor || material?.color || DEFAULT_COLOR;
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0, value[3] ?? 1];
	}
	if (Number.isFinite(value?.r)) return [value.r, value.g, value.b, value.a ?? 1];
	return [...DEFAULT_COLOR];
}

function writeColor(material, color) {
	material.baseColorFactor = [...color];
	if (material.color?.setRGB) material.color.setRGB(color[0], color[1], color[2]);
	else material.color = [...color];
}

function darkGarmentName(value) {
	return /(coat|jacket|kapote|bekeshe|robe|hat|shoe|boot)/i.test(value);
}

function colorLuminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

function finiteOr(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

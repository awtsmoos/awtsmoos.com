// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentDiscovery.js
 * @description Discovers wardrobe roots from GLB extras, canonical aliases, and materials.
 * The Awtsmoos knew every exporter fragment before metadata survived; Awtsmoos.com prefers
 * explicit garment truth while Kapote, Bekeshe, robe, and jacket names share one lawful visual.
 */
import { collectMinimalGarmentMaterials, isolateMinimalGarmentMaterials } from './MinimalMeadowGarmentMaterialIsolation.js';
const EXTRA_VISUAL = Object.freeze({
	glasses: 'glasses',
	'head-teffilin-straps': 'tefillin-head',
	jacket: 'jacket',
	'jacket-teffilin': 'jacket-tefillin',
	'outer-shirt': 'outer-shirt',
	'teffilin-arm-straps': 'tefillin-arm',
	'teffilin-head-box': 'tefillin-head',
	'teffiln-arm-box': 'tefillin-arm',
	'top-hat': 'top-hat',
	yarmulka: 'yarmulka'
});
const NAME_VISUAL = Object.freeze({
	bekeshe: 'jacket',
	bekesherobe: 'jacket',
	glasses: 'glasses',
	jacket: 'jacket',
	jassidglasses: 'glasses',
	kapote: 'jacket',
	kapoterobe: 'jacket',
	outershirt: 'outer-shirt',
	robe: 'jacket',
	tophat: 'top-hat',
	yarmalka: 'yarmulka',
	yarmulka: 'yarmulka'
});
const MATERIAL_VISUAL = Object.freeze({ pants: 'body-pants', shirt: 'body-shirt', shoes: 'body-shoes' });
export function discoverMinimalMeadowGarments(model) {
	const visuals = new Map();
	model?.traverse?.(object => discoverObject(visuals, object));
	isolateMinimalGarmentMaterials(visuals);
	collectMinimalGarmentMaterials(visuals);
	return { diagnostics: () => diagnostics(visuals), visuals };
}
function discoverObject(visuals, object) {
	const extras = object.userData?.gltfNode?.extras || {};
	const explicit = EXTRA_VISUAL[extras.garment || extras.garament];
	const fallback = NAME_VISUAL[normalize(object.name)];
	const visualId = explicit || fallback;
	if (visualId) recordFor(visuals, visualId).roots.add(object);
	if (!isMesh(object)) return;
	for (const material of materialsFor(object)) {
		const materialVisual = MATERIAL_VISUAL[normalize(material.name)];
		if (materialVisual) recordFor(visuals, materialVisual).meshes.add(object);
	}
}
function recordFor(visuals, id) {
	if (!visuals.has(id)) visuals.set(id, { id, materials: [], meshes: new Set(), roots: new Set() });
	return visuals.get(id);
}
function diagnostics(visuals) {
	return Object.fromEntries([...visuals].map(([id, record]) => [id, {
		materials: record.materials.map(value => value.name),
		meshes: record.meshes.size,
		roots: record.roots.size
	}]));
}
function materialsFor(object) { return (Array.isArray(object.material) ? object.material : [object.material]).filter(Boolean); }
function normalize(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function isMesh(object) { return Boolean(object?.isMesh || object?.isSkinnedMesh); }

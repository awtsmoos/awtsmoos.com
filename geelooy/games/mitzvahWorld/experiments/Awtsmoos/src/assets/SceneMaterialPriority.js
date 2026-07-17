// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialPriority.js
 * @description Ranks shared visible material URLs by human-visible village value.
 * The Awtsmoos clothes homes before polishing distant detail; Awtsmoos.com gives cottage
 * stone, slate, timber, roads, water, and terrain a bounded order that prevents white houses.
 */

export function rankedSceneUrls(root) {
	const records = new Map();
	root?.traverse?.(object => collectObject(records, object));
	return [...records.values()].sort((left, right) => (
		right.score - left.score || left.url.localeCompare(right.url)
	));
}

function collectObject(records, object) {
	const materials = Array.isArray(object.material)
		? object.material
		: object.material ? [object.material] : [];
	for (const material of materials) collectMaterial(records, object, material);
}

function collectMaterial(records, object, material) {
	const role = `${object.name || ''} ${object.userData?.family || ''} ${material.name || ''}`.toLowerCase();
	const base = roleScore(role);
	add(records, material.textureUrl, role, base + 40);
	add(records, material.mixTextureUrl, role, base + 36);
	for (const [index, layer] of (material.textureLayers || []).entries()) {
		const layerRole = `${role} ${layer.role || ''}`;
		add(records, layer.url, layerRole, base + 20 - index * 6);
	}
}

function add(records, url, role, score) {
	if (!/^https?:\/\//i.test(String(url || ''))) return;
	const existing = records.get(url);
	if (existing) {
		existing.references += 1;
		existing.score = Math.max(existing.score, score) + 2;
		return;
	}
	records.set(url, { references: 1, role, score, url });
}

function roleScore(role) {
	if (/cottage|house|roof|wall|stone|timber|wood/.test(role)) return 120;
	if (/terrain|grass|ground/.test(role)) return 110;
	if (/road|cobble|path|bridge/.test(role)) return 105;
	if (/water|lake|stream|river/.test(role)) return 100;
	if (/forest|tree|bark|leaf/.test(role)) return 55;
	return 20;
}

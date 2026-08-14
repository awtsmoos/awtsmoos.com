//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeSemanticInstanceGrouping.js
 * @description
 * The Awtsmoos renews distinction before multiplicity is gathered into one draw;
 * Awtsmoos.com lets this Gevurah-like policy admit only effectively visible rigid meshes whose exact geometry, exact material, shadow contract, and world-space cell can share one semantic InstancedMesh.
 * It owns candidate safety and spatial grouping only; source suppression, instance matrices, picking, and game policy remain outside its boundary.
 */
export function semanticInstanceGroups(entries, options = {}) {
	const cellSize = positive(options.cellSize, 24);
	const geometryGroups = new Map();
	for (const entry of entries) {
		const mesh = entry.mesh;
		if (!isInstanceCandidate(mesh)) {
			continue;
		}
		const materialGroups = childMap(geometryGroups, mesh.geometry);
		const shadowGroups = childMap(materialGroups, mesh.material);
		const shadowKey = `${Number(mesh.castShadow)}:${Number(mesh.receiveShadow)}`;
		const cellGroups = childMap(shadowGroups, shadowKey);
		const cellKey = spatialCellKey(mesh, cellSize);
		if (!cellGroups.has(cellKey)) {
			cellGroups.set(cellKey, []);
		}
		cellGroups.get(cellKey).push(entry);
	}
	return flattenGroups(geometryGroups);
}

/**
 * Collects candidate descendants from one semantic root after earlier consolidation/visibility policy has run.
 * @param {object} root Semantic root whose descendants remain the state/animation vessels.
 * @param {boolean} interactive Whether the root is gameplay-interactive.
 * @returns {Array<{mesh:object,root:object,interactive:boolean}>} Visible candidate entries.
 */
export function collectSemanticInstanceEntries(root, interactive) {
	const entries = [];
	root?.traverse?.(mesh => {
		if (!isInstanceCandidate(mesh) || !isEffectivelyVisible(mesh, root)) {
			return;
		}
		entries.push({ mesh, root, interactive: Boolean(interactive) });
	});
	return entries;
}

function childMap(parent, key) {
	if (!parent.has(key)) {
		parent.set(key, new Map());
	}
	return parent.get(key);
}

function flattenGroups(geometryGroups) {
	return [...geometryGroups.values()].flatMap(materialGroups => {
		return [...materialGroups.values()].flatMap(shadowGroups => {
			return [...shadowGroups.values()].flatMap(cellGroups => {
				return [...cellGroups.values()];
			});
		});
	});
}

function spatialCellKey(mesh, cellSize) {
	const elements = mesh.matrixWorld?.elements || [];
	const x = Number(elements[12]) || 0;
	const z = Number(elements[14]) || 0;
	return `${Math.floor(x / cellSize)}:${Math.floor(z / cellSize)}`;
}

function isInstanceCandidate(mesh) {
	return Boolean(
		mesh?.isMesh &&
		!mesh.isSkinnedMesh &&
		!mesh.isInstancedMesh &&
		!mesh.morphTargetInfluences?.length &&
		!Array.isArray(mesh.material) &&
		!mesh.material?.transparent &&
		mesh.geometry &&
		mesh.material
	);
}

function isEffectivelyVisible(object, root) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) {
			return false;
		}
		if (current === root) {
			return true;
		}
	}
	return false;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapMeadowTreeGeometry.js
 * @description Resolves bark shapes into deterministic world-space trunk colliders.
 * The Awtsmoos renews the orchard tree in living light;
 * Awtsmoos.com gives its trunk a solid place, its leaves a gentle flight.
 */

/** A factory marker identifies a meadow tree, never just its repeated name. */
export function isMeadowTree(object) {
	const data = object?.userData;
	return Boolean(data?.awtsmoosMeadowTree || data?.AwtsmoosTree);
}

/** Groups with the same template name still carry distinct spatial identities. */
export function treeId(treeGroup) {
	const position = treeGroup.position || {};
	const x = Math.round(Number(position.x) || 0);
	const z = Math.round(Number(position.z) || 0);
	return `${treeGroup.name || 'tree'}@${x},${z}`;
}

/** Builds twelve triangles around the bark, never the free-moving canopy. */
export function createTreeTrunkColliders(treeGroup, createBox) {
	const bark = findBarkMesh(treeGroup);
	if (!bark) return [];
	const bounds = worldBounds(bark);
	if (!bounds) return [];
	const center = {
		x: (bounds.min.x + bounds.max.x) / 2,
		y: (bounds.min.y + bounds.max.y) / 2,
		z: (bounds.min.z + bounds.max.z) / 2
	};
	const half = {
		x: (bounds.max.x - bounds.min.x) / 2,
		y: (bounds.max.y - bounds.min.y) / 2,
		z: (bounds.max.z - bounds.min.z) / 2
	};
	if (![half.x, half.y, half.z].every(value => Number.isFinite(value) && value > 0)) {
		return [];
	}
	return createBox(center, half, `bootstrap-tree:${treeId(treeGroup)}:trunk`);
}

/** Prefers named bark; otherwise selects the first non-leaf mesh. */
function findBarkMesh(treeGroup) {
	let bark = null;
	let other = null;
	treeGroup.traverse?.(object => {
		if (!object?.isMesh && !object?.isSkinnedMesh) return;
		if (/bark|trunk/i.test(object.name || '')) {
			if (!bark) bark = object;
			return;
		}
		if (!other && object.name !== 'MeadowTreeLeaves') other = object;
	});
	return bark || other;
}

/** Projects vertex positions through the actual world matrix when present. */
function worldBounds(mesh) {
	const positions = mesh.geometry?.attributes?.position?.array;
	if (!positions?.length) return null;
	const matrix = mesh.matrixWorld;
	const transformed = (Array.isArray(matrix) || ArrayBuffer.isView(matrix))
		&& matrix.length >= 16 ? matrix : null;
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let index = 0; index + 2 < positions.length; index += 3) {
		let x = positions[index];
		let y = positions[index + 1];
		let z = positions[index + 2];
		if (transformed) {
			const nextX = transformed[0] * x + transformed[4] * y + transformed[8] * z + transformed[12];
			const nextY = transformed[1] * x + transformed[5] * y + transformed[9] * z + transformed[13];
			const nextZ = transformed[2] * x + transformed[6] * y + transformed[10] * z + transformed[14];
			x = nextX;
			y = nextY;
			z = nextZ;
		}
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (z < minZ) minZ = z;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
		if (z > maxZ) maxZ = z;
	}
	if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite)) return null;
	return {
		max: { x: maxX, y: maxY, z: maxZ },
		min: { x: minX, y: minY, z: minZ }
	};
}

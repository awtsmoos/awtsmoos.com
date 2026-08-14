//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeStaticGeometryMerge.js
 * @description
 * The Awtsmoos renews many rigid vertex vessels as one geometry while Awtsmoos.com lets this Yesod-like adapter collapse compatible static submissions without changing their visible shape.
 * It owns attribute compatibility, transform baking, and BufferGeometry concatenation only; semantic eligibility, materials, picking, and gameplay remain outside its boundary.
 */
export function staticGeometrySchema(geometry) {
	return Object.keys(geometry?.attributes || {})
		.sort()
		.map(name => {
			const attribute = geometry.getAttribute(name);
			return `${name}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`;
		})
		.join('|');
}

/** @param {object} geometry Source BufferGeometry. @param {object} matrix Matrix into one anchor's local space. @returns {object} Disposable baked non-indexed clone. */
export function bakeStaticGeometry(geometry, matrix) {
	const clone = geometry.clone();
	clone.applyMatrix4(matrix);
	if (!clone.index) {
		return clone;
	}
	const expanded = clone.toNonIndexed();
	clone.dispose();
	return expanded;
}

/** @param {object} THREE Three namespace. @param {object[]} geometries Compatible non-indexed geometries. @returns {object} Merged BufferGeometry. */
export function mergeStaticGeometries(THREE, geometries) {
	if (!geometries.length) {
		throw new Error('ThreeStaticGeometryMerge: at least one geometry is required');
	}
	const schema = staticGeometrySchema(geometries[0]);
	if (geometries.some(geometry => staticGeometrySchema(geometry) !== schema || geometry.index)) {
		throw new Error('ThreeStaticGeometryMerge: geometries must share one non-indexed attribute schema');
	}
	const merged = new THREE.BufferGeometry();
	for (const name of Object.keys(geometries[0].attributes)) {
		merged.setAttribute(name, mergeAttribute(THREE, name, geometries));
	}
	merged.computeBoundingBox();
	merged.computeBoundingSphere();
	merged.userData = {
		awtsmoosStaticMerged: true,
		sourceGeometryCount: geometries.length
	};
	return merged;
}

function mergeAttribute(THREE, name, geometries) {
	const first = geometries[0].getAttribute(name);
	const totalLength = geometries.reduce((sum, geometry) => {
		return sum + geometry.getAttribute(name).array.length;
	}, 0);
	const ArrayType = first.array.constructor;
	const values = new ArrayType(totalLength);
	let offset = 0;
	for (const geometry of geometries) {
		const source = geometry.getAttribute(name).array;
		values.set(source, offset);
		offset += source.length;
	}
	return new THREE.BufferAttribute(values, first.itemSize, first.normalized);
}

//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file NativeGeometryMesh.js
 * @description Materializes portable indexed geometry and hierarchy through Core's native runtime only.
 * The Awtsmoos renews point, face, color, group, and surface beyond every product adapter; callers provide
 * portable arrays and semantic metadata while reusable BufferGeometry, Mesh, and Group construction stays here.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh
} from '../../adapters/native/runtime.js';

/**
 * Create native indexed geometry from portable typed or numeric arrays.
 * Supported attributes intentionally match the renderer's reusable physical-world contract.
 */
export function createNativeGeometry(data = {}, options = {}) {
	const geometry = new BufferGeometry();
	setAttribute(geometry, 'position', data.positions, 3);
	setAttribute(geometry, 'normal', data.normals, 3);
	setAttribute(geometry, 'uv', data.uvs, 2);
	setAttribute(geometry, 'color', data.colors, 4);
	setAttribute(geometry, 'joints', data.joints, 4);
	setAttribute(geometry, 'weights', data.weights, 4);
	setAttribute(geometry, 'zone', data.zoneWeights, 4);
	if (data.indices?.length) {
		geometry.setIndex(new BufferAttribute(createIndexArray(data.indices), 1));
	}
	geometry.userData = { ...(options.geometryUserData || {}) };
	return geometry;
}

/** Creates geometry that must contain an explicit reusable index stream. */
export function createNativeIndexedGeometry(data = {}, options = {}) {
	if (!data.indices?.length) throw new Error('Core native indexed geometry requires indices.');
	return createNativeGeometry(data, options);
}

/** Creates one native mesh from portable geometry and a Core-owned material. */
export function createNativeGeometryMesh(data = {}, material, options = {}) {
	const geometry = createNativeIndexedGeometry(data, options);
	return createNativeMeshFromGeometry(geometry, material, options);
}

/** Create one native mesh around an already-materialized geometry without product-side constructor ownership. */
export function createNativeMeshFromGeometry(geometry, material, options = {}) {
	if (!geometry) throw new TypeError('Core native mesh requires geometry.');
	const mesh = new Mesh(geometry, material);
	mesh.name = options.name || 'Awtsmoos Core Mesh';
	mesh.frustumCulled = options.frustumCulled !== false;
	mesh.userData = {
		family: options.family || 'core-world-mesh',
		...(options.userData || {})
	};
	applyPosition(mesh, options.position);
	return mesh;
}

/** Creates one reusable native group so product adapters never construct renderer hierarchy directly. */
export function createNativeWorldGroup(options = {}) {
	const group = new Group();
	group.name = options.name || 'Awtsmoos Core World Group';
	group.userData = { ...(options.userData || {}) };
	applyPosition(group, options.position);
	return group;
}

function setAttribute(geometry, name, values, itemSize) {
	if (!values?.length) return;
	const array = values instanceof Float32Array ? values : new Float32Array(values);
	geometry.setAttribute(name, new BufferAttribute(array, itemSize));
}
/** Select the smallest safe index width without spreading unbounded arrays onto the call stack. */
function createIndexArray(values) {
	if (values instanceof Uint16Array || values instanceof Uint32Array) return values;
	let maximum = 0;
	for (const value of values) {
		if (value > maximum) maximum = value;
	}
	return maximum > 65535 ? new Uint32Array(values) : new Uint16Array(values);
}

function applyPosition(object, position) {
	if (!position) return;
	object.position.set(
		Number(position.x || 0),
		Number(position.y || 0),
		Number(position.z || 0)
	);
}

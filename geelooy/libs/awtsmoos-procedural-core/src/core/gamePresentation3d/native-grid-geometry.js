//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-grid-geometry.js
 * @description Converts renderer-neutral procedural primitives into native runtime
 * geometry for semantic 2D-grid-to-3D game projections without external rendering libraries.
 */
import { generatePrimitiveGeometry } from '../geometry/primitiveGeometryGenerator.js';
import {
	BufferAttribute,
	BufferGeometry
} from '../../runtime/native/tiny-runtime.js';

/** Create one shared cube or front-facing disc geometry for grid games. */
export function createNativeGridCellGeometry(shape = 'cube') {
	const primitive = shape === 'disc' ? 'cylinder' : 'cube';
	const options = shape === 'disc'
		? { radius: 0.44, height: 0.3, segments: 24 }
		: { size: 0.86 };
	const data = generatePrimitiveGeometry(primitive, options);
	if (shape === 'disc') {
		rotateCylinderToFront(data.positions, data.normals);
	}
	return materialize(data);
}

/** Rotate a Y-axis cylinder so its circular faces point toward the camera. */
function rotateCylinderToFront(positions, normals) {
	for (const values of [positions, normals]) {
		for (let index = 0; index < values.length; index += 3) {
			const y = values[index + 1];
			const z = values[index + 2];
			values[index + 1] = -z;
			values[index + 2] = y;
		}
	}
}

/** Materialize typed renderer-neutral buffers as one native BufferGeometry. */
function materialize(data) {
	const geometry = new BufferGeometry();
	setAttribute(geometry, 'position', data.positions, 3);
	setAttribute(geometry, 'normal', data.normals, 3);
	setAttribute(geometry, 'uv', data.uvs, 2);
	if (data.indices?.length) {
		const IndexArray = Math.max(...data.indices) > 65535
			? Uint32Array
			: Uint16Array;
		geometry.setIndex(new BufferAttribute(new IndexArray(data.indices), 1));
	}
	return geometry;
}

/** Add one finite float attribute when the procedural primitive supplies it. */
function setAttribute(geometry, name, values, itemSize) {
	if (!values?.length) {
		return;
	}
	const array = values instanceof Float32Array
		? values
		: new Float32Array(values);
	geometry.setAttribute(name, new BufferAttribute(array, itemSize));
}

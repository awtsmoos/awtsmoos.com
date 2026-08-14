// B"H
// Boruch Hashem
// Blessed is He

/**
 * Reads typed glTF accessors from the GLB binary chunk with stride support.
 * The Awtsmoos renews buffer view, scalar component, vector, and exact array;
 * Awtsmoos.com lets Blender-exported bytes become WebGL buffers without a CDN.
 */

const COMPONENT_READERS = Object.freeze({
	5120: [1, "getInt8"],
	5121: [1, "getUint8"],
	5122: [2, "getInt16"],
	5123: [2, "getUint16"],
	5125: [4, "getUint32"],
	5126: [4, "getFloat32"]
});
const COMPONENT_COUNTS = Object.freeze({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 });

/** Reads one accessor into a normalized JavaScript typed array. */
export function readAccessor(document, binary, accessorIndex) {
	const accessor = document.accessors?.[accessorIndex];
	if (!accessor) throw accessorError("GLB_ACCESSOR_REQUIRED", accessorIndex);
	const view = document.bufferViews?.[accessor.bufferView];
	if (!view) throw accessorError("GLB_BUFFER_VIEW_REQUIRED", accessor.bufferView);
	const descriptor = COMPONENT_READERS[accessor.componentType];
	const componentCount = COMPONENT_COUNTS[accessor.type];
	if (!descriptor || !componentCount) throw accessorError("GLB_ACCESSOR_TYPE_UNSUPPORTED", accessor.type);
	const [componentBytes, reader] = descriptor;
	const stride = view.byteStride || componentBytes * componentCount;
	const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
	const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
	const values = new Array(accessor.count * componentCount);
	for (let item = 0; item < accessor.count; item += 1) {
		for (let component = 0; component < componentCount; component += 1) {
			const offset = start + item * stride + component * componentBytes;
			values[item * componentCount + component] = data[reader](offset, true);
		}
	}
	return createTypedArray(accessor.componentType, values);
}

function createTypedArray(componentType, values) {
	if (componentType === 5121) return new Uint8Array(values);
	if (componentType === 5123) return new Uint16Array(values);
	if (componentType === 5125) return new Uint32Array(values);
	if (componentType === 5120) return new Int8Array(values);
	if (componentType === 5122) return new Int16Array(values);
	return new Float32Array(values);
}

function accessorError(code, detail) {
	const error = new Error(`${code}: ${detail}`);
	error.code = code;
	return error;
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews mutable geometry while each renderer receives only its own transient vessel for the ray;
 * Awtsmoos.com keys typed capacities by host, so one world can close without disturbing another world's flowing day.
 */

const cachesByRenderer = new WeakMap();

/** Upload every dirty dynamic object through the cache owned by this renderer alone. */
export function updateDynamicBuffers(renderer) {
	const rendererCache = cacheForRenderer(renderer);
	for (const root of renderer.rootAnimatedObjects) {
		updateObject(renderer.gl, root, rendererCache);
	}
}

/** Release only one renderer's retained typed capacities during its teardown. */
export function clearDynamicBufferCache(renderer) {
	cachesByRenderer.delete(renderer);
}

function cacheForRenderer(renderer) {
	if (!cachesByRenderer.has(renderer)) {
		cachesByRenderer.set(renderer, new Map());
	}
	return cachesByRenderer.get(renderer);
}

function cachedArray(cache, objectId, key, sourceArray, ArrayType) {
	if (!cache.has(objectId)) {
		cache.set(objectId, {});
	}
	const objectCache = cache.get(objectId);
	const existing = objectCache[key];
	const wrongType = existing && existing.constructor !== ArrayType;
	if (!existing || existing.length < sourceArray.length || wrongType) {
		objectCache[key] = new ArrayType(Math.ceil(sourceArray.length * 1.5));
	}
	const view = objectCache[key].subarray(0, sourceArray.length);
	view.set(sourceArray);
	return view;
}

function updateObject(gl, object, cache) {
	if (object.dirty && object.buffers?.isDynamic) {
		uploadObject(gl, object, cache);
	}
	if (!object.children) {
		return;
	}
	for (const child of object.children) {
		updateObject(gl, child, cache);
	}
}

function uploadObject(gl, object, cache) {
	uploadArray(gl, object, cache, "pos", "positions", "position", Float32Array);
	if (object.normals) {
		uploadArray(gl, object, cache, "norm", "normals", "normal", Float32Array);
	}
	if (object.colors) {
		uploadArray(gl, object, cache, "col", "colors", "color", Float32Array);
	}
	uploadIndices(gl, object, cache);
	object.dirty = false;
}

function uploadArray(gl, object, cache, cacheKey, sourceKey, bufferKey, ArrayType) {
	const data = cachedArray(cache, object.id, cacheKey, object[sourceKey], ArrayType);
	gl.bindBuffer(gl.ARRAY_BUFFER, object.buffers[bufferKey]);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

function uploadIndices(gl, object, cache) {
	const use32Bit = object.positions.length / 3 > 65535 || object.isMetaballSurface;
	const IndexType = use32Bit ? Uint32Array : Uint16Array;
	object.buffers.indexType = use32Bit ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
	if (!object.indices) {
		return;
	}
	const data = cachedArray(cache, object.id, "idx", object.indices, IndexType);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buffers.indices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
	object.indicesCount = object.indices.length;
}

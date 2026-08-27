
// B"H
/**
 * @file animationLoop.js
 * @brief The eternal heartbeat of the renderer — raf loop, dt, dirty buffer uploads.
 *   ONE FIX APPLIED: shapeKeySystem.update(dt) now receives dt so OratorLogic
 *   can perform frame-rate-independent interpolation. Previously called with no args.
 */

const BUFFER_CACHE = new Map();

function ensureObjectCache(objId, key, sourceArray, Type) {
    if (!BUFFER_CACHE.has(objId)) BUFFER_CACHE.set(objId, {});
    const objCache = BUFFER_CACHE.get(objId);
    const existingArray = objCache[key];
    const typeChanged = existingArray && existingArray.constructor !== Type;

    if (!existingArray || existingArray.length < sourceArray.length || typeChanged) {
        objCache[key] = new Type(Math.ceil(sourceArray.length * 1.5));
    }
    const subarray = objCache[key].subarray(0, sourceArray.length);
    subarray.set(sourceArray);
    return subarray;
}

function updateDynamicBuffers(renderer) {
    const gl = renderer.gl;
    const checkRecursive = (obj) => {
        if (obj.dirty && obj.buffers && obj.buffers.isDynamic) {
            const id = obj.id;
            const posData = ensureObjectCache(id, 'pos', obj.positions, Float32Array);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
            gl.bufferData(gl.ARRAY_BUFFER, posData, gl.DYNAMIC_DRAW);

            if (obj.normals) {
                const normData = ensureObjectCache(id, 'norm', obj.normals, Float32Array);
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.normal);
                gl.bufferData(gl.ARRAY_BUFFER, normData, gl.DYNAMIC_DRAW);
            }
            if (obj.colors) {
                const colData = ensureObjectCache(id, 'col', obj.colors, Float32Array);
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.color);
                gl.bufferData(gl.ARRAY_BUFFER, colData, gl.DYNAMIC_DRAW);
            }

            const use32Bit = (obj.positions.length / 3) > 65535 || obj.isMetaballSurface;
            const IndexType = use32Bit ? Uint32Array : Uint16Array;
            obj.buffers.indexType = use32Bit ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

            if (obj.indices) {
                const idxData = ensureObjectCache(id, 'idx', obj.indices, IndexType);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxData, gl.DYNAMIC_DRAW);
                obj.indicesCount = obj.indices.length;
            }
            obj.dirty = false;
        }
        if (obj.children) obj.children.forEach(checkRecursive);
    };
    renderer.rootAnimatedObjects.forEach(checkRecursive);
}

function animate(renderer) {
    renderer.frameCount++;
    renderer.resize();

    const now = performance.now();
    const dt = Math.min((now - renderer.lastFrameTime) / 1000, 0.033);
    renderer.lastFrameTime = now;

    // Core physics / player updates
    renderer.update(dt);

    // B"H — FIX: pass dt so OratorLogic can do frame-rate-independent lerp
    if (renderer.systemManager && renderer.systemManager.shapeKeySystem) {
        renderer.systemManager.shapeKeySystem.update(dt);
    }

    updateDynamicBuffers(renderer);

    if (!renderer.isPlaying && renderer.isCameraAnimationEnabled &&
        renderer.cameraAnimation && renderer.cameraAnimation.length > 0) {
        const currentTime = (now - renderer.startTime) / 1000;
        const camMatrix = renderer.animationManager.getInterpolatedTransform('__camera__', currentTime);
        renderer.orbitControls.setPosition([camMatrix[12], camMatrix[13], camMatrix[14]]);
    }

    renderer.drawingManager.renderFrame();
    requestAnimationFrame(() => animate(renderer));
}

export const animationLoop = { animate, updateDynamicBuffers };

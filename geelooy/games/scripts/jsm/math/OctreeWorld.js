// B"H
import { Box3, Triangle, Vector3 } from '/games/scripts/build/three.module.js';
import { Octree } from './AwtsmoosOctree.js';

const _capsuleBox = new Box3();
const _tempBox = new Box3(); // Use a temporary box to avoid conflicts
const _tempVec = new Vector3();
const _rayBox = new Box3(); // Add a box for the ray
const _rayEnd = new Vector3(); // <<< FIX: DECLARE _rayEnd HERE
export class OctreeWorld {
    box = new Box3();

    #chunkSize;
    #staticTrianglesByChunk = new Map();
    #activeChunks = new Map();
     #maxActiveChunks = 150; 
    #buildQueue = new Set();
    #chunksPerFrame = 2; // Can adjust this for performance tuning

    constructor(chunkSize = 64) {
        this.#chunkSize = chunkSize;
    }

    // --- MAIN GAME LOOP HOOK ---
    // This should be called once per frame from your main animate() loop
    processBuildQueue() {
        for (let i = 0; i < this.#chunksPerFrame; i++) {
            if (this.#buildQueue.size === 0) break;

            const key = this.#buildQueue.values().next().value;
            this.#buildQueue.delete(key);

            if (!this.#activeChunks.has(key)) {
                this._activateChunk(key);
            }
        }
    }
    
    fromGraphNode(group) {
        // (This method remains unchanged from your working version)
        group.updateWorldMatrix(true, true);
        group.traverse(obj => {
            if (obj.isMesh) {
                const geometry = obj.geometry;
                const tempGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
                const tempPosition = tempGeometry.getAttribute('position');

                for (let i = 0; i < tempPosition.count; i += 3) {
                    const vA = new Vector3().fromBufferAttribute(tempPosition, i).applyMatrix4(obj.matrixWorld);
                    const vB = new Vector3().fromBufferAttribute(tempPosition, i + 1).applyMatrix4(obj.matrixWorld);
                    const vC = new Vector3().fromBufferAttribute(tempPosition, i + 2).applyMatrix4(obj.matrixWorld);
                    const tri = new Triangle(vA, vB, vC);
                    
                    _tempBox.makeEmpty().expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
                    
                    const minCoords = this._getChunkCoordsForPosition(_tempBox.min);
                    const maxCoords = this._getChunkCoordsForPosition(_tempBox.max);
                    
                    for (let x = minCoords.x; x <= maxCoords.x; x++) {
                        for (let y = minCoords.y; y <= maxCoords.y; y++) {
                            for (let z = minCoords.z; z <= maxCoords.z; z++) {
                                const chunkKey = `${x}_${y}_${z}`;
                                if (!this.#staticTrianglesByChunk.has(chunkKey)) {
                                    this.#staticTrianglesByChunk.set(chunkKey, []);
                                }
                                this.#staticTrianglesByChunk.get(chunkKey).push(tri);
                            }
                        }
                    }
                }
                
                if (geometry.index) tempGeometry.dispose();
            }
        });
        return this;
    }

    updateFocus(currentFocus, predictedFocus, loadRadius = 2, unloadRadius = 3) {
        // (This method is for the async queue and remains the same as the previous version)
        if (unloadRadius <= loadRadius) {
            unloadRadius = loadRadius + 1;
        }

        const currentCenterCoords = this._getChunkCoordsForPosition(currentFocus);
        const predictedCenterCoords = this._getChunkCoordsForPosition(predictedFocus);
        const requiredKeys = new Set();

        const addBubble = (centerCoords, radius) => {
            for (let x = centerCoords.x - radius; x <= centerCoords.x + radius; x++) {
                for (let y = centerCoords.y - radius; y <= centerCoords.y + radius; y++) {
                    for (let z = centerCoords.z - radius; z <= centerCoords.z + radius; z++) {
                        requiredKeys.add(`${x}_${y}_${z}`);
                    }
                }
            }
        };

        addBubble(currentCenterCoords, loadRadius);
        addBubble(predictedCenterCoords, loadRadius);

        let didChange = false;

        for (const key of requiredKeys) {
            if (!this.#activeChunks.has(key) && this.#staticTrianglesByChunk.has(key)) {
                this.#buildQueue.add(key);
            }
        }

        const keysToUnload = [];
        for (const key of this.#activeChunks.keys()) {
            if (requiredKeys.has(key)) continue; // Never unload required chunks

            const coords = this._getChunkCoordsFromKey(key);
            const distToCurrent = Math.max(Math.abs(coords.x - currentCenterCoords.x), Math.abs(coords.y - currentCenterCoords.y), Math.abs(coords.z - currentCenterCoords.z));
            
            // Unload if it's outside the unload radius of the CURRENT position.
            // We simplify this to only care about the player's actual location for unloading.
            if (distToCurrent > unloadRadius) {
                keysToUnload.push(key);
            }
        }
        
        if (keysToUnload.length > 0) {
            didChange = true;
            keysToUnload.forEach(key => this._deactivateChunk(key));
        }
        
        // --- NEW: SAFETY NET ---
        // If we are still over the limit after normal unloading, force cleanup.
        if (this.#activeChunks.size > this.#maxActiveChunks) {
            this.#forceCleanup(currentFocus);
            didChange = true; // A change was made
        }
        if (didChange) {
            this._rebuildWorldBox();
        }
    }
    
    #forceCleanup(focusPoint) {
        console.warn("OctreeWorld: Exceeded max active chunks. Forcing cleanup.");
        const sortedChunks = [];
        
        // Calculate distance for every active chunk
        for (const [key, chunkData] of this.#activeChunks.entries()) {
            // Use the center of the chunk's box for accurate distance
            chunkData.gridBox.getCenter(_tempVec);
            const distanceSq = _tempVec.distanceToSquared(focusPoint);
            sortedChunks.push({ key, distanceSq });
        }
        
        // Sort chunks from farthest to nearest
        sortedChunks.sort((a, b) => b.distanceSq - a.distanceSq);
        
        // Unload chunks until we are back under the limit
        let chunksToUnloadCount = this.#activeChunks.size - this.#maxActiveChunks;
        for (let i = 0; i < chunksToUnloadCount; i++) {
            const chunkToUnload = sortedChunks[i];
            if (chunkToUnload) {
                this._deactivateChunk(chunkToUnload.key);
            }
        }
    }

    capsuleIntersect(capsule) {
        // --- START: JIT (JUST-IN-TIME) BUILDER ---
        // This is the emergency check that guarantees the ground beneath you exists.
        _capsuleBox.makeEmpty().expandByPoint(capsule.start).expandByPoint(capsule.end);
        _capsuleBox.min.addScalar(-capsule.radius);
        _capsuleBox.max.addScalar(capsule.radius);
        this.#ensureChunksAreActiveForBounds(_capsuleBox);
        // --- END: JIT BUILDER ---

        if (this.box.isEmpty() || !capsule.intersectsBox(this.box)) return false;

        let finalCollision = false;
        const candidateOctrees = this._getCandidateChunksForCapsule(capsule);

        for (const octree of candidateOctrees) {
            const result = octree.capsuleIntersect(capsule);
            if (result) {
                if (!finalCollision || result.depth > finalCollision.depth) {
                    finalCollision = result;
                }
            }
        }
        return finalCollision;
    }

    rayIntersect(ray) {
    // --- START: JIT (JUST-IN-TIME) BUILDER ---
    // Rays also need this to prevent raycasting into unloaded chunks.

    // FIX: Manually create a bounding box for the ray segment.
    // Assuming a max ray length for practical purposes, e.g., 1000 units.
    _rayEnd.copy(ray.origin).addScaledVector(ray.direction, 1000); 
    _rayBox.makeEmpty().expandByPoint(ray.origin).expandByPoint(_rayEnd);
    
    this.#ensureChunksAreActiveForBounds(_rayBox);
    // --- END: JIT BUILDER ---

    if (this.box.isEmpty() || !ray.intersectsBox(this.box)) return false;

    let closestResult = false;
    const candidateOctrees = this._getCandidateChunksForRay(ray);
    
    for (const octree of candidateOctrees) {
        const result = octree.rayIntersect(ray);
        if (result) {
            if (!closestResult || result.distance < closestResult.distance) {
                closestResult = result;
            }
        }
    }
    return closestResult;
}

    // --- PRIVATE METHODS ---

    // NEW JIT METHOD: Force-builds any chunks required by a bounding box.
    #ensureChunksAreActiveForBounds(box) {
        const minCoords = this._getChunkCoordsForPosition(box.min);
        const maxCoords = this._getChunkCoordsForPosition(box.max);

        for (let x = minCoords.x; x <= maxCoords.x; x++) {
            for (let y = minCoords.y; y <= maxCoords.y; y++) {
                for (let z = minCoords.z; z <= maxCoords.z; z++) {
                    const key = `${x}_${y}_${z}`;
                    if (!this.#activeChunks.has(key) && this.#staticTrianglesByChunk.has(key)) {
                        // This is an emergency! Build it RIGHT NOW.
                        this._activateChunk(key);
                        // Make sure we don't try to build it again in the background queue.
                        this.#buildQueue.delete(key);
                    }
                }
            }
        }
    }

    _activateChunk(key) {
	    const triangles = this.#staticTrianglesByChunk.get(key);
	    if (!triangles || triangles.length === 0) {
            this.#activeChunks.set(key, { octree: new Octree(new Box3()), gridBox: new Box3() });
            return;
        }

	    const coords = this._getChunkCoordsFromKey(key);
	    const min = new Vector3(coords.x, coords.y, coords.z).multiplyScalar(this.#chunkSize);
	    const max = min.clone().addScalar(this.#chunkSize);

	    const gridBox = new Box3(min, max);
	    const octree = new Octree();
	    
	    octree._addTriangles(triangles);
	    octree.build();
	    octree.box.copy(gridBox);
	    
	    this.#activeChunks.set(key, { octree, gridBox });

        // --- BUG FIX: Rebuild world box on activation too! ---
        this._rebuildWorldBox();
	
	}

    _deactivateChunk(key) {
        this.#buildQueue.delete(key);
        this.#activeChunks.delete(key);
    }
    

    
    _rebuildWorldBox() {
    this.box.makeEmpty();
    for (const chunkData of this.#activeChunks.values()) {
        this.box.union(chunkData.gridBox); // Use the correct box here too.
    }
}

    _getChunkCoordsForPosition(position) {
        return {
            x: Math.floor(position.x / this.#chunkSize),
            y: Math.floor(position.y / this.#chunkSize),
            z: Math.floor(position.z / this.#chunkSize),
        };
    }

    _getChunkKeyForPosition(position) {
        const coords = this._getChunkCoordsForPosition(position);
        return `${coords.x}_${coords.y}_${coords.z}`;
    }
    
    _getChunkCoordsFromKey(key) {
        const parts = key.split('_');
        return { x: parseInt(parts[0]), y: parseInt(parts[1]), z: parseInt(parts[2]) };
    }
    
    _getCandidateChunksForCapsule(capsule) {
    const candidates = [];
    _capsuleBox.makeEmpty();
    _capsuleBox.expandByPoint(capsule.start).expandByPoint(capsule.end);
    _capsuleBox.min.addScalar(-capsule.radius);
    _capsuleBox.max.addScalar(capsule.radius);

    // --- START OF THE FIX ---
    // Iterate through our new data structure.
    for (const chunkData of this.#activeChunks.values()) {
        // Use the gridBox, our single source of truth, for the check.
        if (chunkData.gridBox.intersectsBox(_capsuleBox)) {
            // But add the actual octree worker to the list to be checked.
            candidates.push(chunkData.octree);
        }
    }
    // --- END OF THE FIX ---

    return candidates;
}
    
    /**
     * [RESTORED] Gets all active chunks that could possibly intersect with a ray.
     */
    _getCandidateChunksForRay(ray) {
	    const candidates = [];
	
	    // Iterate through the chunkData objects, just like the capsule check.
	    for (const chunkData of this.#activeChunks.values()) {
	        // Use the correct gridBox for the intersection test.
	        if (ray.intersectsBox(chunkData.gridBox)) {
	            // Add the actual octree worker to the list.
	            candidates.push(chunkData.octree);
	        }
	    }
	
	    return candidates;
	}
	
	 // --- HELPER/DEBUG METHODS ---
    getActiveChunkCount() {
        return this.#activeChunks.size;
    }

    getBuildQueueSize() {
        return this.#buildQueue.size;
    }
}
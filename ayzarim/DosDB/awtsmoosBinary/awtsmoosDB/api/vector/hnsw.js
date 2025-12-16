
// B"H
const VectorStorage = require('./storage.js');
const { getMetric } = require('./math.js');
const SmartPointer = require('../../utils/smartPointer.js');
const BinaryHeap = require('../../utils/binaryHeap.js');
const Sequence = require('../../structure/sequence/index.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

const M = 12; 
const M_MAX0 = 24; 
const EF_CONSTRUCTION = 100;
const ML = 1 / Math.log(M);

class HNSW {
    constructor(db, registry, keyMap, meta) {
        this.db = db;
        this.registryHandle = registry; 
        this.keyMap = keyMap;     
        this.meta = meta; 
        this.storage = new VectorStorage(db.allocator);
        this.metric = getMetric(meta.metric || 'cosine');
        this.entryNodeID = meta.entryNodeID !== undefined ? meta.entryNodeID : -1;
        
        // B"H: Optimization - Node Cache
        this.nodeCache = new Map();
        this.dirtyNodes = new Set(); // Track nodes that need saving
        this.CACHE_LIMIT = 20000; // Increased for bulk operations
        
        // B"H: Optimization - Registry Cache (ID -> Buffer Pointer)
        this.registryPtrs = []; 
        this.registryLoaded = false;
        
        // B"H: Persistent Registry Engine
        this.registryEngine = null; 
    }

    async _initRegistryEngine() {
        if (this.registryEngine) return;
        await this.registryHandle.ensureResolved();
        if (this.registryHandle.ptr) {
            const ptr = await SmartPointer.resolve(this.registryHandle.ptr, this.db.allocator);
            this.registryEngine = new Sequence(this.db.allocator, ptr);
            
            // Preload Registry Count
            const len = await this.registryEngine.length();
            
            // B"H: Sync cache length
            if (this.registryPtrs.length < len) {
                this.registryPtrs.length = len;
            }
            if (this.db.debug) console.log(`B"H HNSW Registry Init. Length: ${len}`);
        }
    }

    async _getRegistryPtr(index) {
        // B"H: Fast Path - In-Memory Array
        if (this.registryPtrs[index]) return this.registryPtrs[index];
        
        if (!this.registryEngine) await this._initRegistryEngine();
        
        if (this.registryEngine) {
            const ptr = await this.registryEngine.getPtr(index);
            if (ptr) {
                // Copy to safe buffer
                const copy = Buffer.allocUnsafe(16);
                ptr.copy(copy);
                this.registryPtrs[index] = copy;
                return copy;
            }
        }
        return null;
    }

    async _setRegistryPtr(index, ptr) {
        // Cache immediately
        const copy = Buffer.allocUnsafe(16);
        ptr.copy(copy);
        this.registryPtrs[index] = copy;
        
        // B"H: Ensure engine is ready
        if (!this.registryEngine) await this._initRegistryEngine();
        
        // B"H: Optimization
        // If we are in Batch Mode (implied by rapid inserts), relying on Sequence's internal cache is key.
        // We ensure we reuse the same `registryEngine` instance across inserts.
        
        // Check actual length of engine to decide append vs set
        const engineLen = this.registryEngine ? this.registryEngine.nodeIO.engine.cache.size > 0 ? this.registryPtrs.length : await this.registryEngine.length() : 0;
        
        // Use a simpler length check: registryPtrs tracks implied length.
        // Or trust the engine.
        
        if (this.registryEngine) {
             const actualLen = await this.registryEngine.length();
             if (index >= actualLen) {
                 await this.registryEngine.ops.append(ptr);
             } else {
                 await this.registryEngine.set(index, ptr);
             }
        } else {
             // Fallback if sequence not init yet
             await this.registryHandle.push(ptr);
             // Re-init engine to capture the new state
             await this._initRegistryEngine();
        }
    }

    async _getNode(nodeId) {
        if (nodeId === -1 || nodeId === undefined) return null;
        if (this.nodeCache.has(nodeId)) return this.nodeCache.get(nodeId);

        const ptr = await this._getRegistryPtr(nodeId);
        if (!ptr) {
            if (this.db.debug) console.log(`B"H HNSW _getNode(${nodeId}) failed: Pointer not found in registry.`);
            return null;
        }
        
        const node = await this.storage.loadNode(ptr);
        if (node.deleted) return null;
        
        this._cacheNode(nodeId, node);
        return node;
    }
    
    _cacheNode(nodeId, node) {
        if (this.nodeCache.size >= this.CACHE_LIMIT) {
            // Evict non-dirty node if possible
            for (const [key, val] of this.nodeCache) {
                if (!this.dirtyNodes.has(key)) {
                    this.nodeCache.delete(key);
                    break;
                }
            }
            // If still full (all dirty), we MUST flush some dirty nodes
            if (this.nodeCache.size >= this.CACHE_LIMIT) {
                this.flushCache(100); // Flush 100 nodes
            }
        }
        this.nodeCache.set(nodeId, node);
    }

    async insert(key, vector, payloadPtr) {
        const existingNodeID = await this.keyMap.get(String(key));
        if (existingNodeID !== undefined) {
            const oldNode = await this._getNode(existingNodeID);
            if (oldNode) {
                oldNode.deleted = true;
                this.dirtyNodes.add(oldNode.id); // Mark dirty instead of saving immediately
            }
        }

        const level = Math.floor(-Math.log(Math.random()) * ML);
        
        // Ensure registry engine is init to get correct ID
        await this._initRegistryEngine();
        
        // ID is next index
        // B"H: Trust internal array length for ID generation to avoid excessive DB reads
        const nodeId = this.registryPtrs.length; 
        
        // if (this.db.debug) console.log(`B"H HNSW Insert: Creating Node ID ${nodeId}`);

        // Create initial node structure in memory
        const newNodePtr = await this.storage.createNode(vector, level, payloadPtr, nodeId);
        await this._setRegistryPtr(nodeId, newNodePtr);
        await this.keyMap.set(String(key), nodeId); // B"H: Persist Key Mapping
        
        const newNode = await this.storage.loadNode(newNodePtr); 
        this.nodeCache.set(nodeId, newNode);
        this.dirtyNodes.add(nodeId); 
        
        let currObj = await this._getNode(this.entryNodeID);
        
        if (!currObj) {
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
            await this.flushCache(); // Ensure entry point is saved
            return nodeId;
        }

        let currDist = this.metric(vector, currObj.vector);
        let currLevel = currObj.level;

        for (let l = currLevel; l > level; l--) {
            let changed = true;
            while (changed) {
                changed = false;
                const neighbors = currObj.neighbors[l] || [];
                for (const nId of neighbors) {
                    const nNode = await this._getNode(nId);
                    if (!nNode) continue; 
                    const dist = this.metric(vector, nNode.vector);
                    if (dist < currDist) {
                        currDist = dist;
                        currObj = nNode;
                        changed = true;
                    }
                }
            }
        }

        for (let l = Math.min(level, currLevel); l >= 0; l--) {
            const candidates = await this._searchLayer(currObj, vector, EF_CONSTRUCTION, l);
            const neighbors = this._selectNeighbors(candidates, l === 0 ? M_MAX0 : M);
            
            newNode.neighbors[l] = [];
            for(const n of neighbors) {
                newNode.neighbors[l].push(n.node.id);
                // Bi-directional connection
                await this._addNeighbor(n.node, newNode.id, l);
            }
            if (candidates.length > 0) currObj = candidates[0].node;
        }

        if (currObj && level > currObj.level) { 
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
        }
        else if (this.entryNodeID === -1) {
             this.entryNodeID = nodeId;
             this.meta.entryNodeID = nodeId;
        }
        
        // Auto-flush occasionally to prevent memory explosion
        if (this.dirtyNodes.size > 2000) {
            await this.flushCache();
        }
        
        return nodeId;
    }

    async _addNeighbor(node, neighborID, level) {
        if (!node.neighbors[level]) node.neighbors[level] = [];
        if (node.neighbors[level].includes(neighborID)) return;
        node.neighbors[level].push(neighborID);
        
        const maxM = level === 0 ? M_MAX0 : M;
        if (node.neighbors[level].length > maxM) {
            const nList = [];
            for(const nId of node.neighbors[level]) {
                const n = await this._getNode(nId);
                if (n) nList.push({ id: nId, dist: this.metric(node.vector, n.vector) });
            }
            nList.sort((a, b) => a.dist - b.dist);
            node.neighbors[level] = nList.slice(0, maxM).map(x => x.id);
        }
        
        this.dirtyNodes.add(node.id); // Mark for lazy save
    }

    async flushCache(limit = Infinity) {
        if (this.dirtyNodes.size === 0) return;
        
        const toSave = [];
        let count = 0;
        for (const id of this.dirtyNodes) {
            if (count >= limit) break;
            const node = this.nodeCache.get(id);
            if (node) toSave.push(node);
            count++;
        }

        // B"H: Parallel save 
        await Promise.all(toSave.map(node => this.storage.saveNode(node)));
        
        for(const node of toSave) {
            this.dirtyNodes.delete(node.id);
        }
    }

    async delete(key) {
        const nodeId = await this.keyMap.get(String(key));
        if (nodeId === undefined) return;
        const node = await this._getNode(nodeId);
        if (node) {
            node.deleted = true;
            this.dirtyNodes.add(nodeId);
        }
        await this.keyMap.delete(String(key));
        await this.flushCache(); 
    }

    async _searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set();
        const candidates = new Map();
        if (!entryPoint) return [];

        const entryDist = this.metric(queryVec, entryPoint.vector);
        visited.add(entryPoint.id);
        candidates.set(entryPoint.id, { dist: entryDist, node: entryPoint });
        
        const W = new BinaryHeap(x => x.dist);
        W.push({ dist: entryDist, node: entryPoint });

        let furthestDist = entryDist;

        while (W.size() > 0) {
            const current = W.pop();
            const cDist = current.dist;
            
            if (cDist > furthestDist && candidates.size >= ef) break;

            const neighbors = current.node.neighbors[level] || [];
            for (const nId of neighbors) {
                if (!visited.has(nId)) {
                    visited.add(nId);
                    const nNode = await this._getNode(nId);
                    if (!nNode) continue; 
                    const dist = this.metric(queryVec, nNode.vector);
                    
                    if (candidates.size < ef || dist < furthestDist) {
                         const candidate = { dist, node: nNode };
                         W.push(candidate);
                         candidates.set(nId, candidate);
                         
                         if (dist > furthestDist) furthestDist = dist;

                         if (candidates.size > ef) {
                             let maxD = -1;
                             let maxId = -1;
                             for (const [id, c] of candidates) {
                                 if (c.dist > maxD) {
                                     maxD = c.dist;
                                     maxId = id;
                                 }
                             }
                             if (maxId !== -1) {
                                 candidates.delete(maxId);
                                 furthestDist = 0;
                                 for(const c of candidates.values()) if(c.dist > furthestDist) furthestDist = c.dist;
                             }
                         }
                    }
                }
            }
        }
        return Array.from(candidates.values()).sort((a, b) => a.dist - b.dist);
    }

    _selectNeighbors(candidates, m) { return candidates.slice(0, m); }
}
module.exports = HNSW;

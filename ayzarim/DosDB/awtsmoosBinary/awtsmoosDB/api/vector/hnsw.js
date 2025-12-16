
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
    }

    async _initRegistryCache() {
        // Only load if empty
        if (this.registryPtrs.length > 0) return;
        
        await this.registryHandle.ensureResolved();
        if (this.registryHandle.ptr) {
            const ptr = await SmartPointer.resolve(this.registryHandle.ptr, this.db.allocator);
            const engine = new Sequence(this.db.allocator, ptr);
            const len = await engine.length();
            this.registryPtrs.length = len; // Pre-size
            if (this.db.debug) console.log(`B"H HNSW Registry Init. Length: ${len}`);
        }
    }

    async _getRegistryPtr(index) {
        // B"H: Fast Path - In-Memory Array
        if (this.registryPtrs[index]) return this.registryPtrs[index];
        
        await this._initRegistryCache();
        
        // B"H: FIX - Do NOT use reader.getItem() because it hydrates the CustomInstance (VectorNode),
        // which triggers Dictionary reads and fails if the node is corrupted or not a standard object.
        // We just want the raw pointer Buffer to pass to storage.loadNode.
        
        const childHandle = this.registryHandle.get(index);
        await childHandle.ensureResolved();
        const ptr = childHandle.ptr;
        
        if (ptr && Buffer.isBuffer(ptr) && ptr.length === 16) {
            // Copy to safe buffer
            const copy = Buffer.allocUnsafe(16);
            ptr.copy(copy);
            this.registryPtrs[index] = copy;
            return copy;
        }
        return null;
    }

    async _setRegistryPtr(index, ptr) {
        // Cache immediately
        const copy = Buffer.allocUnsafe(16);
        ptr.copy(copy);
        this.registryPtrs[index] = copy;
        
        // B"H: Use Handle methods to ensure persistence chain is updated (sysVector -> registry)
        const len = await this.registryHandle.length;
        
        if (index >= len) {
            await this.registryHandle.push(copy, { isPtr: true });
        } else {
            await this.registryHandle.set(index, copy, { isPtr: true });
        }
    }

    async _getNode(nodeId) {
        if (nodeId === -1 || nodeId === undefined) return null;
        if (this.nodeCache.has(nodeId)) return this.nodeCache.get(nodeId);

        const ptr = await this._getRegistryPtr(nodeId);
        if (!ptr) {
            // if (this.db.debug) console.log(`B"H HNSW _getNode(${nodeId}) failed: Pointer not found in registry.`);
            return null;
        }
        
        const node = await this.storage.loadNode(ptr);
        
        // B"H: Tombstone Support
        // We return the node EVEN IF DELETED so we can traverse through it.
        // The search logic must filter deleted nodes from final results.
        
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
        
        // Ensure cache is synced
        await this._initRegistryCache();
        
        // ID is next index
        const nodeId = this.registryPtrs.length; 
        
        // Create initial node structure in memory
        const newNodePtr = await this.storage.createNode(vector, level, payloadPtr, nodeId);
        
        // Set Registry (This updates the sequence on disk and in memory cache)
        await this._setRegistryPtr(nodeId, newNodePtr);
        
        await this.keyMap.set(String(key), nodeId); // B"H: Persist Key Mapping
        
        const newNode = await this.storage.loadNode(newNodePtr); 
        this.nodeCache.set(nodeId, newNode);
        this.dirtyNodes.add(nodeId); 
        
        if (this.db.debug) console.log(`[HNSW-DEBUG] Insert Node ${nodeId} (Key: ${key}) Level: ${level}`);

        let currObj = await this._getNode(this.entryNodeID);
        
        // B"H: If entry node is missing (uninitialized), set it.
        // Note: currObj might be deleted (tombstone), which is fine for traversal start.
        if (!currObj) {
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
            if (this.db.debug) console.log(`[HNSW-DEBUG] First Node. Entry Point set to ${nodeId}`);
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
            // _searchLayer filters deleted nodes from 'candidates' result, so we only connect to valid nodes.
            const neighbors = this._selectNeighbors(candidates, l === 0 ? M_MAX0 : M);
            
            newNode.neighbors[l] = [];
            for(const n of neighbors) {
                newNode.neighbors[l].push(n.node.id);
                // Bi-directional connection
                await this._addNeighbor(n.node, newNode.id, l);
            }
            
            if (this.db.debug) console.log(`[HNSW-DEBUG] Node ${nodeId} Layer ${l} connected to: ${newNode.neighbors[l].join(', ')}`);

            if (candidates.length > 0) currObj = candidates[0].node;
        }

        if (currObj && level > currObj.level) { 
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
            if (this.db.debug) console.log(`[HNSW-DEBUG] Entry Point Updated to ${nodeId} (Level ${level} > ${currObj.level})`);
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
                // B"H: If neighbor is deleted, keep it for now (tombstone edge) or prune?
                // Pruning here keeps graph clean.
                if (n && !n.deleted) {
                    nList.push({ id: nId, dist: this.metric(node.vector, n.vector) });
                }
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

        if (this.db.debug && count < 10) { // Log small flushes
             // console.log(`[HNSW-DEBUG] Flushing ${count} nodes: ${toSave.map(n=>n.id).join(', ')}`);
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
            if (this.db.debug) console.log(`[HNSW-DEBUG] Deleting Node ${nodeId} (Key: ${key})`);
            node.deleted = true;
            this.dirtyNodes.add(nodeId);
            
            // B"H: CRITICAL - If we deleted the entry point, we must find a new one.
            if (nodeId === this.entryNodeID) {
                if (this.db.debug) console.log(`[HNSW-DEBUG] Entry node ${nodeId} deleted. Finding replacement...`);
                // B"H: Pass the deleted node so we can inherit its neighbors
                await this._findNewEntryPoint(node);
            }
        }
        await this.keyMap.delete(String(key));
        await this.flushCache(); 
    }
    
    async _findNewEntryPoint(deletedNode = null) {
        // Ensure cache full
        await this._initRegistryCache();
        
        // B"H: Strategy 1 - Heir Apparent
        if (deletedNode && deletedNode.neighbors) {
            let bestCandidate = -1;
            let maxLevel = -1;

            // Check highest levels first
            for (let l = deletedNode.level; l >= 0; l--) {
                const neighbors = deletedNode.neighbors[l];
                if (neighbors && neighbors.length > 0) {
                    for (const nId of neighbors) {
                        const n = await this._getNode(nId);
                        if (n && !n.deleted) {
                            if (n.level > maxLevel) {
                                maxLevel = n.level;
                                bestCandidate = n.id;
                            }
                        }
                    }
                }
                // If we found a candidate in this level or higher, stop (prioritize top-down)
                if (bestCandidate !== -1) break;
            }

            if (bestCandidate !== -1) {
                this.entryNodeID = bestCandidate;
                this.meta.entryNodeID = bestCandidate;
                if (this.db.debug) console.log(`[HNSW-DEBUG] New Entry Point promoted from neighbors: Node ${bestCandidate}`);
                return;
            }
        }

        // B"H: Strategy 2 - Sequential Scan (Fallback)
        const totalNodes = this.registryPtrs.length; 
        for (let i = 0; i < totalNodes; i++) {
            const candidate = await this._getNode(i);
            if (candidate && !candidate.deleted) {
                this.entryNodeID = i;
                this.meta.entryNodeID = i;
                if (this.db.debug) console.log(`[HNSW-DEBUG] New Entry Point found via scan: Node ${i}`);
                return;
            }
        }
        
        // If no nodes left
        this.entryNodeID = -1;
        this.meta.entryNodeID = -1;
        if (this.db.debug) console.log("[HNSW-DEBUG] Graph Empty. Resetting Entry Point.");
    }

    async _validateEntryPoint() {
        // B"H: Self-Healing for Stale Entry Points
        if (this.entryNodeID === -1) {
             await this._findNewEntryPoint();
             return;
        }
        const node = await this._getNode(this.entryNodeID);
        if (!node || node.deleted) {
             if (this.db.debug) console.log(`[HNSW-DEBUG] Stale/Deleted Entry Point ${this.entryNodeID}. Repairing...`);
             await this._findNewEntryPoint(node);
        }
    }

    async _searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set();
        const candidates = new Map();
        if (!entryPoint) return [];

        const entryDist = this.metric(queryVec, entryPoint.vector);
        visited.add(entryPoint.id);
        
        // B"H: Only add to result candidates if NOT deleted.
        // But we ALWAYS push to W (exploration heap) to traverse through tombstones.
        if (!entryPoint.deleted) {
            candidates.set(entryPoint.id, { dist: entryDist, node: entryPoint });
        }
        
        const W = new BinaryHeap(x => x.dist);
        W.push({ dist: entryDist, node: entryPoint });

        let furthestDist = entryDist;
        if (candidates.size === 0) furthestDist = Infinity;

        while (W.size() > 0) {
            const current = W.pop();
            const cDist = current.dist;
            
            // B"H: Relaxed break condition: Only break if we have enough VALID candidates.
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
                         
                         if (!nNode.deleted) {
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
        }
        return Array.from(candidates.values()).sort((a, b) => a.dist - b.dist);
    }

    _selectNeighbors(candidates, m) { return candidates.slice(0, m); }
}
module.exports = HNSW;

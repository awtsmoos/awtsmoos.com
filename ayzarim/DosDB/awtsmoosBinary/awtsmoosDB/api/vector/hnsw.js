
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
        
        this.nodeCache = new Map();
        this.CACHE_LIMIT = 5000; 
        
        // B"H: Persistent Registry Engine
        this.registryEngine = null; 
        this.ptrCache = new Map(); 
        this.PTR_CACHE_LIMIT = 20000;
    }

    async _initRegistryEngine() {
        if (this.registryEngine) return;
        await this.registryHandle.ensureResolved();
        if (this.registryHandle.ptr) {
            const ptr = await SmartPointer.resolve(this.registryHandle.ptr, this.db.allocator);
            this.registryEngine = new Sequence(this.db.allocator, ptr);
        }
    }

    async _getRegistryPtr(index) {
        if (this.ptrCache.has(index)) return this.ptrCache.get(index);
        
        if (!this.registryEngine) await this._initRegistryEngine();
        
        if (this.registryEngine) {
            const ptr = await this.registryEngine.getPtr(index);
            if (ptr) {
                const copy = Buffer.allocUnsafe(16);
                ptr.copy(copy);
                if (this.ptrCache.size >= this.PTR_CACHE_LIMIT) {
                    const first = this.ptrCache.keys().next().value;
                    this.ptrCache.delete(first);
                }
                this.ptrCache.set(index, copy);
                return copy;
            }
        }
        return await this.registryHandle.reader.getItem(index);
    }

    async _getNode(nodeId) {
        if (nodeId === -1 || nodeId === undefined) return null;
        if (this.nodeCache.has(nodeId)) return this.nodeCache.get(nodeId);

        const ptr = await this._getRegistryPtr(nodeId);
        if (!ptr) return null;
        
        const node = await this.storage.loadNode(ptr);
        if (node.deleted) return null;
        
        if (this.nodeCache.size >= this.CACHE_LIMIT) {
            const first = this.nodeCache.keys().next().value;
            this.nodeCache.delete(first);
        }
        this.nodeCache.set(nodeId, node);
        return node;
    }

    async insert(key, vector, payloadPtr) {
        // B"H: Optimization - Batch Mode Check
        const existingNodeID = await this.keyMap.get(String(key));
        if (existingNodeID !== undefined) {
            const oldNode = await this._getNode(existingNodeID);
            if (oldNode) {
                oldNode.deleted = true;
                const deadPtr = await this.storage.saveNode(oldNode);
                if (!deadPtr.equals(oldNode.ptr)) {
                     // We don't really need to update registry for dead node if we mark it in storage
                     // But for consistency:
                     if(this.registryEngine) await this.registryEngine.set(existingNodeID, deadPtr);
                }
            }
        }

        const level = Math.floor(-Math.log(Math.random()) * ML);
        
        if (!this.registryEngine) await this._initRegistryEngine();
        const nodeId = this.registryEngine ? await this.registryEngine.length() : await this.registryHandle.length; 
        
        const newNodePtr = await this.storage.createNode(vector, level, payloadPtr, nodeId);
        
        // B"H: USE FAST APPEND
        if (this.registryEngine) await this.registryEngine.ops.append(newNodePtr);
        else await this.registryHandle.push(newNodePtr);
        
        this.ptrCache.set(nodeId, newNodePtr);
        await this.keyMap.set(String(key), nodeId); 
        
        const newNode = await this.storage.loadNode(newNodePtr);
        this.nodeCache.set(nodeId, newNode);
        
        let currObj = await this._getNode(this.entryNodeID);
        
        if (!currObj) {
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
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
                await this._addNeighbor(n.node, newNode.id, l);
            }
            if (candidates.length > 0) currObj = candidates[0].node;
        }

        // Save updated new node (neighbors changed)
        // Note: saveNode returns SAME pointer if size fits, which vector storage handles.
        await this.storage.saveNode(newNode);
        
        if (level > this.meta.entryNodeID) { 
            this.entryNodeID = nodeId;
            this.meta.entryNodeID = nodeId;
        }
        return nodeId;
    }

    async delete(key) {
        const nodeId = await this.keyMap.get(String(key));
        if (nodeId === undefined) return;
        const node = await this._getNode(nodeId);
        if (node) {
            node.deleted = true;
            await this.storage.saveNode(node);
        }
        await this.keyMap.delete(String(key));
        this.nodeCache.delete(nodeId);
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
        
        await this.storage.saveNode(node);
        this.nodeCache.set(node.id, node);
    }
}
module.exports = HNSW;

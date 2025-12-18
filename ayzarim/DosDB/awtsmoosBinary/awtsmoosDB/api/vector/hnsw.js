
// B"H
const VectorStorage = require('./storage.js');
const { getMetric } = require('./math.js');
const SmartPointer = require('../../utils/smartPointer.js');
const BinaryHeap = require('../../utils/binaryHeap.js');
const Sequence = require('../../structure/sequence/index.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const ReadWriteLock = require('../../core/concurrency.js'); 

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
        this.dirtyNodes = new Set();
        this.CACHE_LIMIT = 20000; 
        
        this.registryPtrs = []; 
        this.dirtyRegistryMin = Infinity;
        this.dirtyRegistryMax = -1;
        
        this.lock = new ReadWriteLock();
        this.onEntryPointChanged = null; // Callback
        
        // B"H: Direct Engine Access for speed
        this.registrySequence = null;
    }

    async _initRegistryCache() {
        await this.registryHandle.ensureResolved(true);
        const currentPtr = this.registryHandle.ptr;
        
        if (this.registrySequence && currentPtr && this.registrySequence.ptr) {
            if (this._ptrsEqual(this.registrySequence.ptr, currentPtr)) {
                return;
            }
        }
        
        if (currentPtr) {
            const ptr = await SmartPointer.resolve(currentPtr, this.db.allocator);
            this.registrySequence = new Sequence(this.db.allocator, ptr);
            const len = await this.registrySequence.length();
            
            if (this.registryPtrs.length < len) {
                this.registryPtrs.length = len;
            }
        } else {
            this.registrySequence = null;
        }
        this._registryInitialized = true;
    }
    
    _ptrsEqual(p1, p2) {
        if (!p1 || !p2) return false;
        if (p1.blockId !== undefined) {
            const decoded = SmartPointer.decode(p2);
            if (!decoded) return false;
            const blockId = readPointer48(decoded.payload, 0);
            const offset = decoded.payload.readUInt32BE(10);
            return p1.blockId === blockId && p1.offset === offset;
        }
        return false;
    }

    async _getRegistryPtr(index) {
        if (this.registryPtrs[index]) return this.registryPtrs[index];
        
        await this._initRegistryCache();
        
        if (this.registrySequence) {
            const ptr = await this.registrySequence.getPtr(index);
            if (ptr) {
                const copy = Buffer.allocUnsafe(16);
                ptr.copy(copy);
                this.registryPtrs[index] = copy;
                return copy;
            }
        }
        
        return null;
    }

    async _setRegistryPtr(index, ptr) {
        const copy = Buffer.allocUnsafe(16);
        ptr.copy(copy);
        this.registryPtrs[index] = copy;
        
        if (index < this.dirtyRegistryMin) this.dirtyRegistryMin = index;
        if (index > this.dirtyRegistryMax) this.dirtyRegistryMax = index;
    }

    async _flushRegistry() {
        if (this.dirtyRegistryMax === -1) return;

        await this.db.batch(async () => {
            const start = this.dirtyRegistryMin;
            const end = this.dirtyRegistryMax;
            
            this.dirtyRegistryMin = Infinity;
            this.dirtyRegistryMax = -1;

            const currentLen = await this.registryHandle.length;
            
            if (start >= currentLen) {
                const items = this.registryPtrs.slice(start, end + 1);
                const validItems = items.map(x => x || Buffer.alloc(16)); 
                await this.registryHandle.splice(currentLen, 0, ...validItems, { isPtr: true, _isAwtsmoosOptions: true });
            } else {
                for(let i = start; i <= end; i++) {
                    if (this.registryPtrs[i]) {
                        const ptr = this.registryPtrs[i];
                        if (i >= await this.registryHandle.length) {
                             await this.registryHandle.push(ptr, { isPtr: true });
                        } else {
                             await this.registryHandle.set(i, ptr, { isPtr: true });
                        }
                    }
                }
            }
        });
        
        this.registrySequence = null;
        this._registryInitialized = false; 
    }

    async _getNode(nodeId) {
        if (nodeId === -1 || nodeId === undefined) return null;
        if (this.nodeCache.has(nodeId)) return this.nodeCache.get(nodeId);

        const ptr = await this._getRegistryPtr(nodeId);
        if (!ptr) return null;
        
        const node = await this.storage.loadNode(ptr);
        // B"H: If corrupt/null, do not cache, do not return
        if (!node) return null;
        
        this._cacheNode(nodeId, node);
        return node;
    }
    
    _cacheNode(nodeId, node) {
        if (this.nodeCache.size >= this.CACHE_LIMIT) {
            for (const [key, val] of this.nodeCache) {
                if (!this.dirtyNodes.has(key)) {
                    this.nodeCache.delete(key);
                    break;
                }
            }
            if (this.nodeCache.size >= this.CACHE_LIMIT) {
                this._forceFlushPartial();
            }
        }
        this.nodeCache.set(nodeId, node);
    }
    
    async _forceFlushPartial() {
        await this.flushCache(100);
    }

    async insertBatch(items) {
        return this.lock.runWrite(async () => {
            await this._initRegistryCache();
            
            let epChanged = false;

            for(const item of items) {
                const { key, vector, payload } = item;
                
                const existingNodeID = await this.keyMap.get(String(key));
                if (existingNodeID !== undefined) {
                    const oldNode = await this._getNode(existingNodeID);
                    if (oldNode) {
                        oldNode.deleted = true;
                        this.dirtyNodes.add(oldNode.id);
                    }
                }

                const level = Math.floor(-Math.log(Math.random()) * ML);
                const nodeId = this.registryPtrs.length; 
                
                const newNodePtr = await this.storage.createNode(vector, level, payload, nodeId);
                await this._setRegistryPtr(nodeId, newNodePtr);
                await this.keyMap.set(String(key), nodeId); 
                
                const newNode = await this.storage.loadNode(newNodePtr); 
                this.nodeCache.set(nodeId, newNode);
                this.dirtyNodes.add(nodeId); 

                let currObj = await this._getNode(this.entryNodeID);
                
                if (!currObj) {
                    this.entryNodeID = nodeId;
                    this.meta.entryNodeID = nodeId;
                    epChanged = true;
                    continue; 
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

                if (currObj && level > currObj.level) { 
                    this.entryNodeID = nodeId;
                    this.meta.entryNodeID = nodeId;
                    epChanged = true;
                }
            }
            
            if (this.dirtyNodes.size > 5000) {
                await this.flushCache();
            }
            
            if (epChanged && this.onEntryPointChanged) {
                await this.onEntryPointChanged(this.entryNodeID);
            }
        });
    }

    async insert(key, vector, payloadPtr) {
        return this.insertBatch([{ key, vector, payload: payloadPtr }]);
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
                if (n && !n.deleted) {
                    nList.push({ id: nId, dist: this.metric(node.vector, n.vector) });
                }
            }
            nList.sort((a, b) => a.dist - b.dist);
            node.neighbors[level] = nList.slice(0, maxM).map(x => x.id);
        }
        
        this.dirtyNodes.add(node.id);
    }

    async flushCache(limit = Infinity) {
        await this._flushRegistry();

        if (this.dirtyNodes.size === 0) return;
        
        const toSave = [];
        let count = 0;
        for (const id of this.dirtyNodes) {
            if (count >= limit) break;
            const node = this.nodeCache.get(id);
            if (node) toSave.push(node);
            count++;
        }

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
            if (nodeId === this.entryNodeID) {
                await this._findNewEntryPoint(node);
            }
        }
        await this.keyMap.delete(String(key));
        await this.flushCache(); 
    }
    
    async _findNewEntryPoint(deletedNode = null) {
        await this._initRegistryCache();
        if (deletedNode && deletedNode.neighbors) {
            let bestCandidate = -1;
            let maxLevel = -1;
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
                if (bestCandidate !== -1) break;
            }
            if (bestCandidate !== -1) {
                this.entryNodeID = bestCandidate;
                this.meta.entryNodeID = bestCandidate;
                if(this.onEntryPointChanged) await this.onEntryPointChanged(bestCandidate);
                return;
            }
        }
        const totalNodes = this.registryPtrs.length; 
        for (let i = 0; i < totalNodes; i++) {
            const candidate = await this._getNode(i);
            if (candidate && !candidate.deleted) {
                this.entryNodeID = i;
                this.meta.entryNodeID = i;
                if(this.onEntryPointChanged) await this.onEntryPointChanged(i);
                return;
            }
        }
        this.entryNodeID = -1;
        this.meta.entryNodeID = -1;
        if(this.onEntryPointChanged) await this.onEntryPointChanged(-1);
    }

    async _validateEntryPoint() {
        if (this.entryNodeID === -1) {
             await this._findNewEntryPoint();
             return;
        }
        const node = await this._getNode(this.entryNodeID);
        if (!node || node.deleted) {
             await this._findNewEntryPoint(node);
        }
    }

    async _searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set();
        const candidates = new Map();
        if (!entryPoint) return [];

        const entryDist = this.metric(queryVec, entryPoint.vector);
        visited.add(entryPoint.id);
        
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

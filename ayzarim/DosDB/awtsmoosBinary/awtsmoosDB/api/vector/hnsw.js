
// B"H
const VectorStorage = require('./storage.js');
const { getMetric } = require('./math.js');
const SmartPointer = require('../../utils/smartPointer.js');

const M = 12; 
const M_MAX0 = 24; 
const EF_CONSTRUCTION = 100;
const ML = 1 / Math.log(M);

class HNSW {
    constructor(db, registry, keyMap, meta) {
        this.db = db;
        this.registry = registry; // Sequence (ID -> NodePtr)
        this.keyMap = keyMap;     // Map (Key -> NodeID)
        this.meta = meta; 
        this.storage = new VectorStorage(db.allocator);
        this.metric = getMetric(meta.metric || 'cosine');
        this.entryNodeID = meta.entryNodeID !== undefined ? meta.entryNodeID : -1;
    }

    async _getNode(nodeId) {
        if (nodeId === -1 || nodeId === undefined) return null;
        const ptr = await this.registry.reader.getItem(nodeId);
        if (!ptr) return null;
        const node = await this.storage.loadNode(ptr);
        if (node.deleted) return null;
        return node;
    }

    async insert(key, vector, payloadPtr) {
        const existingNodeID = await this.keyMap.get(String(key));
        if (existingNodeID !== undefined) {
            const oldNode = await this._getNode(existingNodeID);
            if (oldNode) {
                oldNode.deleted = true;
                const deadPtr = await this.storage.saveNode(oldNode);
                await this.registry.splice(existingNodeID, 1, deadPtr);
            }
        }

        const level = Math.floor(-Math.log(Math.random()) * ML);
        const nodeId = await this.registry.length; 
        const newNodePtr = await this.storage.createNode(vector, level, payloadPtr, nodeId);
        
        await this.registry.push(newNodePtr);
        await this.keyMap.set(String(key), nodeId); 
        
        const newNode = await this.storage.loadNode(newNodePtr); 
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

        const savedPtr = await this.storage.saveNode(newNode);
        await this.registry.splice(nodeId, 1, savedPtr);
        
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
            const ptr = await this.storage.saveNode(node);
            await this.registry.splice(nodeId, 1, ptr);
        }
        await this.keyMap.delete(String(key));
    }

    async _searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set();
        const candidates = new Map();
        if (!entryPoint) return [];

        const entryDist = this.metric(queryVec, entryPoint.vector);
        visited.add(entryPoint.id);
        candidates.set(entryPoint.id, { dist: entryDist, node: entryPoint });
        
        let W = [{ dist: entryDist, node: entryPoint }];

        while (W.length > 0) {
            W.sort((a, b) => a.dist - b.dist);
            const current = W.shift();
            const neighbors = current.node.neighbors[level] || [];
            for (const nId of neighbors) {
                if (!visited.has(nId)) {
                    visited.add(nId);
                    const nNode = await this._getNode(nId);
                    if (!nNode) continue; 
                    const dist = this.metric(queryVec, nNode.vector);
                    if (candidates.size < ef || dist < Array.from(candidates.values()).pop().dist) {
                         W.push({ dist, node: nNode });
                         candidates.set(nId, { dist, node: nNode });
                    }
                }
            }
        }
        const sorted = Array.from(candidates.values()).sort((a, b) => a.dist - b.dist);
        return sorted.slice(0, ef);
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
        const newPtr = await this.storage.saveNode(node);
        await this.registry.splice(node.id, 1, newPtr);
        node.ptr = newPtr; 
    }
}
module.exports = HNSW;


// B"H
const BinaryHeap = require('../../utils/binaryHeap.js');
const M = 12; 
const M_MAX0 = 24; 

module.exports = class HNSW_Ops {
    constructor(hnsw) {
        this.hnsw = hnsw;
    }

    async searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set();
        const candidates = new Map();
        if (!entryPoint) return [];

        const entryDist = this.hnsw.metric(queryVec, entryPoint.vector);
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
                    const nNode = await this.hnsw._getNode(nId);
                    if (!nNode) continue; 
                    
                    const dist = this.hnsw.metric(queryVec, nNode.vector);
                    
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

    selectNeighbors(candidates, m) { return candidates.slice(0, m); }
};

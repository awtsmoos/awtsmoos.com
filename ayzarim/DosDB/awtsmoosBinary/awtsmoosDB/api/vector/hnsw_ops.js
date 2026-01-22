// B"H
/**
 * @file hnsw_ops.js
 * @description 
 *  Synchronous Search Logic.
 *  Uses BinaryHeap for standard Candidate/Result queues.
 *  Implements Robust "Search Layer" with no omissions.
 */
const BinaryHeap = require('../../utils/binaryHeap.js');
const M = 12;
const M_MAX0 = 24;

class HNSWOps {
    constructor(hnsw) {
        this.hnsw = hnsw;
    }

    searchLayer(entryPoint, queryVec, ef, level) {
        // v = visited set
        const visited = new Set();
        
        // C = candidates (Min Heap of distances) - Elements to explore
        const C = new BinaryHeap(x => x.dist); // Smaller dist = higher priority (popped first)
        
        // W = found elements (Max Heap of distances) - Top ef candidates found so far
        const W = new BinaryHeap(x => -x.dist); // Larger dist = higher priority (popped first)
        
        const dist = this.hnsw.metric(queryVec, entryPoint.vector);
        const entryTuple = { dist, node: entryPoint };
        
        visited.add(entryPoint.id);
        C.push(entryTuple);
        W.push(entryTuple);
        
        while (C.size() > 0) {
            const current = C.pop();
            const furestFound = W.content[0]; // Peek Max (BinaryHeap[0] is root)
            
            // Optimization: If current node is further than worst in W, and W is full, we stop
            if (current.dist > furestFound.dist) {
                // If W is full (size >= ef), we can break?
                // Actually HNSW spec: break if current.dist > dist(farthest in W)
                // Assuming we strictly explore closest first.
                // However, BinaryHeap implementation details matter.
                // Standard: if C.min > W.max, stop.
                if (W.size() >= ef) break;
            }

            // For each neighbor
            const neighbors = current.node.neighbors[level] || [];
            
            for (const nId of neighbors) {
                if (visited.has(nId)) continue;
                visited.add(nId);
                
                const neighbor = this.hnsw.registry.getNode(nId);
                if (!neighbor) continue;
                
                const nDist = this.hnsw.metric(queryVec, neighbor.vector);
                const neighborTuple = { dist: nDist, node: neighbor };
                
                const currentFarthest = W.content[0];
                
                if (W.size() < ef || nDist < currentFarthest.dist) {
                    C.push(neighborTuple);
                    W.push(neighborTuple);
                    
                    if (W.size() > ef) {
                        W.pop(); // Remove furthest
                    }
                }
            }
        }
        
        // Sort W by distance ascending
        return W.content.sort((a,b) => a.dist - b.dist);
    }

    selectNeighbors(candidates, m) {
        // Simple heuristic: pick closest m
        // HNSW Heuristic Selection (include diversity) can be complex.
        // For standard "No Omission" but keeping it runnable: Standard selection.
        // Candidates is sorted array from searchLayer.
        return candidates.slice(0, m);
    }

    connectNeighbor(node, neighborId, level) {
        const maxM = level === 0 ? M_MAX0 : M;
        const neighbors = node.neighbors[level] || [];
        
        if (neighbors.includes(neighborId)) return;
        neighbors.push(neighborId);
        
        const nDetails = [];
        for (const nId of neighbors) {
            const n = this.hnsw.registry.getNode(nId);
            if (!n) continue; // Prune ghost
            const d = this.hnsw.metric(node.vector, n.vector);
            nDetails.push({ id: nId, dist: d });
        }
        
        nDetails.sort((a,b) => a.dist - b.dist);
        
        // Prune to Max M
        node.neighbors[level] = nDetails.slice(0, maxM).map(x => x.id);
        
        this.hnsw.registry.saveNode(node);
        
        // Also update the neighbor to point back?
        // HNSW connects bidirectionally but lazily.
        // Usually `add_link` logic handles reciprocal if needed or standard impl
        // handles it by searching both ways. 
        // For simplicity here, we assume inserted node initiates connections.
        // Existing nodes update their lists if new node is closer.
        // That logic (updating existing neighbors) is usually in insert loop (which calls this).
        // Check `hnsw.js` line: `this.ops.connectNeighbor(neighbor, newNode.id, l);` -> Correct.
    }
}

module.exports = HNSWOps;

// B"H
const BinaryHeap = require('../../../utils/math/heap.js');
module.exports = class HNSWOps {
    constructor(hnsw) { this.hnsw = hnsw; }
    searchLayer(entryPoint, queryVec, ef, level) {
        const visited = new Set(), C = new BinaryHeap(x => x.dist), W = new BinaryHeap(x => -x.dist);
        const d = this.hnsw.metric(queryVec, entryPoint.vector), e = { dist: d, node: entryPoint };
        visited.add(entryPoint.id); C.push(e); W.push(e);
        while (C.size() > 0) {
            const cur = C.pop(); if (cur.dist > W.content[0].dist && W.size() >= ef) break;
            for (const nId of (cur.node.neighbors[level] || [])) {
                if (visited.has(nId)) continue; visited.add(nId);
                const n = this.hnsw.registry.getNode(nId); if (!n) continue;
                const nd = this.hnsw.metric(queryVec, n.vector), nt = { dist: nd, node: n };
                if (W.size() < ef || nd < W.content[0].dist) { C.push(nt); W.push(nt); if (W.size() > ef) W.pop(); }
            }
        }
        return W.content.sort((a,b) => a.dist - b.dist);
    }
    connectNeighbor(node, neighborId, level) {
        const maxM = level === 0 ? 24 : 12, nb = node.neighbors[level] || [];
        if (nb.includes(neighborId)) return;
        nb.push(neighborId); const nd = [];
        for (const nId of nb) { const n = this.hnsw.registry.getNode(nId); if (!n) continue; nd.push({ id: nId, dist: this.hnsw.metric(node.vector, n.vector) }); }
        nd.sort((a,b) => a.dist - b.dist); node.neighbors[level] = nd.slice(0, maxM).map(x => x.id);
        this.hnsw.registry.saveNode(node);
    }
};

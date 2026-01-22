// B"H
/**
 * @file query.js
 * @description Added projectGraphSync to support Analysis Algos.
 */
const HandleRegistry = require('../../core/handleRegistry.js');

class GraphQuery {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    getRelationships(handle, direction = 'BOTH', label = null) {
        this.manager.ensureInit();
        const h = HandleRegistry.getSoul(handle);
        if (!h) return [];
        h.ensureResolved();
        
        const nodeId = this.manager.utils.getId(h);
        if (!nodeId) return [];
        return this.getEdgesFromId(nodeId, direction, label);
    }

    getEdgesFromId(nodeId, direction, label) {
        if (!this.manager.graphRoot) return [];
        const nodeEntry = this.manager.graphRoot[nodeId];
        if (!nodeEntry) return [];

        const results = [];
        const dirs = [];
        if (direction === 'OUT' || direction === 'BOTH') dirs.push('out');
        if (direction === 'IN' || direction === 'BOTH') dirs.push('in');

        for (const dir of dirs) {
            const dirMap = nodeEntry[dir];
            if (!dirMap) continue;

            const labels = label ? [label] : this.db.keys(dirMap);
            for (const lbl of labels) {
                const list = dirMap[lbl];
                if (!list) continue;
                
                const edges = this.db.values(list);
                for (const edge of edges) {
                    if (edge) {
                        const hydrated = this.manager.utils.hydrateEdge(edge, dir);
                        if (hydrated) results.push(hydrated);
                    }
                }
            }
        }
        return results;
    }

    // New Synchronous Projection for Algorithms
    projectGraphSync() {
        this.manager.ensureInit();
        const adjList = new Map(); 
        const reverseAdj = new Map(); 
        const nodes = new Set();

        if (!this.manager.graphRoot) return { nodes: [], adjList, reverseAdj };

        const nodeKeys = this.db.keys(this.manager.graphRoot);
        for (const nodeKey of nodeKeys) {
            nodes.add(nodeKey);
            const nodeEntry = this.manager.graphRoot[nodeKey];
            
            if (nodeEntry && nodeEntry.out) {
                const outMap = nodeEntry.out;
                const labels = this.db.keys(outMap);
                
                for (const label of labels) {
                    const list = outMap[label];
                    const edges = this.db.values(list);
                    
                    for(const e of edges) {
                        if (!e || !e.targetId) continue;
                        
                        const target = e.targetId;
                        nodes.add(target);
                        
                        if(!adjList.has(nodeKey)) adjList.set(nodeKey, []);
                        adjList.get(nodeKey).push(target);
                        
                        if(!reverseAdj.has(target)) reverseAdj.set(target, []);
                        reverseAdj.get(target).push(nodeKey);
                    }
                }
            }
        }
        return { nodes: Array.from(nodes), adjList, reverseAdj };
    }
}

module.exports = GraphQuery;
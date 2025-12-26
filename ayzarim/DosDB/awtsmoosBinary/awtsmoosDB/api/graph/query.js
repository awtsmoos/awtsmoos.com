// B"H
const HandleRegistry = require('../../core/handleRegistry.js');

class GraphQuery {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    /**
     * @description Retrieves relationships for a handle, awaiting the ID resolution.
     */
    async getRelationships(handle, direction = 'BOTH', label = null) {
        await this.manager.ensureInit();
        const h = HandleRegistry.getSoul(handle);
        if (!h) return [];
        await h.ensureResolved();
        
        // B"H: getId must be awaited as it performs physical pointer verification.
        const nodeId = await this.manager.utils.getId(h);
        if (!nodeId) return [];
        return await this.getEdgesFromId(nodeId, direction, label);
    }

    async getEdgesFromId(nodeId, direction, label) {
        const results = [];
        const dirs = [];
        if (direction === 'OUT' || direction === 'BOTH') dirs.push('out');
        if (direction === 'IN' || direction === 'BOTH') dirs.push('in');

        const nodeEntry = this.manager.graphRoot[nodeId]; 
        const nodeInt = HandleRegistry.getSoul(nodeEntry);
        await nodeInt.ensureResolved();
        if (!nodeInt.ptr) return [];

        for (const dir of dirs) {
            const dirMap = nodeEntry[dir]; 
            const dirInt = HandleRegistry.getSoul(dirMap);
            await dirInt.ensureResolved();
            if (!dirInt.ptr) continue;

            if (label) {
                const list = dirMap[label]; 
                const listInt = HandleRegistry.getSoul(list);
                await listInt.ensureResolved();
                if (listInt.ptr) {
                    const edges = await list; 
                    if (Array.isArray(edges)) {
                        for (const edge of edges) {
                            results.push(await this.manager.utils.hydrateEdge(edge, dir));
                        }
                    }
                }
            } else {
                const labels = await this.db.keys(dirMap);
                for (const lbl of labels) {
                    const list = dirMap[lbl]; 
                    const edges = await list; 
                    if (Array.isArray(edges)) {
                        for (const edge of edges) {
                            results.push(await this.manager.utils.hydrateEdge(edge, dir));
                        }
                    }
                }
            }
        }
        return results;
    }

    async projectGraph() {
        await this.manager.ensureInit();
        const adjList = new Map(); 
        const reverseAdj = new Map(); 
        const nodes = new Set();

        const nodeKeys = await this.db.keys(this.manager.graphRoot);
        for (const nodeKey of nodeKeys) {
            nodes.add(nodeKey);
            const nodeEntry = this.manager.graphRoot[nodeKey];
            const outMap = nodeEntry['out'];
            const outInt = HandleRegistry.getSoul(outMap);
            await outInt.ensureResolved();
            
            if (outInt.ptr) {
                const labels = await this.db.keys(outMap);
                for (const label of labels) {
                    const list = outMap[label];
                    const edges = await list; 
                    for(const e of edges) {
                        const target = e.targetId;
                        nodes.add(target); 
                        
                        if(!adjList.has(nodeKey)) adjList.set(nodeKey, []);
                        adjList.get(nodeKey).push(target);
                        
                        if(!reverseAdj.has(target)) reverseAdj.set(target, []);
                        reverseAdj.set(target, []);
                        reverseAdj.get(target).push(nodeKey);
                    }
                }
            }
        }
        return { nodes: Array.from(nodes), adjList, reverseAdj };
    }
}

module.exports = GraphQuery;
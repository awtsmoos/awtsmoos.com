// B"H
const HandleRegistry = require('../../core/handleRegistry.js');
const constants = require('../../constants.js');

/**
 * @class GraphPersistence
 * @description
 *  The Scribe of the Connections. Handles the physical storage of nodes and edges.
 */
class GraphPersistence {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    /**
     * @description Manifests a connection between two nodes in the graph.
     */
    async connect(sourceHandle, targetHandle, label, props = {}) {
        await this.db.batch(async () => {
            await this.manager.ensureInit();
            
            const src = HandleRegistry.getSoul(sourceHandle);
            const tgt = HandleRegistry.getSoul(targetHandle);
            
            // B"H: Ensure souls are fully resolved before identifying them.
            await Promise.all([
                src ? src.ensureResolved(true) : Promise.resolve(),
                tgt ? tgt.ensureResolved(true) : Promise.resolve()
            ]);

            const sourceId = this.manager.utils.getId(sourceHandle);
            const targetId = this.manager.utils.getId(targetHandle);
            
            if (!sourceId || !targetId) {
                throw new Error("B\"H: Object cannot be a Graph Node (Unresolved or Invalid Pointer).");
            }

            await this._ensureNode(sourceId);
            await this._ensureNode(targetId);

            const edge = { 
                targetId, sourceId, label, props, timestamp: Date.now(),
                sourcePtr: src.ptr,
                targetPtr: tgt.ptr,
                sourceType: src.type,
                targetType: tgt.type
            };
            
            await this._addEdge(sourceId, "out", label, edge);
            await this._addEdge(targetId, "in", label, edge);
        });
    }

    /**
     * @description Ensures a specific ID is represented in the __graph__ map.
     */
    async _ensureNode(nodeId) {
        let rootInt = HandleRegistry.getSoul(this.manager.graphRoot);
        await rootInt.ensureResolved();
        
        if (!rootInt.ptr) {
            this.manager.graphRoot = null;
            await this.manager.ensureInit();
            rootInt = HandleRegistry.getSoul(this.manager.graphRoot);
            await rootInt.ensureResolved(true);
        }
        
        const nodeEntry = rootInt.nav.navigate(nodeId);
        const internal = HandleRegistry.getSoul(nodeEntry);
        await internal.ensureResolved();
        
        if (!internal.ptr) {
            await this.db.createMap(this.manager.graphRoot, nodeId);
            await internal.ensureResolved(true);
            const newNode = this.manager.graphRoot[nodeId]; 
            await this.db.createMap(newNode, "in");
            await this.db.createMap(newNode, "out");
        }
    }

    async _addEdge(nodeId, dir, label, edge) {
        const nodeEntry = this.manager.graphRoot[nodeId];
        const dirMap = nodeEntry[dir]; 
        const labelList = dirMap[label]; 
        
        const listInt = HandleRegistry.getSoul(labelList);
        await listInt.ensureResolved();
        
        if (!listInt.ptr) {
            await this.db.createList(dirMap, label);
            const newList = dirMap[label];
            await newList.push(edge);
        } else {
            await labelList.push(edge);
        }
    }

    /**
     * @description
     *  Relocates node metadata when a physical pointer changes.
     *  Essential for pointer-based IDs surviving compaction.
     */
    async _relocateNode(oldId, newId) {
        if (oldId === newId) return;
        await this.db.batch(async () => {
            await this.manager.ensureInit();
            const exists = await this.db.has(this.manager.graphRoot, oldId);
            if (!exists) return;

            const data = await this.manager.graphRoot[oldId];
            await this.manager.graphRoot.set(newId, data);
            await this.manager.graphRoot.delete(oldId);
        });
    }

    /**
     * @description Severs a node from the graph and cleans all its edges.
     */
    async deleteNode(nodeIdentifier) {
        await this.db.batch(async () => {
            await this.manager.ensureInit();
            
            const soul = HandleRegistry.getSoul(nodeIdentifier);
            if (soul) await soul.ensureResolved(true);

            const nodeId = this.manager.utils.getId(nodeIdentifier);
            
            if (!nodeId) return;

            const nodeEntry = this.manager.graphRoot[nodeId];
            const nodeInt = HandleRegistry.getSoul(nodeEntry);
            await nodeInt.ensureResolved(true); // Force check existence
            
            if (!nodeInt.ptr) return; 

            // Clean incoming edges from other nodes
            await this._cleanEdges(nodeEntry, "in", "out", nodeId);
            // Clean outgoing edges from other nodes
            await this._cleanEdges(nodeEntry, "out", "in", nodeId);

            await this.manager.graphRoot.delete(nodeId);
        });
    }

    async _cleanEdges(nodeEntry, myDir, otherDir, myId) {
        const map = nodeEntry[myDir];
        const mapInt = HandleRegistry.getSoul(map);
        await mapInt.ensureResolved();
        
        if (mapInt.ptr) {
            const labels = await this.db.keys(map);
            for (const label of labels) {
                const list = map[label]; 
                const edges = await list; 
                if (Array.isArray(edges)) {
                    for (const edge of edges) {
                        if (edge) {
                            const otherId = (myDir === 'in') ? edge.sourceId : edge.targetId;
                            await this._removeEdgeFromOther(otherId, otherDir, edge.label, myId);
                        }
                    }
                }
            }
        }
    }

    /**
     * @description 
     *  Defensively removes an edge from a neighbor. 
     *  Ensures neighbor still exists before writing to avoid path errors.
     */
    async _removeEdgeFromOther(otherId, dir, label, targetNodeIdToRemove) {
        const otherNode = this.manager.graphRoot[otherId];
        const otherInt = HandleRegistry.getSoul(otherNode);
        await otherInt.ensureResolved(true); // Ensure neighbor is still in index
        if (!otherInt.ptr) return; // Neighbor gone, no work to do

        const dirMap = otherNode[dir];
        const dirInt = HandleRegistry.getSoul(dirMap);
        await dirInt.ensureResolved(true);
        if (!dirInt.ptr) return;

        const listHandle = dirMap[label]; 
        const listInt = HandleRegistry.getSoul(listHandle);
        await listInt.ensureResolved();
        if (!listInt.ptr) return;

        const edges = await listHandle;
        if (!Array.isArray(edges)) return;

        const targetStr = String(targetNodeIdToRemove);
        const filtered = edges.filter(edge => {
            if (!edge) return false;
            const match = (dir === 'out' && String(edge.targetId) === targetStr) ||
                          (dir === 'in' && String(edge.sourceId) === targetStr);
            return !match;
        });

        if (filtered.length === 0) {
            await dirMap.delete(label); // Cleanup label map if empty
        } else if (filtered.length !== edges.length) {
            await dirMap.set(label, filtered);
        }
    }
}

module.exports = GraphPersistence;
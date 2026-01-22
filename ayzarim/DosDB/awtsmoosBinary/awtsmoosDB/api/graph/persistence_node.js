// B"H
/**
 * @file persistence_node.js
 * @description
 *  Handles Node Deletion and Relocation synchronously.
 */
const HandleRegistry = require('../../core/handleRegistry.js');

class NodeOps {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    deleteNode(nodeIdentifier) {
        this.db.batch(() => {
            this.manager.ensureInit();
            if (!this.db.root || !this.manager.graphRoot) return;

            const nodeId = this.manager.utils.getId(nodeIdentifier);
            if (!nodeId) return;

            // Direct property access triggers synchronous resolution
            const nodeEntry = this.manager.graphRoot[nodeId];
            if (!nodeEntry) return;

            // Check if physically exists (Sync check)
            const soul = HandleRegistry.getSoul(nodeEntry);
            if (soul) soul.ensureResolved(); 
            // In Sync mode, 'ensureResolved' completes immediately.

            // Clean Edges
            this._cleanEdges(nodeEntry, "in", "out", nodeId);
            this._cleanEdges(nodeEntry, "out", "in", nodeId);

            // Delete from Graph Map
            delete this.manager.graphRoot[nodeId];
        });
    }

    relocateNode(oldId, newId) {
        if (oldId === newId) return;
        this.db.batch(() => {
            this.manager.ensureInit();
            if (!this.manager.graphRoot) return;

            // Synchronous check
            if (this.manager.graphRoot[oldId]) {
                const data = this.manager.graphRoot[oldId];
                this.manager.graphRoot[newId] = data;
                delete this.manager.graphRoot[oldId];
            }
        });
    }

    _cleanEdges(nodeEntry, myDir, otherDir, myId) {
        if (!nodeEntry) return;
        const dirMap = nodeEntry[myDir];
        if (!dirMap) return;

        // Iterate Labels synchronously
        const labels = this.db.keys(dirMap);
        
        for (const label of labels) {
            const list = dirMap[label];
            // Get all edge objects synchronously
            const edges = this.db.values(list);
            
            for (const edge of edges) {
                if (edge) {
                    const otherId = (myDir === 'in') ? edge.sourceId : edge.targetId;
                    if (otherId) {
                        this._removeEdgeFromOther(otherId, otherDir, edge.label, myId);
                    }
                }
            }
        }
    }

    _removeEdgeFromOther(otherId, dir, label, targetNodeIdToRemove) {
        if (!this.manager.graphRoot) return;
        
        const otherNode = this.manager.graphRoot[otherId];
        if (!otherNode) return;

        const dirMap = otherNode[dir];
        if (!dirMap) return;

        const listHandle = dirMap[label];
        if (!listHandle) return;

        // Get array copy
        const edges = this.db.values(listHandle);
        const targetStr = String(targetNodeIdToRemove);

        const filtered = edges.filter(edge => {
            if (!edge) return false;
            const match = (dir === 'out' && String(edge.targetId) === targetStr) ||
                          (dir === 'in' && String(edge.sourceId) === targetStr);
            return !match;
        });

        if (filtered.length !== edges.length) {
            if (filtered.length === 0) {
                delete dirMap[label];
            } else {
                // Update list: in sync mode, we can replace the array content
                // Or create new list. For safety, overwriting the key creates a new sequence.
                dirMap[label] = filtered; 
            }
        }
    }
}

module.exports = NodeOps;
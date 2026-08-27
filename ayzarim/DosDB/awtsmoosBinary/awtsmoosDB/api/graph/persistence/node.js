
// B"H
/**
 * @file node.js
 * @description
 * Chapter 14: The Angel of Deletion and Relocation
 * Safely annihilates nodes and severs their links from the web of existence.
 */

const HandleRegistry = require('../../../core/registry/handle.js');

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

            const nodeEntry = this.manager.graphRoot[nodeId];
            if (!nodeEntry) return;

            const soul = HandleRegistry.getSoul(nodeEntry);
            if (soul) soul.ensureResolved(); 

            this._cleanEdges(nodeEntry, "in", "out", nodeId);
            this._cleanEdges(nodeEntry, "out", "in", nodeId);

            delete this.manager.graphRoot[nodeId];
        });
    }

    relocateNode(oldId, newId) {
        if (oldId === newId) return;
        this.db.batch(() => {
            this.manager.ensureInit();
            if (!this.manager.graphRoot) return;

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

        const labels = this.db.keys(dirMap);
        
        for (const label of labels) {
            const list = dirMap[label];
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
                dirMap[label] = filtered; 
            }
        }
    }
}

module.exports = NodeOps;

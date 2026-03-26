
// B"H
/**
 * @file edge.js
 * @description 
 * Chapter 15: The Binder of Worlds
 * Synchronously weaves connections between isolated data points.
 */

const HandleRegistry = require('../../../core/registry/handle.js');
const Logger = require('../../../utils/centralLogger.js');

class EdgeOps {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    connect(sourceHandle, targetHandle, label, props = {}) {
        this.manager.ensureInit();
        
        const src = HandleRegistry.getSoul(sourceHandle);
        const tgt = HandleRegistry.getSoul(targetHandle);
        
        if (!src || !tgt) throw new Error("B\"H Fatal: Invalid Handles for Graph Connect");
        
        src.ensureResolved(true);
        tgt.ensureResolved(true);

        const sourceId = this.manager.utils.getId(sourceHandle);
        const targetId = this.manager.utils.getId(targetHandle);
        
        if (!sourceId || !targetId) {
            throw new Error("B\"H: Object cannot be a Graph Node.");
        }

        this._ensureNodeEntry(sourceId);
        this._ensureNodeEntry(targetId);

        const edge = { 
            targetId, sourceId, label, props, timestamp: Date.now(),
            sourcePtr: src.ptr,
            targetPtr: tgt.ptr,
            sourceType: src.type,
            targetType: tgt.type
        };
        
        this._addEdgeToNode(sourceId, "out", label, edge);
        this._addEdgeToNode(targetId, "in", label, edge);
    }

    _ensureNodeEntry(nodeId) {
        const root = this.manager.graphRoot; 
        let nodeEntry = root[nodeId]; 
        
        if (!nodeEntry) {
            root[nodeId] = new this.db.Map();
            nodeEntry = root[nodeId];
        }
        
        if (!nodeEntry.in) nodeEntry.in = new this.db.Map();
        if (!nodeEntry.out) nodeEntry.out = new this.db.Map();
    }

    _addEdgeToNode(nodeId, dir, label, edge) {
        const nodeEntry = this.manager.graphRoot[nodeId];
        const dirMap = nodeEntry[dir]; 
        
        let listHandle = dirMap[label];
        
        if (!listHandle) {
            dirMap[label] = new this.db.List();
            listHandle = dirMap[label];
        }
        
        listHandle.push(edge);
    }
}

module.exports = EdgeOps;

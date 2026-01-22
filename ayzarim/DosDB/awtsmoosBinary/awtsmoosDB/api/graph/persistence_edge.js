// B"H
/**
 * @file persistence_edge.js
 * @description Logic for connecting nodes.
 * STRICTLY SYNCHRONOUS.
 */
const HandleRegistry = require('../../core/handleRegistry.js');
const Logger = require('../../utils/centralLogger.js');

class EdgeOps {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    connect(sourceHandle, targetHandle, label, props = {}) {
        this.manager.ensureInit();
        
        const src = HandleRegistry.getSoul(sourceHandle);
        const tgt = HandleRegistry.getSoul(targetHandle);
        
        if (!src || !tgt) throw new Error("B\"H: Invalid Handles for Graph Connect");
        
        src.ensureResolved(true);
        tgt.ensureResolved(true);

        const sourceId = this.manager.utils.getId(sourceHandle);
        const targetId = this.manager.utils.getId(targetHandle);
        
        if (!sourceId || !targetId) {
            throw new Error("B\"H: Object cannot be a Graph Node (ID generation failed).");
        }

        // 1. Ensure Nodes Exist
        this._ensureNodeEntry(sourceId);
        this._ensureNodeEntry(targetId);

        // 2. Create Edge Data
        const edge = { 
            targetId, sourceId, label, props, timestamp: Date.now(),
            sourcePtr: src.ptr,
            targetPtr: tgt.ptr,
            sourceType: src.type,
            targetType: tgt.type
        };
        
        // 3. Add to Outgoing (Source) and Incoming (Target) synchronously
        this._addEdgeToNode(sourceId, "out", label, edge);
        this._addEdgeToNode(targetId, "in", label, edge);
    }

    _ensureNodeEntry(nodeId) {
        // Direct access to graph root Map
        const root = this.manager.graphRoot; // Already verified in manager.ensureInit
        
        // Check synchronously using LiveHandle API (internally it does cache checks)
        // Optimization: Access property directly triggers lookup
        let nodeEntry = root[nodeId]; 
        
        if (!nodeEntry) {
            // Assign new Map
            root[nodeId] = new this.db.Map();
            // In synchronous mode, this assignment executes fully. 
            // The LiveHandle for 'nodeId' is now available.
            nodeEntry = root[nodeId];
        }
        
        // Check for direction buckets
        if (!nodeEntry.in) nodeEntry.in = new this.db.Map();
        if (!nodeEntry.out) nodeEntry.out = new this.db.Map();
    }

    _addEdgeToNode(nodeId, dir, label, edge) {
        const nodeEntry = this.manager.graphRoot[nodeId];
        const dirMap = nodeEntry[dir]; // "in" or "out" bucket
        
        // Check if list for this label exists
        let listHandle = dirMap[label];
        
        if (!listHandle) {
            // Create list
            dirMap[label] = new this.db.List();
            listHandle = dirMap[label];
        }
        
        // Push edge to list
        listHandle.push(edge);
    }
}

module.exports = EdgeOps;
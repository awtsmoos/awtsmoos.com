
// B"H
/**
 * @file persistence.js
 * @description
 *  Delegator for persistence operations.
 */
const NodeOps = require('./persistence/node.js');
const EdgeOps = require('./persistence/edge.js');

class GraphPersistence {
    constructor(manager) {
        this.nodeOps = new NodeOps(manager);
        this.edgeOps = new EdgeOps(manager);
    }

    connect(src, tgt, label, props) {
        this.edgeOps.connect(src, tgt, label, props);
    }

    deleteNode(nodeIdentifier) {
        this.nodeOps.deleteNode(nodeIdentifier);
    }

    _relocateNode(oldId, newId) {
        this.nodeOps.relocateNode(oldId, newId);
    }
}

module.exports = GraphPersistence;

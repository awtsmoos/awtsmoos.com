// B"H
/**
 * @file index.js
 * @description 
 *  Refactored to route to split files.
 */
const HandleRegistry = require('../../core/handleRegistry.js');
const GraphUtils = require('./utils.js');
const GraphPersistence = require('./persistence.js');
const GraphQuery = require('./query.js');
const AlgoPath = require('./algo_path.js');
const AlgoAnalysis = require('./algo_analysis.js');

class GraphManager {
    constructor(db) {
        this.db = db;
        this.graphRoot = null;
        
        this.utils = new GraphUtils(this);
        this.persistence = new GraphPersistence(this);
        this.query = new GraphQuery(this);
        this.algoPath = new AlgoPath(this);
        this.algoAnalysis = new AlgoAnalysis(this);
    }

    ensureInit() {
        if (!this.db || !this.db.root) return;

        if (!this.graphRoot) {
            // Synchronous check using new API
            if (!this.db.has(this.db.root, "__graph__")) {
                this.db.root.__graph__ = new this.db.Map();
            }
            this.graphRoot = this.db.root.__graph__;
        }
    }

    // --- Synchronous Facade ---

    connect(src, tgt, label, props) {
        this.persistence.connect(src, tgt, label, props);
    }

    deleteNode(nodeIdentifier) {
        this.persistence.deleteNode(nodeIdentifier);
    }

    getRelationships(handle, direction, label) {
        return this.query.getRelationships(handle, direction, label);
    }

    // Algo Methods routed to sub-modules
    shortestPath(start, end, options) {
        return this.algoPath.shortestPath(start, end, options);
    }

    traverse(start, visitor, options) {
        this.algoPath.traverse(start, visitor, options);
    }

    pageRank(options) {
        return this.algoAnalysis.pageRank(options);
    }

    // Internal hooks
    _relocateNode(oldId, newId) {
        this.persistence._relocateNode(oldId, newId);
    }
}

module.exports = GraphManager;
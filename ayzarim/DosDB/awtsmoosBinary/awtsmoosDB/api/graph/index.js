// B"H
const HandleRegistry = require('../../core/handleRegistry.js');
const GraphUtils = require('./utils.js');
const GraphPersistence = require('./persistence.js');
const GraphQuery = require('./query.js');
const GraphAlgorithms = require('./algo.js');

/**
 * @class GraphManager
 * @description
 *  The Sefirah of Da'at - The Unification of Knowledge.
 *  Manages the mystical connections between disparate vessels in the database.
 */
class GraphManager {
    constructor(db) {
        this.db = db;
        this.graphRoot = null;
        
        // Initialize sub-modules
        this.utils = new GraphUtils(this);
        this.persistence = new GraphPersistence(this);
        this.query = new GraphQuery(this);
        this.algo = new GraphAlgorithms(this);
    }

    /**
     * @description Ensures the __graph__ index vessel is manifested in the root.
     */
    async ensureInit() {
        if (this.graphRoot) {
            const h = HandleRegistry.getSoul(this.graphRoot);
            await h.ensureResolved();
            if (h.ptr) return;
        }
        
        const hasGraph = await this.db.has(this.db.root, "__graph__");
        if (!hasGraph) {
            await this.db.createMap(this.db.root, "__graph__");
        }
        this.graphRoot = this.db.root.__graph__;
    }

    // --- Facade Methods ---

    async connect(src, tgt, label, props) {
        return this.persistence.connect(src, tgt, label, props);
    }

    async deleteNode(nodeIdentifier) {
        return this.persistence.deleteNode(nodeIdentifier);
    }

    async getRelationships(handle, direction, label) {
        return this.query.getRelationships(handle, direction, label);
    }

    async shortestPath(start, end, options) {
        return this.algo.shortestPath(start, end, options);
    }

    async traverse(start, visitor, options) {
        return this.algo.traverse(start, visitor, options);
    }

    async pageRank(options) {
        return this.algo.pageRank(options);
    }

    async communityDetection(options) {
        return this.algo.communityDetection(options);
    }

    async centrality() {
        return this.algo.centrality();
    }
    
    /**
     * @description Bubbling hook called when a node's physical pointer changes.
     * Ensures the graph index remains synchronized with the physical realm.
     */
    async _relocateNode(oldId, newId) {
        return this.persistence._relocateNode(oldId, newId);
    }

    async _getEdgesFromId(id, dir, label) {
        return this.query.getEdgesFromId(id, dir, label);
    }
}

module.exports = GraphManager;
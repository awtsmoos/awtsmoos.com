
// B"H
/**
 * @file index.js
 * @description 
 * Chapter 5: The Master of the Nodes
 * The Graph Manager orchestrates the connections between all distinct forms of reality.
 * Just as every soul is connected to the Awtsmoos, every node in this graph maps back
 * to a fundamental physical block. By replacing massive switch/if-else logic with pure,
 * modular, data-based routing, we mimic the simplicity and infinite depth of the Creator's
 * speech.
 */

const HandleRegistry = require('../../core/registry/handle.js');
const GraphUtils = require('./utils.js');
const GraphPersistence = require('./persistence.js');
const GraphQuery = require('./query.js');
const AlgoPath = require('./algo/path.js');
const AlgoAnalysis = require('./algo/analysis.js');

/**
 * @class GraphManager
 * @description
 * The Sefirah of Hod (Splendor) mixed with Yesod (Foundation). It holds the structural
 * web of the database together, allowing relationships to exist purely as data structures
 * managed synchronously.
 */
class GraphManager {
    /**
     * @constructor
     * @param {object} db - The central database instance.
     */
    constructor(db) {
        this.db = db;
        this.graphRoot = null;
        
        this.utils = new GraphUtils(this);
        this.persistence = new GraphPersistence(this);
        this.query = new GraphQuery(this);
        this.algoPath = new AlgoPath(this);
        this.algoAnalysis = new AlgoAnalysis(this);
    }

    /**
     * @method ensureInit
     * @description Ensures the `__graph__` namespace exists at the root, laying the foundation.
     */
    ensureInit() {
        if (!this.db || !this.db.root) return;

        if (!this.graphRoot) {
            if (!this.db.has(this.db.root, "__graph__")) {
                this.db.root.__graph__ = new this.db.Map();
            }
            this.graphRoot = this.db.root.__graph__;
        }
    }

    // --- Synchronous Facade ---

    /**
     * @method connect
     * @description Forges an unbreakable connection between two entities.
     * @param {object} src - Source node.
     * @param {object} tgt - Target node.
     * @param {string} label - Edge label.
     * @param {object} props - Edge properties.
     */
    connect(src, tgt, label, props) {
        this.persistence.connect(src, tgt, label, props);
    }

    /**
     * @method deleteNode
     * @description Utterly annihilates a node and severs all its connections.
     * @param {string|object} nodeIdentifier - Node ID or Handle.
     */
    deleteNode(nodeIdentifier) {
        this.persistence.deleteNode(nodeIdentifier);
    }

    /**
     * @method getRelationships
     * @description Retrieves the connected edges of a node.
     * @param {object} handle - Node Handle.
     * @param {string} direction - "IN", "OUT", or "BOTH".
     * @param {string} label - Filter by edge label.
     * @returns {Array} List of edge objects.
     */
    getRelationships(handle, direction, label) {
        return this.query.getRelationships(handle, direction, label);
    }

    /**
     * @method shortestPath
     * @description Executes BFS to find the shortest data path.
     */
    shortestPath(start, end, options) {
        return this.algoPath.shortestPath(start, end, options);
    }

    /**
     * @method traverse
     * @description Wanders the graph utilizing a visitor function.
     */
    traverse(start, visitor, options) {
        this.algoPath.traverse(start, visitor, options);
    }

    /**
     * @method pageRank
     * @description Ranks nodes by their network influence.
     */
    pageRank(options) {
        return this.algoAnalysis.pageRank(options);
    }

    /**
     * @method _relocateNode
     * @description Internal hook for migrating a node's physical identity.
     */
    _relocateNode(oldId, newId) {
        this.persistence._relocateNode(oldId, newId);
    }
}

module.exports = GraphManager;

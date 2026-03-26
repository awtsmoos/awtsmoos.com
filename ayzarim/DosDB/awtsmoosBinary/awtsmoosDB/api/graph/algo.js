
// B"H
/**
 * @file algo.js
 * @description
 * Chapter 4: The Web of the Sephirot
 * Just as the Sefirot are interconnected via the 22 holy letters, forming the Tree of Life,
 * this module algorithms the paths and connections within the data. Every connection
 * is sustained by the Word of the Creator, without which the nodes would drift into
 * the abyss of nothingness. We traverse these paths seeking the hidden unity of the Awtsmoos.
 */

const HandleRegistry = require('../../core/registry/handle.js');

/**
 * @class GraphAlgorithms
 * @description
 * Exposes divine search, PageRank, and community detection algorithms over
 * the interconnected LiveHandles of the database. Nullifies its own logic 
 * to follow pure data-driven graph structures.
 */
class GraphAlgorithms {
    /**
     * @constructor
     * @param {object} manager - The parent GraphManager.
     */
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * @method shortestPath
     * @description
     * Finds the shortest path between two vessels using BFS.
     * The Awtsmoos guides the search through the shortest sequence of manifestations.
     * @param {object} startHandle - The origin soul.
     * @param {object} endHandle - The destination soul.
     * @param {object} options - Search configurations.
     * @returns {Promise<Array|null>} The path array or null.
     */
    async shortestPath(startHandle, endHandle, options = {}) {
        await this.manager.ensureInit();
        
        const s = HandleRegistry.getSoul(startHandle);
        const e = HandleRegistry.getSoul(endHandle);
        
        if (!s || !e) return null;
        
        await s.ensureResolved();
        await e.ensureResolved();

        const startId = await this.manager.utils.getId(s);
        const endId = await this.manager.utils.getId(e);
        
        console.log(`B"H [GRAPH_ALGO] ShortestPath: ${startId} -> ${endId}`);

        const maxDepth = options.maxDepth || 5;
        const direction = options.direction || 'OUT';
        const label = options.label || null;

        if (!startId || !endId) {
            console.log(`B"H [GRAPH_ALGO] Invalid IDs. Start: ${startId}, End: ${endId}`);
            return null;
        }
        
        if (startId === endId) return [{ node: startHandle }];

        const queue = [ { id: startId, path: [ { node: startHandle } ] } ];
        const visited = new Set([startId]);

        while(queue.length > 0) {
            const current = queue.shift();
            const { id, path } = current;
            
            if (path.length > maxDepth + 1) continue;

            const edges = await this.manager.query.getEdgesFromId(id, direction, label);
            
            for(const edgeObj of edges) {
                const neighborHandle = edgeObj.node;
                const neighborId = edgeObj.id; 
                
                if (!neighborId) continue;

                if (neighborId === endId) {
                    console.log(`B"H [GRAPH_ALGO] Found path! Length: ${path.length + 1}`);
                    return [...path, { edge: edgeObj, node: neighborHandle }];
                }
                
                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ 
                        id: neighborId, 
                        path: [...path, { edge: edgeObj, node: neighborHandle }] 
                    });
                }
            }
        }
        console.log("B\"H [GRAPH_ALGO] No path found.");
        return null;
    }

    /**
     * @method traverse
     * @description Wanders through the graph, executing a visitor on every encountered node.
     * @param {object} startHandle - Starting node.
     * @param {function} visitor - Callback executed per node.
     * @param {object} options - Defines max depth and strategy.
     */
    async traverse(startHandle, visitor, options = {}) {
        await this.manager.ensureInit();
        
        const s = HandleRegistry.getSoul(startHandle);
        if (!s) return;
        await s.ensureResolved();

        const startId = await this.manager.utils.getId(s);
        const maxDepth = options.maxDepth || 3;
        const direction = options.direction || 'OUT';
        const strategy = options.strategy || 'BFS'; 

        const stack = [ { id: startId, handle: startHandle, depth: 0 } ]; 
        const visited = new Set([startId]);

        while(stack.length > 0) {
            const current = (strategy === 'DFS') ? stack.pop() : stack.shift();
            const stop = await visitor(current.handle, current.depth);
            if (stop === true) return;
            
            if (current.depth >= maxDepth) continue;

            const edges = await this.manager.query.getEdgesFromId(current.id, direction, null);
            for(const edge of edges) {
                const neighborHandle = edge.node;
                const neighborId = edge.id; 
                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    stack.push({ id: neighborId, handle: neighborHandle, depth: current.depth + 1 });
                }
            }
        }
    }

    /**
     * @method pageRank
     * @description Calculates the influence of each node in the network.
     * @param {object} options - Damping factor and iterations.
     * @returns {Promise<Array>} Sorted array of node scores.
     */
    async pageRank(options = {}) {
        const damping = options.damping || 0.85;
        const iterations = options.iterations || 20;
        const { nodes, reverseAdj, adjList } = await this.manager.query.projectGraph();
        
        let scores = new Map();
        nodes.forEach(n => scores.set(n, 1.0 / nodes.length));
        
        for(let i=0; i<iterations; i++) {
            const newScores = new Map();
            let sinkScore = 0;
            
            for(const n of nodes) {
                if(!adjList.has(n) || adjList.get(n).length === 0) {
                    sinkScore += scores.get(n);
                }
            }
            
            for(const n of nodes) {
                let rank = (1 - damping) / nodes.length;
                rank += (damping * sinkScore / nodes.length);
                
                const incoming = reverseAdj.get(n) || [];
                for(const src of incoming) {
                    const srcOutDegree = adjList.get(src).length;
                    rank += damping * (scores.get(src) / srcOutDegree);
                }
                newScores.set(n, rank);
            }
            scores = newScores;
        }
        
        const sorted = Array.from(scores.entries()).sort((a,b) => b[1] - a[1]);
        return sorted.map(([id, score]) => ({ id, score }));
    }

    /**
     * @method communityDetection
     * @description Clusters nodes into natural groupings based on structural connectivity.
     * @param {object} options - Iteration limits.
     * @returns {Promise<Array>} Array of community arrays.
     */
    async communityDetection(options = {}) {
        const iterations = options.iterations || 10;
        const { nodes, adjList, reverseAdj } = await this.manager.query.projectGraph();
        
        const labels = new Map();
        nodes.forEach((n, i) => labels.set(n, i)); 
        
        const shuffled = [...nodes];
        
        for(let i=0; i<iterations; i++) {
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }

            let changeCount = 0;
            for(const n of shuffled) {
                const neighbors = [ ...(adjList.get(n)||[]), ...(reverseAdj.get(n)||[]) ];
                if(neighbors.length === 0) continue;

                const counts = new Map();
                for(const neighbor of neighbors) {
                    const l = labels.get(neighbor);
                    counts.set(l, (counts.get(l)||0) + 1);
                }
                
                let maxCount = -1;
                const candidates = [];
                
                for(const [l, c] of counts) {
                    if (c > maxCount) {
                        maxCount = c;
                        candidates.length = 0;
                        candidates.push(l);
                    } else if (c === maxCount) {
                        candidates.push(l);
                    }
                }
                
                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                
                if (chosen !== labels.get(n)) {
                    labels.set(n, chosen);
                    changeCount++;
                }
            }
            if (changeCount === 0) break; 
        }
        
        const communities = new Map();
        for(const [n, l] of labels) {
            if(!communities.has(l)) communities.set(l, []);
            communities.get(l).push(n);
        }
        return Array.from(communities.values());
    }

    /**
     * @method centrality
     * @description Scores nodes by their absolute degree of connection.
     * @returns {Promise<Array>} Sorted centralities.
     */
    async centrality() {
        const { nodes, adjList, reverseAdj } = await this.manager.query.projectGraph();
        return nodes.map(n => ({
            id: n,
            inDegree: (reverseAdj.get(n) || []).length,
            outDegree: (adjList.get(n) || []).length,
            degree: (reverseAdj.get(n) || []).length + (adjList.get(n) || []).length
        })).sort((a,b) => b.degree - a.degree);
    }
}

module.exports = GraphAlgorithms;

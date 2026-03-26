
// B"H
/**
 * @file path.js
 * @description Synchronous Graph Traversal Algorithms.
 */
const Logger = require('../../../utils/centralLogger.js');

class AlgoPath {
    constructor(manager) {
        this.manager = manager;
    }

    shortestPath(startHandle, endHandle, options = {}) {
        this.manager.ensureInit();
        
        const startId = this.manager.utils.getId(startHandle);
        const endId = this.manager.utils.getId(endHandle);
        
        if (!startId || !endId) return null;
        if (startId === endId) return [{ node: startHandle }];

        const maxDepth = options.maxDepth || 5;
        const direction = options.direction || 'OUT';
        
        const queue = [ { id: startId, path: [ { node: startHandle } ] } ];
        const visited = new Set([startId]);

        while(queue.length > 0) {
            const current = queue.shift();
            const { id, path } = current;
            
            if (path.length > maxDepth + 1) continue;

            const edges = this.manager.query.getEdgesFromId(id, direction, null);
            
            for(const edgeObj of edges) {
                const neighborId = edgeObj.id; 
                
                if (neighborId === endId) {
                    return [...path, { edge: edgeObj, node: edgeObj.node }];
                }
                
                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ 
                        id: neighborId, 
                        path: [...path, { edge: edgeObj, node: edgeObj.node }] 
                    });
                }
            }
        }
        
        return null;
    }

    traverse(startHandle, visitor, options = {}) {
        this.manager.ensureInit();
        const startId = this.manager.utils.getId(startHandle);
        const maxDepth = options.maxDepth || 3;
        const strategy = options.strategy || 'BFS'; 

        const container = [ { id: startId, handle: startHandle, depth: 0 } ]; 
        const visited = new Set([startId]);

        while(container.length > 0) {
            const current = (strategy === 'DFS') ? container.pop() : container.shift();
            
            const stop = visitor(current.handle, current.depth);
            if (stop === true) return;
            
            if (current.depth >= maxDepth) continue;

            const edges = this.manager.query.getEdgesFromId(current.id, 'OUT', null);
            for(const edge of edges) {
                if (edge.id && !visited.has(edge.id)) {
                    visited.add(edge.id);
                    container.push({ id: edge.id, handle: edge.node, depth: current.depth + 1 });
                }
            }
        }
    }
}

module.exports = AlgoPath;

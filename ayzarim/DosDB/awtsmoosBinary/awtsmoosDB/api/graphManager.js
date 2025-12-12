
// B"H
const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const { readPointer48 } = require('../utils/binaryHelpers.js');

class GraphManager {
    constructor(db) {
        this.db = db;
        this.graphRoot = null;
    }

    async _init() {
        if (this.graphRoot) return;
        
        // B"H: Optimization
        const hasGraph = await this.db.root.has("__graph__");
        if (!hasGraph) {
            await this.db.root.createMap("__graph__");
        }
        this.graphRoot = this.db.root.__graph__;
    }

    _getId(handle) {
        return this._getIdFromPtr(handle.ptr);
    }

    _getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        const decoded = SmartPointer.decode(ptrBuf);
        if (decoded) {
            if (decoded.mode === constants.MODE_BLOCK) {
                const blockId = readPointer48(decoded.payload, 0);
                const offset = decoded.payload.readUInt32BE(10);
                return `${blockId}_${offset}`;
            }
            if (decoded.mode === constants.MODE_HEAP) {
                const blockId = readPointer48(decoded.payload, 0);
                const offset = decoded.payload.readUInt32BE(6);
                return `${blockId}_${offset}`;
            }
        }
        return null;
    }

    async connect(sourceHandle, targetHandle, label, props = {}) {
        await this._init();
        if (sourceHandle.ensureResolved) await sourceHandle.ensureResolved();
        if (targetHandle.ensureResolved) await targetHandle.ensureResolved();

        const sourceId = this._getId(sourceHandle);
        const targetId = this._getId(targetHandle);
        
        if (!sourceId || !targetId) throw new Error("B\"H: Object cannot be a Graph Node (Invalid Pointer Type).");

        await this._ensureNode(sourceId);
        await this._ensureNode(targetId);

        const edge = { 
            targetId, sourceId, label, props, timestamp: Date.now(),
            sourcePtr: sourceHandle.ptr,
            targetPtr: targetHandle.ptr
        };
        
        await this._addEdge(sourceId, "out", label, edge);
        await this._addEdge(targetId, "in", label, edge);
    }

    async _ensureNode(nodeId) {
        const nodeEntry = this.graphRoot.get(nodeId); 
        if (nodeEntry.ensureResolved) await nodeEntry.ensureResolved();
        
        if (!nodeEntry.ptr) {
            await this.graphRoot.createMap(nodeId);
            const newNode = this.graphRoot.get(nodeId);
            await newNode.createMap("in");
            await newNode.createMap("out");
        }
    }

    async _addEdge(nodeId, dir, label, edge) {
        const nodeEntry = this.graphRoot.get(nodeId);
        if(nodeEntry.ensureResolved) await nodeEntry.ensureResolved();

        const dirMap = nodeEntry.get(dir); 
        if(dirMap.ensureResolved) await dirMap.ensureResolved();

        let labelList = dirMap.get(label); 
        if(labelList.ensureResolved) await labelList.ensureResolved();
        
        if (!labelList.ptr) {
            await dirMap.createList(label);
            labelList = dirMap.get(label); 
            if(labelList.ensureResolved) await labelList.ensureResolved();
        }
        await labelList.push(edge);
    }

    async deleteNode(nodeIdentifier) {
        await this._init();
        let nodeId;
        if (Buffer.isBuffer(nodeIdentifier)) nodeId = this._getIdFromPtr(nodeIdentifier);
        else nodeId = String(nodeIdentifier);
        
        if (!nodeId) return;

        const nodeEntry = this.graphRoot.get(nodeId);
        if(nodeEntry.ensureResolved) await nodeEntry.ensureResolved();
        if (!nodeEntry.ptr) return;

        const inMap = nodeEntry.get("in");
        if(inMap.ensureResolved) await inMap.ensureResolved();
        if (inMap.ptr) {
            for await (const label of inMap.keys()) {
                const list = inMap.get(label); 
                const edges = await list.reader.resolveSelf(); 
                for (const edge of edges) await this._removeEdgeFromOther(edge.sourceId, 'out', edge.label, nodeId);
            }
        }

        const outMap = nodeEntry.get("out");
        if(outMap.ensureResolved) await outMap.ensureResolved();
        if (outMap.ptr) {
            for await (const label of outMap.keys()) {
                const list = outMap.get(label); 
                const edges = await list.reader.resolveSelf(); 
                for (const edge of edges) await this._removeEdgeFromOther(edge.targetId, 'in', edge.label, nodeId);
            }
        }
        await this.graphRoot.delete(nodeId);
    }

    async _removeEdgeFromOther(otherId, dir, label, targetNodeIdToRemove) {
        const otherNode = this.graphRoot.get(otherId);
        if(otherNode.ensureResolved) await otherNode.ensureResolved();
        if (!otherNode.ptr) return;

        const dirMap = otherNode.get(dir);
        if(dirMap.ensureResolved) await dirMap.ensureResolved();

        const list = dirMap.get(label);
        if(list.ensureResolved) await list.ensureResolved();
        if (!list.ptr) return;

        const len = await list.length;
        for (let i = len - 1; i >= 0; i--) {
            const edgeVal = await list.get(i); 
            const match = (dir === 'out' && String(edgeVal.targetId) === targetNodeIdToRemove) ||
                          (dir === 'in' && String(edgeVal.sourceId) === targetNodeIdToRemove);
            if (match) await list.splice(i, 1);
        }
    }

    async getRelationships(handle, direction = 'BOTH', label = null) {
        await this._init();
        if (handle.ensureResolved) await handle.ensureResolved();
        const nodeId = this._getId(handle);
        if (!nodeId) return [];
        return await this._getEdgesFromId(nodeId, direction, label);
    }

    async _getEdgesFromId(nodeId, direction, label) {
        const results = [];
        const dirs = [];
        if (direction === 'OUT' || direction === 'BOTH') dirs.push('out');
        if (direction === 'IN' || direction === 'BOTH') dirs.push('in');

        const nodeEntry = this.graphRoot.get(nodeId); 
        if (nodeEntry.ensureResolved) await nodeEntry.ensureResolved();
        if (!nodeEntry.ptr) return [];

        for (const dir of dirs) {
            const dirMap = nodeEntry.get(dir); 
            if (dirMap.ensureResolved) await dirMap.ensureResolved();
            if (!dirMap.ptr) continue;

            if (label) {
                const list = dirMap.get(label); 
                if (list.ensureResolved) await list.ensureResolved();
                if (list.ptr) {
                    const edges = await list.reader.resolveSelf(); 
                    if (Array.isArray(edges)) {
                        for (const edge of edges) results.push(await this._hydrateEdge(edge, dir));
                    }
                }
            } else {
                if (dirMap.keys) {
                    for await (const lbl of dirMap.keys()) {
                        const list = dirMap.get(lbl); 
                        if (list.ensureResolved) await list.ensureResolved();
                        const edges = await list.reader.resolveSelf(); 
                        if (Array.isArray(edges)) {
                            for (const edge of edges) results.push(await this._hydrateEdge(edge, dir));
                        }
                    }
                }
            }
        }
        return results;
    }

    async _hydrateEdge(edge, dir) {
        const ptrBuf = (dir === 'out') ? edge.targetPtr : edge.sourcePtr;
        if (ptrBuf) {
            const otherNode = this._hydrateNodeHandleFromPtr(ptrBuf);
            return { node: otherNode, label: edge.label, props: edge.props, direction: dir, _raw: edge };
        }
        const otherId = (dir === 'out') ? edge.targetId : edge.sourceId;
        const otherNode = this._hydrateNodeHandleFromId(otherId);
        return { node: otherNode, label: edge.label, props: edge.props, direction: dir, _raw: edge };
    }

    _hydrateNodeHandleFromPtr(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        const LiveHandle = require('./liveHandle/index.js');
        return new LiveHandle(this.db, ptrBuf, decoded.type, null);
    }

    _hydrateNodeHandleFromId(id) {
        const [blockStr, offStr] = id.split('_');
        const blockId = parseInt(blockStr);
        const ptr = SmartPointer.block(constants.TYPE_DICTIONARY, blockId, 0, false, parseInt(offStr||0)); 
        const LiveHandle = require('./liveHandle/index.js');
        return new LiveHandle(this.db, ptr, constants.TYPE_DICTIONARY, null);
    }

    // --- ALGORITHMS (Neo4j-Lite) ---

    // 1. Graph Projection (In-Memory Topology)
    async projectGraph() {
        await this._init();
        const adjList = new Map(); // NodeID -> Array<NeighborID>
        const reverseAdj = new Map(); // NodeID -> Array<SourceID>
        const nodes = new Set();

        for await (const nodeKey of this.graphRoot.keys()) {
            nodes.add(nodeKey);
            const nodeEntry = this.graphRoot.get(nodeKey);
            const outMap = nodeEntry.get('out');
            await outMap.ensureResolved();
            
            if (outMap.ptr) {
                for await (const label of outMap.keys()) {
                    const list = outMap.get(label);
                    const edges = await list.reader.resolveSelf(); // Array of edge objects
                    for(const e of edges) {
                        const target = e.targetId;
                        nodes.add(target); // Ensure target exists in set
                        
                        if(!adjList.has(nodeKey)) adjList.set(nodeKey, []);
                        adjList.get(nodeKey).push(target);
                        
                        if(!reverseAdj.has(target)) reverseAdj.set(target, []);
                        reverseAdj.get(target).push(nodeKey);
                    }
                }
            }
        }
        return { nodes: Array.from(nodes), adjList, reverseAdj };
    }

    // 2. PageRank
    async pageRank(options = {}) {
        const damping = options.damping || 0.85;
        const iterations = options.iterations || 20;
        const { nodes, reverseAdj, adjList } = await this.projectGraph();
        
        let scores = new Map();
        nodes.forEach(n => scores.set(n, 1.0 / nodes.length));
        
        for(let i=0; i<iterations; i++) {
            const newScores = new Map();
            let sinkScore = 0;
            
            // Handle sink nodes (nodes with no outgoing edges)
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
        
        // Sort
        const sorted = Array.from(scores.entries()).sort((a,b) => b[1] - a[1]);
        return sorted.map(([id, score]) => ({ id, score }));
    }

    // 3. Community Detection (Label Propagation)
    async communityDetection(options = {}) {
        const iterations = options.iterations || 10;
        const { nodes, adjList, reverseAdj } = await this.projectGraph();
        
        const labels = new Map();
        nodes.forEach((n, i) => labels.set(n, i)); // Init unique labels
        
        // B"H: Shuffle nodes for randomness
        const shuffled = [...nodes];
        
        for(let i=0; i<iterations; i++) {
            // Fisher-Yates Shuffle
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }

            let changeCount = 0;
            for(const n of shuffled) {
                // Get neighbors (using both in/out for community detection is usually better for weak connectivity)
                const neighbors = [ ...(adjList.get(n)||[]), ...(reverseAdj.get(n)||[]) ];
                if(neighbors.length === 0) continue;

                // Count labels
                const counts = new Map();
                for(const neighbor of neighbors) {
                    const l = labels.get(neighbor);
                    counts.set(l, (counts.get(l)||0) + 1);
                }
                
                // Find max
                let maxCount = -1;
                let maxLabel = labels.get(n);
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
                
                // Randomly choose from ties
                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                
                if (chosen !== labels.get(n)) {
                    labels.set(n, chosen);
                    changeCount++;
                }
            }
            if (changeCount === 0) break; 
        }
        
        // Group results
        const communities = new Map();
        for(const [n, l] of labels) {
            if(!communities.has(l)) communities.set(l, []);
            communities.get(l).push(n);
        }
        return Array.from(communities.values());
    }

    // 4. Centrality (Degree)
    async centrality() {
        const { nodes, adjList, reverseAdj } = await this.projectGraph();
        return nodes.map(n => ({
            id: n,
            inDegree: (reverseAdj.get(n) || []).length,
            outDegree: (adjList.get(n) || []).length,
            degree: (reverseAdj.get(n) || []).length + (adjList.get(n) || []).length
        })).sort((a,b) => b.degree - a.degree);
    }

    // Existing methods below
    async shortestPath(startHandle, endHandle, options = {}) {
        await this._init();
        if (startHandle.ensureResolved) await startHandle.ensureResolved();
        if (endHandle.ensureResolved) await endHandle.ensureResolved();

        const startId = this._getId(startHandle);
        const endId = this._getId(endHandle);
        const maxDepth = options.maxDepth || 5;
        const direction = options.direction || 'OUT';
        const label = options.label || null;

        if (startId === endId) return [{ node: startHandle }];

        const queue = [ { id: startId, path: [ { node: startHandle } ] } ];
        const visited = new Set([startId]);

        while(queue.length > 0) {
            const current = queue.shift();
            const { id, path } = current;
            if (path.length > maxDepth + 1) continue;

            const edges = await this._getEdgesFromId(id, direction, label);
            for(const edgeObj of edges) {
                const neighborHandle = edgeObj.node;
                const neighborId = this._getId(neighborHandle);
                if (neighborId === endId) return [...path, { edge: edgeObj, node: neighborHandle }];
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ id: neighborId, path: [...path, { edge: edgeObj, node: neighborHandle }] });
                }
            }
        }
        return null;
    }

    async traverse(startHandle, visitor, options = {}) {
        await this._init();
        if (startHandle.ensureResolved) await startHandle.ensureResolved();

        const startId = this._getId(startHandle);
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

            const edges = await this._getEdgesFromId(current.id, direction, null);
            for(const edge of edges) {
                const neighborHandle = edge.node;
                const neighborId = this._getId(neighborHandle);
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    stack.push({ id: neighborId, handle: neighborHandle, depth: current.depth + 1 });
                }
            }
        }
    }
}
module.exports = GraphManager;

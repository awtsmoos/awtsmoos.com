
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
        // B"H: FIX - Use db.has()
        const hasGraph = await this.db.has(this.db.root, "__graph__");
        if (!hasGraph) {
            await this.db.createMap(this.db.root, "__graph__");
        }
        this.graphRoot = this.db.root.__graph__;
    }

    _getId(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        return this._getIdFromPtr(h.ptr);
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
        
        // B"H: Robust unwrapping (handle might be Proxy or Internal)
        const src = sourceHandle && sourceHandle[constants.SYMBOLS.INTERNALS] ? sourceHandle[constants.SYMBOLS.INTERNALS] : sourceHandle;
        const tgt = targetHandle && targetHandle[constants.SYMBOLS.INTERNALS] ? targetHandle[constants.SYMBOLS.INTERNALS] : targetHandle;
        
        await src.ensureResolved();
        await tgt.ensureResolved();

        const sourceId = this._getId(src);
        const targetId = this._getId(tgt);
        
        if (!sourceId || !targetId) throw new Error("B\"H: Object cannot be a Graph Node (Invalid Pointer Type).");

        await this._ensureNode(sourceId);
        await this._ensureNode(targetId);

        const edge = { 
            targetId, sourceId, label, props, timestamp: Date.now(),
            sourcePtr: src.ptr,
            targetPtr: tgt.ptr
        };
        
        await this._addEdge(sourceId, "out", label, edge);
        await this._addEdge(targetId, "in", label, edge);
    }

    async _ensureNode(nodeId) {
        // B"H: FIX - Bracket access
        const nodeEntry = this.graphRoot[nodeId]; 
        await nodeEntry; // Triggers resolution
        
        const internal = nodeEntry[constants.SYMBOLS.INTERNALS];
        if (!internal.ptr) {
            await this.db.createMap(this.graphRoot, nodeId);
            // B"H: FIX - Bracket access
            const newNode = this.graphRoot[nodeId];
            await this.db.createMap(newNode, "in");
            await this.db.createMap(newNode, "out");
        }
    }

    async _addEdge(nodeId, dir, label, edge) {
        // B"H: FIX - Bracket access for all levels
        const nodeEntry = this.graphRoot[nodeId];
        const dirMap = nodeEntry[dir]; 
        const labelList = dirMap[label]; 
        
        const listInt = labelList[constants.SYMBOLS.INTERNALS];
        await listInt.ensureResolved();
        
        if (!listInt.ptr) {
            await this.db.createList(dirMap, label);
            // Re-get
            const newList = dirMap[label];
            const newListInt = newList[constants.SYMBOLS.INTERNALS];
            await newListInt.ensureResolved();
            await newList.push(edge);
        } else {
            await labelList.push(edge);
        }
    }

    async deleteNode(nodeIdentifier) {
        await this._init();
        let nodeId;
        if (Buffer.isBuffer(nodeIdentifier)) nodeId = this._getIdFromPtr(nodeIdentifier);
        else nodeId = String(nodeIdentifier);
        
        if (!nodeId) return;

        // B"H: FIX - Bracket access
        const nodeEntry = this.graphRoot[nodeId];
        const nodeInt = nodeEntry[constants.SYMBOLS.INTERNALS];
        await nodeInt.ensureResolved();
        
        if (!nodeInt.ptr) return;

        const inMap = nodeEntry["in"];
        const inMapInt = inMap[constants.SYMBOLS.INTERNALS];
        await inMapInt.ensureResolved();
        
        if (inMapInt.ptr) {
            const labels = await this.db.keys(inMap);
            for (const label of labels) {
                const list = inMap[label]; 
                const edges = await list; 
                if (Array.isArray(edges)) {
                    for (const edge of edges) await this._removeEdgeFromOther(edge.sourceId, 'out', edge.label, nodeId);
                }
            }
        }

        const outMap = nodeEntry["out"];
        const outMapInt = outMap[constants.SYMBOLS.INTERNALS];
        await outMapInt.ensureResolved();
        
        if (outMapInt.ptr) {
            const labels = await this.db.keys(outMap);
            for (const label of labels) {
                const list = outMap[label]; 
                const edges = await list; 
                if (Array.isArray(edges)) {
                    for (const edge of edges) await this._removeEdgeFromOther(edge.targetId, 'in', edge.label, nodeId);
                }
            }
        }
        await this.graphRoot.delete(nodeId);
    }

    async _removeEdgeFromOther(otherId, dir, label, targetNodeIdToRemove) {
        // B"H: FIX - Bracket access
        const otherNode = this.graphRoot[otherId];
        const otherInt = otherNode[constants.SYMBOLS.INTERNALS];
        await otherInt.ensureResolved();
        if (!otherInt.ptr) return;

        const dirMap = otherNode[dir];
        const list = dirMap[label];
        const listInt = list[constants.SYMBOLS.INTERNALS];
        await listInt.ensureResolved();
        if (!listInt.ptr) return;

        const len = await list.length;
        for (let i = len - 1; i >= 0; i--) {
            const edgeVal = await list[i]; 
            const resolvedEdge = await edgeVal;
            
            const match = (dir === 'out' && String(resolvedEdge.targetId) === targetNodeIdToRemove) ||
                          (dir === 'in' && String(resolvedEdge.sourceId) === targetNodeIdToRemove);
            if (match) await list.splice(i, 1);
        }
    }

    async getRelationships(handle, direction = 'BOTH', label = null) {
        await this._init();
        // B"H: Robust unwrapping
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        await h.ensureResolved();
        const nodeId = this._getId(h);
        if (!nodeId) return [];
        return await this._getEdgesFromId(nodeId, direction, label);
    }

    async _getEdgesFromId(nodeId, direction, label) {
        const results = [];
        const dirs = [];
        if (direction === 'OUT' || direction === 'BOTH') dirs.push('out');
        if (direction === 'IN' || direction === 'BOTH') dirs.push('in');

        // B"H: FIX - Bracket access
        const nodeEntry = this.graphRoot[nodeId]; 
        const nodeInt = nodeEntry[constants.SYMBOLS.INTERNALS];
        await nodeInt.ensureResolved();
        if (!nodeInt.ptr) return [];

        for (const dir of dirs) {
            const dirMap = nodeEntry[dir]; 
            const dirInt = dirMap[constants.SYMBOLS.INTERNALS];
            await dirInt.ensureResolved();
            if (!dirInt.ptr) continue;

            if (label) {
                const list = dirMap[label]; 
                const listInt = list[constants.SYMBOLS.INTERNALS];
                await listInt.ensureResolved();
                if (listInt.ptr) {
                    const edges = await list; 
                    if (Array.isArray(edges)) {
                        for (const edge of edges) results.push(await this._hydrateEdge(edge, dir));
                    }
                }
            } else {
                const labels = await this.db.keys(dirMap);
                for (const lbl of labels) {
                    const list = dirMap[lbl]; 
                    const edges = await list; 
                    if (Array.isArray(edges)) {
                        for (const edge of edges) results.push(await this._hydrateEdge(edge, dir));
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

        const nodeKeys = await this.db.keys(this.graphRoot);
        for (const nodeKey of nodeKeys) {
            nodes.add(nodeKey);
            // B"H: FIX - Bracket access
            const nodeEntry = this.graphRoot[nodeKey];
            const outMap = nodeEntry['out'];
            const outInt = outMap[constants.SYMBOLS.INTERNALS];
            await outInt.ensureResolved();
            
            if (outInt.ptr) {
                const labels = await this.db.keys(outMap);
                for (const label of labels) {
                    const list = outMap[label];
                    const edges = await list; // Resolve array
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

    // 3. Community Detection (Label Propagation)
    async communityDetection(options = {}) {
        const iterations = options.iterations || 10;
        const { nodes, adjList, reverseAdj } = await this.projectGraph();
        
        const labels = new Map();
        nodes.forEach((n, i) => labels.set(n, i)); // Init unique labels
        
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

    async shortestPath(startHandle, endHandle, options = {}) {
        await this._init();
        
        // B"H: Robust unwrapping
        const s = startHandle && startHandle[constants.SYMBOLS.INTERNALS] ? startHandle[constants.SYMBOLS.INTERNALS] : startHandle;
        const e = endHandle && endHandle[constants.SYMBOLS.INTERNALS] ? endHandle[constants.SYMBOLS.INTERNALS] : endHandle;
        
        await s.ensureResolved();
        await e.ensureResolved();

        const startId = this._getId(s);
        const endId = this._getId(e);
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
                const nh = neighborHandle[constants.SYMBOLS.INTERNALS];
                const neighborId = this._getId(nh);
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
        
        // B"H: Robust unwrapping
        const s = startHandle && startHandle[constants.SYMBOLS.INTERNALS] ? startHandle[constants.SYMBOLS.INTERNALS] : startHandle;
        await s.ensureResolved();

        const startId = this._getId(s);
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
                const nh = neighborHandle[constants.SYMBOLS.INTERNALS];
                const neighborId = this._getId(nh);
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    stack.push({ id: neighborId, handle: neighborHandle, depth: current.depth + 1 });
                }
            }
        }
    }
}
module.exports = GraphManager;

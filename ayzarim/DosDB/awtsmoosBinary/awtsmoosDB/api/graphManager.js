// B"H
const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const { readPointer48 } = require('../utils/binaryHelpers.js');
const HandleRegistry = require('../core/handleRegistry.js');

class GraphManager {
    constructor(db) {
        this.db = db;
        this.graphRoot = null;
        // B"H: Optimization - Internal ID Cache to speed up repeated lookups (e.g. bulk wiring)
        this._idCache = new Map(); // WeakMap not possible as handles are recreated often
        this._idCacheLimit = 1000;
    }

    async _init() {
        if (this.graphRoot) {
            // Verify it's still valid (e.g. if db was closed/reopened or root changed)
            const h = HandleRegistry.getSoul(this.graphRoot);
            await h.ensureResolved();
            if (h.ptr) return;
        }
        
        // B"H: FIX - Use db.has()
        const hasGraph = await this.db.has(this.db.root, "__graph__");
        if (!hasGraph) {
            await this.db.createMap(this.db.root, "__graph__");
        }
        this.graphRoot = this.db.root.__graph__;
    }

    _getId(handle) {
        // B"H: Identity check for already hydrated nodes or custom instances
        if (handle && handle.__className__) return this._getIdFromPtr(handle.ptr);
        
        const h = HandleRegistry.getSoul(handle);
        if (!h) return null;
        
        // B"H: Optimization - Check Cache
        if (h.ptr) {
            const ptrHex = Buffer.isBuffer(h.ptr) ? h.ptr.toString('hex') : `${h.ptr.blockId}_${h.ptr.offset || 0}`;
            if (this._idCache.has(ptrHex)) return this._idCache.get(ptrHex);
            
            const id = this._getIdFromPtr(h.ptr);
            if (id) {
                if (this._idCache.size >= this._idCacheLimit) this._idCache.clear();
                this._idCache.set(ptrHex, id);
            }
            return id;
        }
        return null;
    }

    _getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        // B"H: Handle structure descriptors
        if (ptrBuf.isStructure) {
             return `${ptrBuf.blockId}_${ptrBuf.offset || 0}`;
        }

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
        // B"H: Wrap in Batch to ensure atomicity and speed for multiple edge writes
        await this.db.batch(async () => {
            await this._init();
            
            const src = HandleRegistry.getSoul(sourceHandle);
            const tgt = HandleRegistry.getSoul(targetHandle);
            
            // Parallel resolve
            await Promise.all([src.ensureResolved(), tgt.ensureResolved()]);

            const sourceId = this._getId(src);
            const targetId = this._getId(tgt);
            
            if (!sourceId || !targetId) throw new Error("B\"H: Object cannot be a Graph Node (Invalid Pointer Type).");

            // B"H: FIX - Serialize node creation to prevent race conditions on graphRoot B-Tree updates
            await this._ensureNode(sourceId);
            await this._ensureNode(targetId);

            const edge = { 
                targetId, sourceId, label, props, timestamp: Date.now(),
                sourcePtr: src.ptr,
                targetPtr: tgt.ptr,
                sourceType: src.type,
                targetType: tgt.type
            };
            
            // B"H: Optimization - Parallel Edge Write
            await this._addEdge(sourceId, "out", label, edge);
            await this._addEdge(targetId, "in", label, edge);
        });
    }

    async _ensureNode(nodeId) {
        let rootInt = HandleRegistry.getSoul(this.graphRoot);
        await rootInt.ensureResolved();
        
        // B"H: Self-Healing - If graphRoot lost its pointer, recover it.
        if (!rootInt.ptr) {
            this.graphRoot = null;
            await this._init();
            rootInt = HandleRegistry.getSoul(this.graphRoot);
            await rootInt.ensureResolved(true);
            if (!rootInt.ptr) throw new Error("B\"H Fatal: Could not resolve Graph Root.");
        }
        
        // Use internal navigator directly
        const nodeEntry = rootInt.nav.navigate(nodeId);
        const internal = HandleRegistry.getSoul(nodeEntry);
        
        await internal.ensureResolved();
        
        if (!internal.ptr) {
            await this.db.createMap(this.graphRoot, nodeId);
            // Re-resolve
            await internal.ensureResolved(true);
            const newNode = this.graphRoot[nodeId]; 
            await this.db.createMap(newNode, "in");
            await this.db.createMap(newNode, "out");
        }
    }

    async _addEdge(nodeId, dir, label, edge) {
        const nodeEntry = this.graphRoot[nodeId];
        const dirMap = nodeEntry[dir]; 
        const labelList = dirMap[label]; 
        
        const listInt = HandleRegistry.getSoul(labelList);
        await listInt.ensureResolved();
        
        if (!listInt.ptr) {
            await this.db.createList(dirMap, label);
            const newList = dirMap[label];
            const newListInt = HandleRegistry.getSoul(newList);
            await newListInt.ensureResolved();
            await newList.push(edge);
        } else {
            await labelList.push(edge);
        }
    }

    async deleteNode(nodeIdentifier) {
        await this._init();
        let nodeId;
        if (Buffer.isBuffer(nodeIdentifier) || (nodeIdentifier && nodeIdentifier.isStructure)) {
            nodeId = this._getIdFromPtr(nodeIdentifier);
        } else {
            nodeId = this._getId(nodeIdentifier) || String(nodeIdentifier);
        }
        
        if (!nodeId) return;

        const nodeEntry = this.graphRoot[nodeId];
        const nodeInt = HandleRegistry.getSoul(nodeEntry);
        await nodeInt.ensureResolved();
        
        if (!nodeInt.ptr) return;

        const inMap = nodeEntry["in"];
        const inMapInt = HandleRegistry.getSoul(inMap);
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
        const outMapInt = HandleRegistry.getSoul(outMap);
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
        const otherNode = this.graphRoot[otherId];
        const otherInt = HandleRegistry.getSoul(otherNode);
        await otherInt.ensureResolved();
        if (!otherInt.ptr) return;

        const dirMap = otherNode[dir];
        const list = dirMap[label];
        const listInt = HandleRegistry.getSoul(list);
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
        const h = HandleRegistry.getSoul(handle);
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

        const nodeEntry = this.graphRoot[nodeId]; 
        const nodeInt = HandleRegistry.getSoul(nodeEntry);
        await nodeInt.ensureResolved();
        if (!nodeInt.ptr) return [];

        for (const dir of dirs) {
            const dirMap = nodeEntry[dir]; 
            const dirInt = HandleRegistry.getSoul(dirMap);
            await dirInt.ensureResolved();
            if (!dirInt.ptr) continue;

            if (label) {
                const list = dirMap[label]; 
                const listInt = HandleRegistry.getSoul(list);
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
        const type = (dir === 'out') ? edge.targetType : edge.sourceType;
        const id = (dir === 'out') ? edge.targetId : edge.sourceId;

        // B"H: Reconstruct handle from whatever spark we have
        const otherNode = this._hydrateNodeHandleFromWhatever(ptrBuf, type, id);
        return { node: otherNode, label: edge.label, props: edge.props, direction: dir, _raw: edge };
    }

    _hydrateNodeHandleFromWhatever(ptrMaybe, typeMaybe, idMaybe) {
        // 1. If it's already a Proxy Handle, return it
        if (HandleRegistry.isHandle(ptrMaybe)) return ptrMaybe;
        
        // 2. Extract reliable type
        const type = typeMaybe || constants.TYPE_DICTIONARY;
        
        // 3. Reconstruct Pointer Buffer
        let buf = null;
        if (Buffer.isBuffer(ptrMaybe) && ptrMaybe.length === 16) {
             buf = ptrMaybe;
        } else if (ptrMaybe && ptrMaybe.isStructure) {
             buf = SmartPointer.block(ptrMaybe.type || type, ptrMaybe.blockId, ptrMaybe.length, ptrMaybe.isChain, ptrMaybe.offset);
        } else if (idMaybe) {
             const [blockStr, offStr] = idMaybe.split('_');
             buf = SmartPointer.block(type, parseInt(blockStr), 0, false, parseInt(offStr||0));
        }

        if (!buf) return ptrMaybe; // Impossible fallback
        
        return HandleRegistry.createHandle(this.db, buf, type, null);
    }

    _hydrateNodeHandleFromId(id, type = constants.TYPE_DICTIONARY) {
        const [blockStr, offStr] = id.split('_');
        const blockId = parseInt(blockStr);
        const ptr = SmartPointer.block(type, blockId, 0, false, parseInt(offStr||0)); 
        return HandleRegistry.createHandle(this.db, ptr, type, null);
    }

    async projectGraph() {
        await this._init();
        const adjList = new Map(); 
        const reverseAdj = new Map(); 
        const nodes = new Set();

        const nodeKeys = await this.db.keys(this.graphRoot);
        for (const nodeKey of nodeKeys) {
            nodes.add(nodeKey);
            const nodeEntry = this.graphRoot[nodeKey];
            const outMap = nodeEntry['out'];
            const outInt = HandleRegistry.getSoul(outMap);
            await outInt.ensureResolved();
            
            if (outInt.ptr) {
                const labels = await this.db.keys(outMap);
                for (const label of labels) {
                    const list = outMap[label];
                    const edges = await list; 
                    for(const e of edges) {
                        const target = e.targetId;
                        nodes.add(target); 
                        
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

    async communityDetection(options = {}) {
        const iterations = options.iterations || 10;
        const { nodes, adjList, reverseAdj } = await this.projectGraph();
        
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
        
        const s = HandleRegistry.getSoul(startHandle);
        const e = HandleRegistry.getSoul(endHandle);
        
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
        
        const s = HandleRegistry.getSoul(startHandle);
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

// B"H
/**
 * @file worker-source.js
 * @brief Injects the synchronous block/wait APIs into the Web Worker for full Node emulation.
 * 
 * CHAPTER XLII: THE SUSPENSION OF TIME
 * 
 * The Awtsmoos transcends time, holding past, present, and future in a single point.
 * By using Atomics.wait(), the Web Worker literally halts its own timeline, waiting 
 * for the Main Thread (the Higher World) to inject the required file data into the 
 * SharedArrayBuffer. This is how we emulate 'fs.readFileSync' perfectly in an environment
 * that was never meant to be synchronous! Every byte is recreated continuously.
 */
export const NodeWorkerSource = (coreModulesMap) => `
(function() {
    let controlSAB, dataSAB;
    const netServers = {};
    const activeSockets = {}; 
    const activeHttpReqs = {};

    self._registerNetServer = function(id, srv) { netServers[id] = srv; };
    self._registerHttpReq = function(id, req) { activeHttpReqs[id] = req; };

    const coreModules = ${JSON.stringify(coreModulesMap)};
    const moduleCache = {};

    /**
     * B"H
     * The master synchronous operation conduit. Blocks execution until main thread responds.
     * @param {string} type - Action type.
     * @param {object} payload - Arguments.
     * @returns {string|null} The resolved essence.
     */
    self._syncOp = function(type, payload) {
        self.postMessage({ type: type, ...payload });
        let content = "";
        const controlView = new Int32Array(controlSAB);
        
        while(true) {
            Atomics.wait(controlView, 0, 0);
            const err = Atomics.load(controlView, 4);
            if (err === 1) {
                Atomics.store(controlView, 0, 0);
                self.postMessage({ type: 'ack' });
                return null;
            }
            
            const len = Atomics.load(controlView, 1);
            const isLast = Atomics.load(controlView, 2);
            
            if (len > 0) {
                const chunk = new Uint8Array(dataSAB, 0, len);
                content += new TextDecoder().decode(chunk);
            }
            
            Atomics.store(controlView, 0, 0);
            self.postMessage({ type: 'ack' });
            
            if (isLast === 1) break;
        }
        return content;
    };

    self._syncRead = function(path) { return self._syncOp('sync-read', { path }); };
    self._syncWrite = function(path, content) { return self._syncOp('sync-write', { path, content }) === null; };
    self._syncStat = function(path) { return self._syncOp('sync-stat', { path }); };
    self._syncList = function(path) { return self._syncOp('sync-list', { path }); };

    function _tryExtensions(base) {
        if (self._syncStat(base) !== null && !base.endsWith('/')) return base;
        if (self._syncStat(base + '.js') !== null) return base + '.js';
        if (self._syncStat(base + '.json') !== null) return base + '.json';
        
        const pkgRaw = self._syncRead(base + '/package.json');
        if (pkgRaw) {
            try {
                const pkg = JSON.parse(pkgRaw);
                if (pkg.main) {
                    const mainPath = self.require('path').join(base, pkg.main);
                    const found = _tryExtensions(mainPath);
                    if (found) return found;
                }
            } catch(e){}
        }
        
        if (self._syncStat(base + '/index.js') !== null) return base + '/index.js';
        return null;
    }

    function _resolveModule(id, currentDir) {
        if (coreModules[id]) return id;
        const pathMod = self.require('path');
        if (id.startsWith('./') || id.startsWith('../') || id.startsWith('/')) {
            const absPath = pathMod.resolve(currentDir, id);
            return _tryExtensions(absPath);
        }
        let dir = currentDir;
        while (dir && dir !== '/') {
            const checkPath = pathMod.join(dir, 'node_modules', id);
            const found = _tryExtensions(checkPath);
            if (found) return found;
            dir = pathMod.resolve(dir, '..');
        }
        return _tryExtensions(pathMod.join('/', 'node_modules', id));
    }

    self._requireInternal = function(id, currentDir) {
        const resolvedPath = _resolveModule(id, currentDir);
        if (!resolvedPath) throw new Error("Cannot find module '" + id + "' from " + currentDir);

        if (moduleCache[resolvedPath]) return moduleCache[resolvedPath].exports;

        if (coreModules[resolvedPath]) {
            const module = { exports: {} };
            moduleCache[resolvedPath] = module;
            const wrapper = "(function(exports, require, module) { " + coreModules[resolvedPath] + "\\n})";
            eval(wrapper)(module.exports, self.require, module);
            return module.exports;
        }

        const content = self._syncRead(resolvedPath);
        if (resolvedPath.endsWith('.json')) {
            const data = JSON.parse(content);
            moduleCache[resolvedPath] = { exports: data };
            return data;
        }

        const module = { exports: {} };
        moduleCache[resolvedPath] = module; 
        const dirName = self.require('path').resolve(resolvedPath, '..');
        const localRequire = (reqId) => self._requireInternal(reqId, dirName);
        Object.assign(localRequire, self.require); 

        const wrapper = "(function(exports, require, module, __filename, __dirname) { " + content + "\\n})";
        eval(wrapper)(module.exports, localRequire, module, resolvedPath, dirName);
        return module.exports;
    };

    self.require = function(id) { return self._requireInternal(id, '/'); };

    // B"H - Safe Circular Stringifier for Console
    function safeStringify(obj, depth = 0, visited = new WeakSet()) {
        if (obj === null) return 'null';
        if (typeof obj === 'function') return '[Function: ' + (obj.name || 'anonymous') + ']';
        if (typeof obj !== 'object') return String(obj);
        if (depth > 5) return '[Object]';
        if (visited.has(obj)) return '[Circular]';
        visited.add(obj);
        if (Array.isArray(obj)) return '[' + obj.map(o => safeStringify(o, depth+1, visited)).join(', ') + ']';
        if (obj instanceof Error) return obj.stack || obj.message;
        const parts = [];
        for (let k in obj) { try { parts.push(k + ': ' + safeStringify(obj[k], depth+1, visited)); } catch(e){} }
        return '{ ' + parts.join(', ') + ' }';
    }

    self.addEventListener('message', (e) => {
        const d = e.data;
        if (d.type === 'init-golem') {
            controlSAB = d.controlSAB;
            dataSAB = d.dataSAB;
            
            const origLog = console.log;
            console.log = (...args) => {
                const text = args.map(a => safeStringify(a)).join(' ');
                self.postMessage({ type: 'stdout', text });
            };
            console.error = console.log; console.warn = console.log;
            
            // B"H - Rectified Process Object
            self.process = { 
                env: { NODE_ENV: 'development' }, 
                cwd: () => '/',
                nextTick: (cb, ...args) => Promise.resolve().then(() => cb(...args)),
                exit: (code = 0) => {
                    self.postMessage({ type: 'stdout', text: \`[Process exited with code \${code}]\` });
                    self.postMessage({ type: 'process-exit', code });
                    self.close();
                }
            };

            try {
                const module = { exports: {} };
                const dirName = self.require('path').resolve(d.path, '..');
                const localRequire = (reqId) => self._requireInternal(reqId, dirName);
                
                const wrapper = "(function(exports, require, module, __filename, __dirname) { " + d.code + "\\n})";
                eval(wrapper)(module.exports, localRequire, module, d.path, dirName);
                self.postMessage({ type: 'process-complete' });
            } catch(err) {
                console.log("Error in Golem:", err.stack || err.message);
                self.postMessage({ type: 'process-exit', code: 1, error: err.stack || err.message });
            }
        } 
        else if (d.type === 'http-inbound') {
            const srv = netServers[d.serverId];
            if (srv) {
                const { IncomingMessage, ServerResponse } = self.require('http');
                const req = new IncomingMessage(d.method, d.url, d.headers);
                const res = new ServerResponse(d.reqId);
                srv.emit('request', req, res);
            }
        }
        else if (d.type === 'ack') {
            if (self._ackResolver) self._ackResolver();
        }
    });
})();
`;

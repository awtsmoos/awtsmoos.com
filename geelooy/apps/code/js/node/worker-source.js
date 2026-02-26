
// B"H
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

    function _tryExtensions(base) {
        if (self._syncRead(base) !== null && !base.endsWith('/')) return base;
        if (self._syncRead(base + '.js') !== null) return base + '.js';
        if (self._syncRead(base + '.json') !== null) return base + '.json';
        
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
        
        if (self._syncRead(base + '/index.js') !== null) return base + '/index.js';
        return null;
    }

    function _resolveModule(id, currentDir) {
        if (coreModules[id]) return id;

        const pathMod = self.require('path');

        if (id.startsWith('./') || id.startsWith('../') || id.startsWith('/')) {
            const absPath = pathMod.resolve(currentDir, id);
            return _tryExtensions(absPath);
        }

        // B"H - Node_modules recursive climb
        let dir = currentDir;
        while (dir && dir !== '/') {
            const checkPath = pathMod.join(dir, 'node_modules', id);
            const found = _tryExtensions(checkPath);
            if (found) return found;
            dir = pathMod.resolve(dir, '..');
        }
        
        // Root check
        const rootCheck = pathMod.join('/', 'node_modules', id);
        return _tryExtensions(rootCheck);
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
        Object.assign(localRequire, self.require); // attach cache etc if needed

        const wrapper = "(function(exports, require, module, __filename, __dirname) { " + content + "\\n})";
        eval(wrapper)(module.exports, localRequire, module, resolvedPath, dirName);
        return module.exports;
    };

    self.require = function(id) {
        return self._requireInternal(id, '/');
    };

    self.addEventListener('message', (e) => {
        const d = e.data;
        if (d.type === 'init-golem') {
            controlSAB = d.controlSAB;
            dataSAB = d.dataSAB;
            
            const origLog = console.log;
            console.log = (...args) => {
                const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                self.postMessage({ type: 'stdout', text });
            };
            console.error = console.log; console.warn = console.log;
            
            self.process = { env: {}, cwd: () => '/' };

            try {
                const module = { exports: {} };
                const dirName = self.require('path').resolve(d.path, '..');
                const localRequire = (reqId) => self._requireInternal(reqId, dirName);
                
                const wrapper = "(function(exports, require, module, __filename, __dirname) { " + d.code + "\\n})";
                eval(wrapper)(module.exports, localRequire, module, d.path, dirName);
            } catch(err) {
                console.log("Error in Golem:", err.stack || err.message);
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
        else if (d.type === 'http-client-response') {
            const req = activeHttpReqs[d.reqId];
            if (req) {
                const { IncomingClientMessage } = self.require('http');
                const res = new IncomingClientMessage(d.status, d.headers, d.data);
                req.emit('response', res);
                delete activeHttpReqs[d.reqId];
            }
        }
        else if (d.type === 'http-client-error') {
            const req = activeHttpReqs[d.reqId];
            if (req) { req.emit('error', new Error(d.error)); delete activeHttpReqs[d.reqId]; }
        }
        else if (d.type === 'ws-inbound-connect') {
            const srv = netServers[d.serverId];
            if (srv) {
                const { IncomingMessage } = self.require('http');
                const { Socket } = self.require('net');
                const req = new IncomingMessage('GET', d.url, d.headers);
                const socket = new Socket(d.id);
                activeSockets[d.id] = socket;
                
                self.postMessage({ type: 'ws-server-open', id: d.id });
                srv.emit('upgrade', req, socket, self.require('buffer').Buffer.from(''));
            }
        }
        else if (d.type === 'ws-inbound-data') {
            const socket = activeSockets[d.id];
            if (socket) socket.emit('data', self.require('buffer').Buffer.from(d.data));
        }
        else if (d.type === 'ws-inbound-close') {
            const socket = activeSockets[d.id];
            if (socket) { socket.emit('close'); delete activeSockets[d.id]; }
        }
        else if (d.type === 'ack') {
            if (self._ackResolver) self._ackResolver();
        }
    });

    self._syncRead = function(path) {
        self.postMessage({ type: 'sync-read', path });
        let content = "";
        const controlView = new Int32Array(controlSAB);
        
        while(true) {
            Atomics.wait(controlView, 0, 0);
            const err = Atomics.load(controlView, 4);
            if (err === 1) return null;
            
            const len = Atomics.load(controlView, 1);
            const isLast = Atomics.load(controlView, 2);
            
            const chunk = new Uint8Array(dataSAB, 0, len);
            content += new TextDecoder().decode(chunk);
            
            Atomics.store(controlView, 0, 0);
            self.postMessage({ type: 'ack' });
            
            if (isLast === 1) break;
        }
        return content;
    };
})();
`;

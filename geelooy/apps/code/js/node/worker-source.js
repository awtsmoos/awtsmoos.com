
// B"H
/**
 * @file worker-source.js
 * @brief The Breath of Life (Neshama) for the Node Simulator.
 * 
 * THE POEM OF THE INNER SANCTUM:
 * Within the walled garden of the Web Worker, the outside world is blind.
 * But we grant it 'require', 'console', and 'process', the tools of its kind.
 * It waits in perfect silence until the Buffer brings the text,
 * Evaluating the files one by one, moving from this to next.
 */

export const NodeWorkerSource = `
(function() {
    let controlSAB, dataSAB;
    const serverCallbacks = {};
    const moduleCache = {};

    self.addEventListener('message', (e) => {
        if (e.data.type === 'init-golem') {
            controlSAB = e.data.controlSAB;
            dataSAB = e.data.dataSAB;
            
            // Polyfill Console
            const origLog = console.log;
            console.log = (...args) => {
                const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                self.postMessage({ type: 'stdout', text });
            };
            console.error = console.log;
            console.warn = console.log;
            
            // Polyfill Process
            self.process = { env: {}, cwd: () => '/' };

            // Boot User Code
            try {
                const module = { exports: {} };
                const wrapper = "(function(exports, require, module, __filename, __dirname) { " + e.data.code + "\\n})";
                const compiled = eval(wrapper);
                compiled(module.exports, self.require, module, e.data.path, '/');
            } catch(err) {
                console.log("Error in Golem:", err.stack || err.message);
            }
        } 
        else if (e.data.type === 'http-inbound') {
            const { reqId, serverId, method, url, headers, body } = e.data;
            const cb = serverCallbacks[serverId];
            if (cb) {
                const req = { method, url, headers, body };
                const res = {
                    statusCode: 200,
                    headers: {},
                    setHeader(k, v) { this.headers[k] = v; },
                    writeHead(status, hdrs) { this.statusCode = status; Object.assign(this.headers, hdrs||{}); },
                    end(data) {
                        self.postMessage({ type: 'http-outbound', reqId, status: this.statusCode, headers: this.headers, data });
                    }
                };
                cb(req, res);
            }
        } 
        else if (e.data.type === 'ack') {
            if (self._ackResolver) self._ackResolver();
        }
    });

    self.require = function(id) {
        if (moduleCache[id]) return moduleCache[id].exports;

        // B"H - Core Modules
        if (id === 'http') {
            return {
                createServer(cb) {
                    const serverId = Math.random().toString(36).substr(2);
                    serverCallbacks[serverId] = cb;
                    return {
                        listen(port, callback) {
                            self.postMessage({ type: 'http-listen', port, serverId });
                            if (callback) callback();
                        }
                    };
                }
            };
        }
        if (id === 'fs') {
            return {
                readFileSync(path, enc) { return self._syncRead(path); }
            };
        }
        if (id === 'path') {
            return {
                join(...args) { return args.join('/').replace(/\\/\\//g, '/'); },
                resolve(...args) { return '/' + args.join('/').replace(/\\/\\//g, '/'); }
            };
        }

        // Custom local require
        let resolved = id;
        if (!resolved.endsWith('.js') && !resolved.endsWith('.json')) resolved += '.js';
        
        const content = self._syncRead(resolved);
        if (content === null) throw new Error("Cannot find module '" + id + "'");
        
        if (resolved.endsWith('.json')) return JSON.parse(content);
        
        const module = { exports: {} };
        moduleCache[resolved] = module; // Prevent infinite loops
        
        const wrapper = "(function(exports, require, module) { " + content + "\\n})";
        eval(wrapper)(module.exports, self.require, module);
        return module.exports;
    };

    self._syncRead = function(path) {
        self.postMessage({ type: 'sync-read', path });
        let content = "";
        const controlView = new Int32Array(controlSAB);
        const dataView = new Uint8Array(dataSAB);
        
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

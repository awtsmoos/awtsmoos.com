// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualNodeRuntime = factory().VirtualNodeRuntime; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualNodeRuntime {
        constructor({ files = {}, env = {} } = {}) {
            this.files = new Map(Object.entries(files));
            this.env = env;
            this.logs = [];
            this.spawned = [];
        }
        fs() {
            return {
                readFileSync: path => {
                    if (!this.files.has(path)) throw new Error('ENOENT: ' + path);
                    return this.files.get(path);
                },
                writeFileSync: (path, value) => this.files.set(path, String(value)),
                existsSync: path => this.files.has(path),
                readdirSync: dir => Array.from(this.files.keys()).filter(path => path.startsWith(dir)).map(path => path.slice(dir.length).replace(/^\//, '').split('/')[0]),
                mkdirSync: () => true
            };
        }
        process() { return { env: this.env, cwd: () => '/', argv: ['merkava-node'], platform: 'merkava' }; }
        child_process() { return { spawn: (cmd, args=[]) => { const item = { cmd, args, at: Date.now(), simulated: true }; this.spawned.push(item); return item; } }; }
        globals() {
            const api = { fs: this.fs(), process: this.process(), child_process: this.child_process() };
            return { api, fs: api.fs, child_process: api.child_process, console: { log: (...a)=>this.logs.push({ level:'log', args:a.map(String) }), error: (...a)=>this.logs.push({ level:'error', args:a.map(String) }) }, process: api.process };
        }
        async executeFunction(fn) {
            try { const api = { fs: this.fs(), process: this.process(), child_process: this.child_process(), globals: this.__merkavaGlobals || this.globals() }; return { ok: true, result: await fn(api), snapshot: this.snapshot() }; }
            catch (error) { return { ok: false, error: error.message, stack: error.stack, snapshot: this.snapshot() }; }
        }
        snapshot() { return { kind: 'node', files: Object.fromEntries(this.files.entries()), logs: this.logs, spawned: this.spawned }; }
    }
    return { VirtualNodeRuntime };
});

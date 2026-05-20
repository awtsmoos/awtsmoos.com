// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./ImportResolver.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.ModuleExecutor = factory(root.Merkava).ModuleExecutor; }
})(typeof self !== 'undefined' ? self : this, function(resolverMod) {
    const ImportResolver = resolverMod.ImportResolver;
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    class ModuleExecutor {
        constructor({ files = {}, graph = null, runtimeGlobals = {}, runtime = 'browser' } = {}) {
            this.files = files; this.graph = graph; this.globals = runtimeGlobals; this.runtime = runtime;
            this.resolver = new ImportResolver({ files, graph }); this.cache = new Map();
        }
        async execute(entry) { return this.load(entry); }
        async load(file) {
            if (this.cache.has(file)) return this.cache.get(file);
            if (!Object.prototype.hasOwnProperty.call(this.files, file)) throw new Error('Unresolved module: ' + file);
            const exports = {}; this.cache.set(file, exports);
            const source = this.files[file] || '';
            const imports = this.resolver.importsDetailed(source, file);
            const locals = {};
            for (const item of imports) locals[item.local] = await this.load(item.resolved);
            const code = transformModule(source, imports);
            const requireLocal = specifier => {
                const item = imports.find(x => x.specifier === specifier || x.resolved === specifier);
                if (!item) throw new Error('Unsupported require: ' + specifier);
                return locals[item.local];
            };
            const importLocal = async specifier => requireLocal(specifier);
            await AsyncFunction('globals','__exports','__modules','require','__import','with(globals){' + code + '\n}')(this.globals, exports, locals, requireLocal, importLocal);
            return exports;
        }
    }
    function transformModule(source, imports) {
        let code = source.replace(/^\s*import[\s\S]*?;?\s*$/mg, lineToBinding(imports));
        code = code.replace(/\bimport\s*\(\s*(['"][^'"]+['"])\s*\)/g, '__import($1)');
        code = code.replace(/\brequire\s*\(\s*(['"][^'"]+['"])\s*\)/g, 'require($1)');
        code = code.replace(/export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g, (_, body, spec) => exportFromBinding(body, spec, imports));
        code = code.replace(/export\s+default\s+/g, '__exports.default = ');
        code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g, '$1 $2 = __exports.$2 = ');
        code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, '__exports.$1 = function $1');
        code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, '__exports.$1 = class $1');
        code = code.replace(/export\s*\{([^}]+)\};?/g, (_, body) => body.split(',').map(x => {
            const [a,b] = x.trim().split(/\s+as\s+/); return '__exports.' + (b || a).trim() + ' = ' + a.trim() + ';';
        }).join('\n'));
        code = code.replace(/\bexports\.([A-Za-z_$][\w$]*)\s*=\s*/g, '__exports.$1 = ');
        code = code.replace(/\bmodule\.exports\s*=\s*/g, '__exports.default = ');
        return code;
    }
    function exportFromBinding(body, specifier, imports) {
        const item = imports.find(x => x.specifier === specifier);
        if (!item) return '';
        const mod = '__modules[' + JSON.stringify(item.local) + ']';
        return body.split(',').map(part => {
            const text = part.trim();
            if (!text) return '';
            const [imported, exported] = text.split(/\s+as\s+/);
            return '__exports.' + (exported || imported).trim() + ' = ' + mod + '.' + imported.trim() + ';';
        }).filter(Boolean).join('\n');
    }
    function normalizeNamedImportClause(clause) {
        const body = clause.replace(/^\{/, '').replace(/\}$/, '');
        const mapped = body.split(',').map(part => {
            const text = part.trim();
            if (!text) return '';
            const [imported, local] = text.split(/\s+as\s+/);
            return local ? imported.trim() + ': ' + local.trim() : imported.trim();
        }).filter(Boolean).join(', ');
        return '{ ' + mapped + ' }';
    }
    function lineToBinding(imports) {
        return line => {
            const item = imports.find(x => line.includes("'" + x.specifier + "'") || line.includes('"' + x.specifier + '"'));
            if (!item || !item.clause) return '';
            const mod = '__modules[' + JSON.stringify(item.local) + ']';
            const clause = item.clause.trim();
            if (clause.startsWith('{')) return 'const ' + normalizeNamedImportClause(clause) + ' = ' + mod + ';';
            if (clause.startsWith('* as ')) return 'const ' + clause.slice(5).trim() + ' = ' + mod + ';';
            if (clause.includes(',')) {
                const [def, rest] = clause.split(/,(.+)/);
                const restClause = rest.trim().startsWith('{') ? normalizeNamedImportClause(rest.trim()) : rest.trim();
                return 'const ' + def.trim() + ' = ' + mod + '.default ?? ' + mod + '; const ' + restClause + ' = ' + mod + ';';
            }
            return 'const ' + clause + ' = ' + mod + '.default ?? ' + mod + ';';
        };
    }
    return { ModuleExecutor };
});

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];

    const H = root.MerkavaVM.OpHandlers;
    const SAFE_UNDEFINED_GLOBALS = new Set(['undefined']);

    H[0x10] = t => t.pop();
    H[0x11] = t => {
        if (t.stack.length === 0) throw new Error('[VM Critical] Stack Underflow (DUP)');
        t.push(t.peek());
    };
    H[0x12] = t => { const a = t.pop(), b = t.pop(); t.push(a); t.push(b); };
    H[0x1A] = t => { const b = t.pop(), a = t.pop(); t.push(a); t.push(b); t.push(a); t.push(b); };
    H[0x1B] = t => { const d = t.pop(), c = t.pop(), b = t.pop(), a = t.pop(); t.push(c); t.push(d); t.push(a); t.push(b); };

    H[0x13] = t => { const idx = t.readU16(); t.push((idx >= 0 && idx < t.constants.length) ? t.constants[idx] : undefined); };
    H[0x14] = t => t.push(undefined);
    H[0x15] = t => t.push(null);
    H[0x16] = t => t.push(true);
    H[0x17] = t => t.push(false);
    H[0x18] = t => t.push(t.currentScope ? t.currentScope.this : undefined);
    H[0x19] = t => { const type = t.read8(); t.push(type === 0 ? (t.currentScope['new.target'] || undefined) : { url: 'virtual-module' }); };

    H[0x20] = t => { const idx = t.read8(); t.push(t.currentScope[idx]); };
    H[0x21] = t => { if (!t.currentScope) t.currentScope = {}; const idx = t.read8(); t.currentScope[idx] = t.pop(); };
    H[0x24] = t => {
        const idx = t.read8(), depth = t.read8();
        let scope = t.currentUpvalues;
        for (let i = 1; i < depth; i++) if (scope) scope = scope.__parent;
        t.push(scope ? scope[idx] : undefined);
    };
    H[0x25] = t => {
        const idx = t.read8(), depth = t.read8(), val = t.pop();
        let scope = t.currentUpvalues;
        for (let i = 1; i < depth; i++) if (scope) scope = scope.__parent;
        if (scope) scope[idx] = val;
    };

    function readGlobal(t, name) {
        if (SAFE_UNDEFINED_GLOBALS.has(name)) return undefined;
        if (name === 'exports') {
            if (t.currentScope && t.currentScope.exports) return t.currentScope.exports;
            if (t.environment && t.environment.exports) return t.environment.exports;
            if (t.vm.context && t.vm.context.exports) return t.vm.context.exports;
            return {};
        }
        if (t.withStack?.length) {
            for (let i = t.withStack.length - 1; i >= 0; i--) if (name in t.withStack[i]) return t.withStack[i][name];
        }
        if (t.environment && name in t.environment) return t.environment[name];
        if (t.vm?.memory?.globals && Object.prototype.hasOwnProperty.call(t.vm.memory.globals, name)) return t.vm.memory.getGlobal(name);
        if (t.vm.context && name in t.vm.context) return t.vm.context[name];
        throw new ReferenceError(String(name) + ' is not defined');
    }

    H[0x22] = t => { const name = t.constants[t.readU16()]; t.push(readGlobal(t, name)); };
    H[0x23] = t => {
        const name = t.constants[t.readU16()], val = t.pop();
        let stored = false;
        if (t.withStack?.length) {
            for (let i = t.withStack.length - 1; i >= 0; i--) {
                if (name in t.withStack[i]) { t.withStack[i][name] = val; stored = true; break; }
            }
        }
        if (!stored) {
            if (t.environment) t.environment[name] = val;
            else t.vm.memory.setGlobal(name, val);
        }
    };
})(typeof self !== 'undefined' ? self : this);

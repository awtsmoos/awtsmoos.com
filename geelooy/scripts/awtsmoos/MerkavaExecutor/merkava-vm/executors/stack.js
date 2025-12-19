
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];

    const H = root.MerkavaVM.OpHandlers;

    // --- STACK MANIPULATION ---
    H[0x10] = (t) => t.pop(); // POP
    H[0x11] = (t) => { // DUP
        if (t.stack.length === 0) throw new Error("[VM Critical] Stack Underflow (DUP)");
        t.push(t.peek());
    };
    H[0x12] = (t) => { const a = t.pop(), b = t.pop(); t.push(a); t.push(b); }; // SWAP
    
    // --- CONSTANTS ---
    H[0x13] = (t) => { // PUSH_CONST
        const idx = t.read16();
        t.push((idx >= 0 && idx < t.constants.length) ? t.constants[idx] : undefined);
    };
    H[0x14] = (t) => t.push(undefined);
    H[0x15] = (t) => t.push(null);
    H[0x16] = (t) => t.push(true);
    H[0x17] = (t) => t.push(false);
    H[0x18] = (t) => t.push(t.currentScope ? t.currentScope['this'] : undefined); // THIS
    H[0x19] = (t) => { // META
        const type = t.read8();
        t.push(type === 0 ? (t.currentScope['new.target'] || undefined) : { url: 'virtual-module' });
    };

    // --- VARIABLES (LOCAL) ---
    H[0x20] = (t) => { // LOAD_LOCAL
        const idx = t.read8();
        const val = t.currentScope[idx];
        // if (val === undefined) console.warn(`[VM] LOAD_LOCAL[${idx}] is UNDEFINED`);
        t.push(val);
    }; 
    H[0x21] = (t) => { // STORE_LOCAL
        if(!t.currentScope) t.currentScope={};
        const idx = t.read8();
        const val = t.pop();
        t.currentScope[idx] = val;
    };

    // --- VARIABLES (UPVALUE) ---
    H[0x24] = (t) => { // LOAD_UPVALUE
        const idx = t.read8(), depth = t.read8();
        let scope = t.currentUpvalues;
        for (let i = 1; i < depth; i++) if (scope) scope = scope.__parent;
        t.push(scope ? scope[idx] : undefined);
    };
    H[0x25] = (t) => { // STORE_UPVALUE
        const idx = t.read8(), depth = t.read8(), val = t.pop();
        let scope = t.currentUpvalues;
        for (let i = 1; i < depth; i++) if (scope) scope = scope.__parent;
        if (scope) scope[idx] = val;
        else console.error(`[VM] STORE_UPVALUE Failed: Depth ${depth}`);
    };

    // --- VARIABLES (GLOBAL) ---
    H[0x22] = (t) => { // LOAD_GLOBAL
        const name = t.constants[t.read16()];
        let val, found = false;
        if (t.withStack?.length) {
            for (let i = t.withStack.length - 1; i >= 0; i--) {
                if (name in t.withStack[i]) { t.push(t.withStack[i][name]); found = true; break; }
            }
        }
        if (!found) {
            if (name === 'exports' && t.currentScope?.exports) val = t.currentScope.exports;
            else if (t.environment && name in t.environment) val = t.environment[name];
            else {
                val = t.vm.memory.getGlobal(name);
                if (val === undefined && t.vm.context && name in t.vm.context) val = t.vm.context[name];
            }
            t.push(val);
        }
    };
    
    H[0x23] = (t) => { // STORE_GLOBAL
        const name = t.constants[t.read16()], val = t.pop();
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

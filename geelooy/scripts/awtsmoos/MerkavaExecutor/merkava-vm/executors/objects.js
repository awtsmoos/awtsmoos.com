
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    H[0x30] = (t) => t.push({}); // ALLOC_OBJECT
    H[0x31] = (t) => t.push([]); // ALLOC_ARRAY
    
    H[0x32] = (t) => { // GET_PROP
        const k = t.pop(), o = t.pop();
        if (o == null) { 
            console.warn(`[VM] Access Violation: GET_PROP '${k}' on null/undefined target. Current Thread: ${t.id}`); 
            t.push(undefined); 
            return; 
        }
        
        let val = o[k];
        
        if (val === undefined && typeof k === 'string' && (k==='values'||k==='keys'||k==='entries') && typeof self !== 'undefined' && self.Object) {
            val = self.Object[k];
        }
        
        if (typeof val === 'function' && !val._merkavaClosure) {
            const isNative = val.toString().includes('[native code]');
            const isBound = val.name.startsWith('bound ');
            
            let isConstructor = false;
            try {
                const desc = val.prototype ? Object.getOwnPropertyDescriptor(val, 'prototype') : null;
                isConstructor = !!desc && desc.writable === false;
            } catch(e) {}

            if (isNative && !isBound && !isConstructor) {
                try { 
                    val = val.bind(o); 
                } catch(e) {}
            }
        }
        t.push(val);
    };

    H[0x33] = (t) => { // SET_PROP
        const v = t.pop(), k = t.pop(), o = t.pop();
        if (o == null) {
            console.error(`[VM] Segmentation Fault: SET_PROP '${k}' on null/undefined target. Current Thread: ${t.id}`);
        } else {
            let val = v;
            if (v && v.type === 'CLOSURE' && (typeof k === 'string' && k.startsWith('on'))) {
                 val = function(...args) {
                     const th = t.vm.spawn(v.code);
                     th.currentUpvalues = v.upvalues;
                     th.environment = v.environment || th.environment;
                     const ctx = v.boundThis !== undefined ? v.boundThis : this;
                     const fArgs = (v.boundArgs || []).concat(args);
                     th.currentScope = { 'this': ctx, 'arguments': fArgs };
                     fArgs.forEach((a, i) => th.currentScope[i] = a);
                     if (t.vm.wake) t.vm.wake();
                 };
                 val._merkavaClosure = v;
            }
            if (typeof CSSStyleDeclaration !== 'undefined' && o instanceof CSSStyleDeclaration) {
                 if (o.setProperty) o.setProperty(k, String(val)); else o[k] = val;
            } else o[k] = val;
        }
        t.push(v);
    };

    H[0x34] = (t) => { const p = t.pop(), o = t.pop(); t.push(delete o[p]); }; // DELETE

    H[0xB3] = (t) => { const v = t.pop(), arr = t.peek(); if(Array.isArray(arr)) arr.push(v); };
    H[0xB4] = (t) => { const src = t.pop(), arr = t.peek(); if(Array.isArray(arr) && src && src[Symbol.iterator]) arr.push(...src); };
    H[0xB5] = (t) => { const src = t.pop(), tgt = t.peek(); if(src != null) Object.assign(tgt, src); };
    
    H[0xB6] = (t) => { 
        const keys = t.pop(), src = t.pop(), rest = {};
        if (src != null) {
            const exclude = new Set(Array.isArray(keys) ? keys.map(String) : []);
            for (const k in src) if (!exclude.has(k)) rest[k] = src[k];
        }
        t.push(rest);
    };
    
    H[0xA4] = (t) => { 
        const o = t.pop(), keys = [];
        for(const k in o) keys.push(k);
        t.push(keys[Symbol.iterator]());
    };
    
    H[0xA6] = (t) => { if(!t.withStack) t.withStack=[]; t.withStack.push(t.pop()); }; 
    H[0xA7] = (t) => t.withStack.pop(); 

})(typeof self !== 'undefined' ? self : this);

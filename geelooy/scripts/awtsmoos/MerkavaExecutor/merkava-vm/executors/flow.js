
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // --- CONTROL FLOW ---
    H[0x00] = (t) => {}; // NOP
    H[0x0a] = (t) => {}; // Crumple Zone
    H[0x01] = (t) => 'HALT';
    
    H[0x03] = (t) => t.ip += t.read16(); // JUMP
    H[0x04] = (t) => { const off = t.read16(); if (!t.pop()) t.ip += off; }; // JUMP_IF_FALSE
    H[0x05] = (t) => { const off = t.read16(); if (t.pop()) t.ip += off; }; // JUMP_IF_TRUE

    H[0x02] = (t) => { // RETURN
        const retVal = t.pop();
        
        if (t.frames.length > 0) {
            const frame = t.frames.pop();
            t.ip = frame.ip; t.bytecode = frame.bytecode; t.constants = frame.constants;
            t.currentScope = frame.scope; t.currentUpvalues = frame.upvalues; t.environment = frame.environment;
            
            let actualRet = retVal;
            if (frame.isConstructor) {
                 if (!retVal || (typeof retVal !== 'object' && typeof retVal !== 'function')) {
                     actualRet = frame.constructingInstance || frame.scope['this'];
                 }
            }
            
            while (t.stack.length > frame.stackSize) t.stack.pop();
            t.push(actualRet);
        } else {
            t.push(retVal); t.status = 'COMPLETED'; return 'COMPLETED';
        }
    };

    // --- ASYNC & SYSTEM ---
    H[0x80] = (t) => { // AWAIT
        const p = t.pop();
        if (p && typeof p.then === 'function') {
            t.status = 'AWAITING';
            p.then(
                v => { t.push(v); t.status = 'RUNNING'; if(t.vm.wake) t.vm.wake(); },
                e => { console.error("[VM] Await:", e); t.push(undefined); t.status = 'RUNNING'; if(t.vm.wake) t.vm.wake(); }
            );
        } else t.push(p);
    };

    H[0x90] = (t) => { // SYSCALL
        const id = t.read8(), argc = t.read8(), args = [];
        for(let i=0; i<argc; i++) args.unshift(t.pop());
        t.push(t.vm.hostAPI[id] ? t.vm.hostAPI[id](...args) : undefined);
    };

    H[0x91] = (t) => { throw t.pop(); }; // THROW
    
    H[0x92] = (t) => t.catchStack.push(t.ip + t.read16()); // ENTER_TRY
    H[0x93] = (t) => t.catchStack.pop(); // EXIT_TRY
    
    H[0x95] = (t) => { t.pop(); t.push(Promise.resolve({})); }; // IMPORT (Dynamic import placeholder)
    
    H[0x96] = (t) => { // IMPORT_MODULE (ES Module Resolution)
        const specifier = t.pop();
        if (t.vm.importModule) {
            t.push(t.vm.importModule(specifier));
        } else {
            console.warn("[VM] importModule bridge not found. Returning empty vessel.");
            t.push(Promise.resolve({}));
        }
    };
    
    // --- ADVANCED FLOW ---
    H[0xA0] = (t) => { // GET_ITERATOR
        const v = t.pop();
        if (v && typeof v[Symbol.iterator] === 'function') t.push(v[Symbol.iterator]());
        else throw new TypeError("Not iterable");
    };
    H[0xA1] = (t) => t.push(t.peek().next()); // NEXT
    H[0xA2] = (t) => t.push(t.peek().done);   // DONE
    H[0xA3] = (t) => { const res = t.peek(); t.pop(); t.push(res.value); }; // VALUE
    
    H[0xA5] = (t) => { // CHAIN_CHECK
        const off = t.read16(), val = t.peek();
        if (val == null) { t.pop(); t.push(undefined); t.ip += off; }
    };
})(typeof self !== 'undefined' ? self : this);

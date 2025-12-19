
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    H[0x70] = (t) => { // CLOSURE
        const code = t.constants[t.read16()], flags = t.read8();
        if (t.currentScope && !t.currentScope.__parent) t.currentScope.__parent = t.currentUpvalues;
        const cls = { 
            type: 'CLOSURE', code, 
            isAsync: !!(flags & 1), isGenerator: !!(flags & 2), isArrow: !!(flags & 4),
            upvalues: t.currentScope, environment: t.environment, prototype: {} 
        };
        cls.bind = (thisArg, ...args) => ({ ...cls, boundThis: thisArg, boundArgs: args });
        t.push(cls);
    };

    const runClosure = (t, callee, args, isNew) => {
        const finalArgs = (callee.boundArgs || []).concat(args);
        t.frames.push({
            ip: t.ip, bytecode: t.bytecode, constants: t.constants,
            scope: t.currentScope, upvalues: t.currentUpvalues, stackSize: t.stack.length,
            environment: t.environment, isConstructor: isNew,
            constructingInstance: isNew ? Object.create(callee.prototype || {}) : null
        });
        
        t.bytecode = callee.code.bytecode;
        t.constants = callee.code.constants;
        t.ip = 0;

        const scopeThis = isNew 
            ? t.frames[t.frames.length-1].constructingInstance 
            : (callee.isArrow ? (callee.upvalues ? callee.upvalues['this'] : undefined) : (callee.boundThis !== undefined ? callee.boundThis : t.environment));

        t.currentScope = { 'this': scopeThis, 'arguments': finalArgs };
        t.currentUpvalues = callee.upvalues;
        t.environment = callee.environment || t.environment;
        finalArgs.forEach((a, i) => t.currentScope[i] = a);
    };

    H[0x71] = (t) => { // CALL
        const count = t.read8();
        const args = []; for(let i=0; i<count; i++) args.unshift(t.pop());
        let callee = t.pop(), ctx = t.pop() || t.environment;

        if (typeof callee === 'function' && callee._merkavaClosure) callee = callee._merkavaClosure;

        if (callee && callee.type === 'CLOSURE') {
            if (callee.boundThis === undefined && !callee.isArrow) callee.boundThis = ctx;
            runClosure(t, callee, args, false);
        } else if (typeof callee === 'function') {
            args.forEach((a, i) => { 
                if (a && a.type === 'CLOSURE') {
                    args[i] = function(...inner) {
                        const nt = t.vm.spawn(a.code);
                        nt.currentUpvalues = a.upvalues;
                        nt.environment = a.environment || nt.environment;
                        const fArgs = (a.boundArgs||[]).concat(inner);
                        nt.currentScope = { 'this': this, 'arguments': fArgs };
                        fArgs.forEach((v,k)=>nt.currentScope[k]=v);
                        if(t.vm.wake) t.vm.wake();
                    };
                    args[i]._merkavaClosure = a;
                }
            });
            try {
                // B"H - Context Fallback for Native Calls
                // If ctx is undefined, default to globalThis (window/self) to prevent 'Illegal invocation'
                const safeCtx = ctx || (typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : window));
                t.push(callee.apply(safeCtx, args));
            } catch(e) {
                console.error("[VM] Native Call Error:", e);
                console.error("Callee:", callee);
                console.error("Context:", ctx);
                console.error("Args:", args);
                throw e; 
            }
        } else {
            throw new TypeError(`[VM] Call Error: ${typeof callee} is not a function`);
        }
    };

    H[0x72] = (t) => { // NEW
        const count = t.read8();
        const args = []; for(let i=0; i<count; i++) args.unshift(t.pop());
        let callee = t.pop();
        if (typeof callee === 'function' && callee._merkavaClosure) callee = callee._merkavaClosure;

        if (callee && callee.type === 'CLOSURE') runClosure(t, callee, args, true);
        else if (typeof callee === 'function') t.push(new callee(...args));
        else throw new TypeError(`[VM] New Error: ${typeof callee} is not a constructor`);
    };

    H[0x73] = (t) => { // MAKE_CLASS
        t.read16(); 
        const ctor = t.pop(), sup = t.pop();
        let final = ctor || { type: 'CLOSURE', code: { bytecode: [0x02], constants: [] }, upvalues: t.currentScope, prototype: {} };

        if (sup) {
            final.prototype = Object.create(sup.prototype || {});
            final.prototype.constructor = final;
        } else {
            final.prototype = { constructor: final };
        }
        t.push(final);
    };
})(typeof self !== 'undefined' ? self : this);

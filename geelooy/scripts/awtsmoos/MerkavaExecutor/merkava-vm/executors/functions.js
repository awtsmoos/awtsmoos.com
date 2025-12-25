
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    H[0x70] = (t) => { // CLOSURE
        const code = t.constants[t.readU16()], flags = t.read8();
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

    const captureEvent = (e) => {
        if (!e || !(e instanceof Event || (e.constructor && e.constructor.name.includes('Event')))) return e;
        const copy = {};
        const props = [
            'key', 'code', 'clientX', 'clientY', 'offsetX', 'offsetY',
            'target', 'type', 'button', 'buttons', 'shiftKey', 'ctrlKey', 
            'altKey', 'metaKey', 'detail', 'deltaX', 'deltaY', 'deltaZ'
        ];
        props.forEach(k => { if (e[k] !== undefined) copy[k] = e[k]; });
        copy.preventDefault = () => { try { e.preventDefault(); } catch(err) {} };
        copy.stopPropagation = () => { try { e.stopPropagation(); } catch(err) {} };
        return copy;
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
            const wrappedCache = new WeakMap();
            const wrapForHost = (v) => {
                if (!v || typeof v !== 'object') return v;
                if (wrappedCache.has(v)) return wrappedCache.get(v);

                if (v.type === 'CLOSURE') {
                    const wrapped = function(...inner) {
                        const safeInner = inner.map(captureEvent);
                        const nt = t.vm.spawn(v.code);
                        nt.currentUpvalues = v.upvalues;
                        nt.environment = v.environment || nt.environment;
                        const fArgs = (v.boundArgs || []).concat(safeInner);
                        nt.currentScope = { 'this': this, 'arguments': fArgs };
                        fArgs.forEach((val, k) => nt.currentScope[k] = val);
                        if (t.vm.wake) t.vm.wake();
                    };
                    wrapped._merkavaClosure = v;
                    wrappedCache.set(v, wrapped);
                    return wrapped;
                }
                return v;
            };

            const hostArgs = args.map(wrapForHost);
            try {
                const globalObj = (typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : window));
                const safeCtx = (ctx === undefined || ctx === null) ? globalObj : ctx;
                t.push(callee.apply(safeCtx, hostArgs));
            } catch(e) {
                console.error("[VM] Native Call Error:", e);
                throw e; 
            }
        } else {
            throw new TypeError(`[VM] Call Error: ${typeof callee} is not a function.`);
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
        t.readU16(); 
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

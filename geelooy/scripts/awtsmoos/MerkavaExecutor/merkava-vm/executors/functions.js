// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // B"H (2026-10-09): hoisted — was recomputed on every host call.
    const GLOBAL_OBJ = typeof globalThis !== 'undefined' ? globalThis
        : (typeof self !== 'undefined' ? self : this);

    const wrapForHost = (t, v) => {
        if (!v || typeof v !== 'object') return v;
        if (v.__kind === 'function' && typeof v.call === 'function') {
            // B"H: host-lowered VM function (DefaultMerkavaHost.makeFunction).
            // Bridge V8-side calls back into the host interpreter.
            const fn = v;
            return (...inner) => fn.call(inner);
        }
        if (v.type === 'CLOSURE') {
            const wrapped = function(...inner) {
                const safeInner = inner.map(captureEvent);
                const nt = t.vm.spawn(v.code);
                nt.currentUpvalues = v.upvalues;
                nt.environment = v.environment || nt.environment;
                const fArgs = (v.boundArgs || []).concat(safeInner);
                nt.currentScope = { 'this': this, 'arguments': fArgs };
                for (let k = 0; k < fArgs.length; k++) nt.currentScope[k] = fArgs[k];
                if (t.vm.wake) t.vm.wake();
            };
            wrapped._merkavaClosure = v;
            return wrapped;
        }
        return v;
    };

    // B"H: shared with executors/json.js (JSON.parse/stringify fast path).
    root.MerkavaVM.wrapForHost = wrapForHost;

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

    // B"H (Chrome Jun-2026 call port): frame shell pool. CALL/RETURN used to
    // allocate a fresh 10-field frame object per invocation (fib(22) = 57k
    // frames). Frames are strictly LIFO, so a simple stack pool recycles them
    // with zero per-call allocation in the common case. Released by the
    // RETURN handler (flow.js) after it has consumed the fields.
    const framePool = [];
    const obtainFrame = () => framePool.pop() || {};
    const releaseFrame = (fr) => {
        fr.ip = undefined; fr.bytecode = undefined; fr.constants = undefined;
        fr.scope = undefined; fr.upvalues = undefined; fr.stackSize = 0;
        fr.environment = undefined; fr.isConstructor = false;
        fr.constructingInstance = undefined; fr.catchDepth = 0;
        framePool.push(fr);
    };
    root.MerkavaVM.releaseCallFrame = releaseFrame;

    const runClosure = (t, callee, args, isNew) => {
        // B"H (2026-10-09): skip concat alloc when there are no bound args.
        const finalArgs = callee.boundArgs ? callee.boundArgs.concat(args) : args;
        const fr = obtainFrame();
        fr.ip = t.ip; fr.bytecode = t.bytecode; fr.constants = t.constants;
        fr.scope = t.currentScope; fr.upvalues = t.currentUpvalues; fr.stackSize = t._sp;
        fr.environment = t.environment; fr.isConstructor = isNew;
        fr.constructingInstance = isNew ? Object.create(callee.prototype || {}) : null;
        // B"H 2026-10-09: try-contexts opened inside the callee die with it.
        fr.catchDepth = t.catchStack.length;
        t.frames.push(fr);

        t.bytecode = callee.code.bytecode;
        t.constants = callee.code.constants;
        t.ip = 0;

        const scopeThis = isNew
            ? t.frames[t.frames.length-1].constructingInstance
            : (callee.isArrow ? (callee.upvalues ? callee.upvalues['this'] : undefined) : (callee.boundThis !== undefined ? callee.boundThis : t.environment));

        t.currentScope = { 'this': scopeThis, 'arguments': finalArgs };
        t.currentUpvalues = callee.upvalues;
        t.environment = callee.environment || t.environment;
        // B"H (2026-10-09): plain for loop (was forEach closure alloc per call).
        for (let i = 0; i < finalArgs.length; i++) t.currentScope[i] = finalArgs[i];
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
        // B"H (Chrome Jun-2026 call port): direct indexed stack read. The old
        // loop called t.pop() count+2 times (method call + branch each); this
        // reads t.stack/t._sp directly with identical slot-clearing semantics.
        const args = new Array(count);
        const base = t._sp - count;
        let callee, ctx;
        if (base >= 2) {
            for (let i = 0; i < count; i++) { args[i] = t.stack[base + i]; t.stack[base + i] = undefined; }
            callee = t.stack[base - 1]; t.stack[base - 1] = undefined;
            ctx = t.stack[base - 2] || t.environment; t.stack[base - 2] = undefined;
            t._sp = base - 2;
        } else {
            // B"H: underflow fallback — preserves t.pop()'s no-decrement-below-0 semantics.
            for (let i = count - 1; i >= 0; i--) args[i] = t.pop();
            callee = t.pop(); ctx = t.pop() || t.environment;
        }

        if (typeof callee === 'function' && callee._merkavaClosure) callee = callee._merkavaClosure;

        if (callee && callee.type === 'CLOSURE') {
            if (callee.boundThis === undefined && !callee.isArrow) callee.boundThis = ctx;
            runClosure(t, callee, args, false);
        } else if (typeof callee === 'function') {
            // B"H (2026-10-09): wrap in place (was args.map alloc); the old
            // per-call WeakMap never hit (fresh each call) — removed.
            for (let i = 0; i < args.length; i++) args[i] = wrapForHost(t, args[i]);

            try {
                const safeCtx = (ctx === undefined || ctx === null) ? GLOBAL_OBJ : ctx;
                t.push(callee.apply(safeCtx, args));
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
        // B"H (2026-10-09): indexed fill O(n) (was unshift loop O(n^2)).
        const args = new Array(count);
        for (let i = count - 1; i >= 0; i--) args[i] = t.pop();
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

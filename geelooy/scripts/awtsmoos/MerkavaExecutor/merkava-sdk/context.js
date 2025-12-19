
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    Internal.ContextBuilder = {
        build(options, memory) {
            const base = options.context || {};
            const overrides = {};
            const vmRef = { current: null };

            // 1. Built-in Globals
            const builtIns = [
                'Object','Array','String','Number','Boolean','Date','Math','JSON','Promise',
                'RegExp','Error','Map','Set','WeakMap','WeakSet','Symbol','Proxy','Reflect',
                'parseInt','parseFloat','isNaN','isFinite','console','EventTarget','atob','btoa'
            ];
            builtIns.forEach(k => { if(self[k]) overrides[k] = self[k]; });

            // 2. Scheduler Bridge
            const bridge = (cb) => {
                if (cb && cb.type === 'CLOSURE') {
                    return (...args) => {
                        if (!vmRef.current) return;
                        const t = vmRef.current.spawn(cb.code);
                        t.currentUpvalues = cb.upvalues;
                        t.environment = cb.environment || t.environment;
                        t.currentScope = { 'this': base, 'arguments': args };
                        args.forEach((a,i)=>t.currentScope[i]=a);
                        if (vmRef.current.wake) vmRef.current.wake();
                    };
                }
                return cb;
            };

            ['requestAnimationFrame','setTimeout','setInterval'].forEach(k => {
                if (typeof self[k] === 'function') overrides[k] = (cb, ...args) => self[k](bridge(cb), ...args);
            });
            ['cancelAnimationFrame','clearTimeout','clearInterval'].forEach(k => overrides[k] = self[k]);

            // 3. Worker & System
            if (Internal.WorkerProxy) overrides.Worker = (u) => new Internal.WorkerProxy(u, vmRef.current, options);
            
            overrides.importScripts = async (...urls) => {
                // Implementation moved to core.js or kept simple here?
                // Kept in core run loop logic usually, but here needs access to VM.
                // We will delegate to a helper on the VM instance later.
                if (vmRef.current && vmRef.current.importScripts) await vmRef.current.importScripts(...urls);
            };

            // 4. Document Proxy
            Object.defineProperty(overrides, 'document', {
                get() {
                    const doc = base.document || self.document;
                    return new Proxy(doc, {
                        get(t, p) {
                            if (p === 'getElementById') return (id) => t.getElementById(id);
                            if (p === 'addEventListener') return (ev, l, o) => t.addEventListener(ev, bridge(l), o);
                            const v = t[p];
                            return typeof v === 'function' ? v.bind(t) : v;
                        }
                    });
                },
                configurable: true
            });

            // 5. Global Proxy
            Object.defineProperty(overrides, '__vmRef', { value: vmRef });
            
            const ctx = new Proxy(overrides, {
                get(t, p) { 
                    if (p in t) return t[p];
                    return base[p];
                },
                set(t, p, v) {
                    if (p in t) { t[p] = v; return true; }
                    base[p] = (v && v.type === 'CLOSURE') ? bridge(v) : v;
                    return true;
                },
                has(t, p) { return p in t || p in base; }
            });
            
            overrides.self = overrides.window = overrides.globalThis = ctx;
            return ctx;
        }
    };
})(typeof self !== 'undefined' ? self : this);

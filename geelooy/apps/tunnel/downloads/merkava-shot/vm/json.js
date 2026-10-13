// B"H
// Boruch Hashem

/**
 * @module MerkavaVmJsonExecutors
 * @description Dedicated fast path for JSON.parse / JSON.stringify.
 *
 * The compiler (MerkavaJsonCompiler) emits SYS.jsonParse (50) / SYS.jsonStringify (51)
 * for `JSON.parse(x)` / `JSON.stringify(x)` calls instead of the generic callMethod
 * syscall. This handler pops the receiver and args directly off the stack — no
 * arg array, no spread, no per-arg closure allocation — and invokes the host
 * JSON natively.
 *
 * Correctness: a runtime identity check against the VM's captured host JSON
 * (see MerkavaVM constructor) keeps shadowing exact. If the loaded JSON object
 * is not the host JSON (parameter shadow, global reassignment, with-scope),
 * it falls back to generic method-call semantics with the right receiver.
 *
 * Stack on entry: [jsonObj, arg0, arg1, ...]  (argc = 1 + argCount)
 */
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    function wrapArg(t, v) {
        const w = root.MerkavaVM.wrapForHost;
        return w ? w(t, v) : v;
    }

    // which: 0 = parse, 1 = stringify
    function jsonCall(t, which, argc) {
        const n = argc - 1;
        let a0, a1, a2;
        if (n > 2) a2 = t.pop();
        if (n > 1) a1 = t.pop();
        if (n > 0) a0 = t.pop();
        const jsonObj = t.pop();
        const vm = t.vm;
        const w0 = wrapArg(t, a0);
        const w1 = n > 1 ? wrapArg(t, a1) : undefined;
        const w2 = n > 2 ? wrapArg(t, a2) : undefined;
        if (vm && jsonObj === vm._hostJSON) {
            if (which === 0) {
                t.push(n > 1 ? vm._hostJSONParse(w0, w1) : vm._hostJSONParse(w0));
            } else {
                t.push(n > 2 ? vm._hostJSONStringify(w0, w1, w2)
                    : n > 1 ? vm._hostJSONStringify(w0, w1)
                    : vm._hostJSONStringify(w0));
            }
            return;
        }
        // Slow path: shadowed or replaced JSON — exact generic semantics.
        // Accepts native functions and host-lowered VM functions (__kind).
        const m = jsonObj == null ? undefined : (which === 0 ? jsonObj.parse : jsonObj.stringify);
        const fn = (typeof m === 'function') ? (...a) => m.apply(jsonObj, a)
            : (m && m.__kind === 'function' && typeof m.call === 'function') ? (...a) => m.call(a, jsonObj)
            : null;
        if (!fn) {
            throw new TypeError('[VM] JSON method is not a function');
        }
        t.push(n > 2 ? fn(w0, w1, w2)
            : n > 1 ? fn(w0, w1)
            : n > 0 ? fn(w0)
            : fn());
    }

    root.MerkavaVM.jsonCall = jsonCall;
})(typeof self !== 'undefined' ? self : this);

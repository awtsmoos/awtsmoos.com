// B"H
/**
 * @file DefaultMerkavaHost.js
 * @description Chapter 80: the Merkava VM host learns mercy before infinity.
 * Chrome reports one exception; it does not consume the process. This host now
 * guards recursive AST interpretation, reports the op/get path that exceeded
 * fuel, and keeps native hooks separate from Merkava function vessels.
 *
 * B"H 2026-10-09: stress-test hardening —
 * - while-loop guard raised to 100M (was 10k, silently truncating legit loops),
 *   configurable via rootScope.__merkavaMaxLoop.
 * - `pow` op for ** exponent.
 * - `instanceof` op with VM-class chain walk + native fallback.
 * - SYS 47/48/49: arraySpread, spreadCall, spreadCallMethod.
 */
const { installCompactClasses, newCompactInstance, callCompactMethod } = require('./CompactClassRuntime.js');
// B"H stream 7: native tier spawns compiled binaries via execFileSync.
const { execFileSync } = require('child_process');

function createDefaultHost(rootScope = {}) {
  const MAX_DEPTH = Number(rootScope.__merkavaMaxDepth || 900);
  const MAX_STEPS = Number(rootScope.__merkavaMaxSteps || 240000);
  const MAX_LOOP = Number(rootScope.__merkavaMaxLoop || 100000000);
  let stepCount = 0;
  const trace = [];
  // B"H (2026-10-09): hoisted — was Object.prototype.hasOwnProperty.call per use.
  const hasOwn = Object.prototype.hasOwnProperty;
  const RETURN = Symbol('merkavaReturn');
  const isReturn = value => value && value.__signal === RETURN;
  const makeReturn = value => ({ __signal: RETURN, value });
  // B"H 2026-10-09: full method kinds. Static methods attach to the class object
  // itself; get/set become real prototype (or static) accessors via
  // defineProperty; plain methods stay in methods[] for findMethod.
  const defineClass = (desc, superClass = null, closure = {}) => {
    const klassClosure = Object.assign(Object.create(null), rootScope, closure || {});
    const klass = { __kind: 'class', name: desc.name || '', prototype: {}, methods: [], fields: desc.fields || [], superClass, closure: klassClosure };
    // B"H 2026-10-09: method bodies arrive as {op:'block',body:[...]} (for the
    // instance-method interpretNode path); makeFunction needs the raw steps.
    const fnDescOf = m => ({ op: 'function', name: m.name, params: m.params || [], body: (m.body && m.body.op === 'block' && Array.isArray(m.body.body)) ? m.body.body : m.body, arrow: false });
    for (const m of desc.methods || []) {
      if (m.static) {
        if (m.kind === 'get') defineAccessor(klass, m.name, { getter: fnDescOf(m) }, klassClosure);
        else if (m.kind === 'set') defineAccessor(klass, m.name, { setter: fnDescOf(m) }, klassClosure);
        else klass[m.name] = interpretNode(fnDescOf(m), klassClosure);
      } else if (m.kind === 'get') {
        const cur = Object.getOwnPropertyDescriptor(klass.prototype, m.name);
        const d = cur || { enumerable: false, configurable: true };
        const g = interpretNode(fnDescOf(m), klassClosure);
        d.get = function() { return g.call([], this); };
        Object.defineProperty(klass.prototype, m.name, d);
      } else if (m.kind === 'set') {
        const cur = Object.getOwnPropertyDescriptor(klass.prototype, m.name);
        const d = cur || { enumerable: false, configurable: true };
        const s = interpretNode(fnDescOf(m), klassClosure);
        d.set = function(v) { s.call([v], this); };
        Object.defineProperty(klass.prototype, m.name, d);
      } else {
        klass.methods.push(m);
      }
    }
    // B"H (perf): O(1) method map. Was: findMethod() ran a linear .find() plus
    // a per-call object spread on EVERY method invocation. Owner is bound at
    // definition time (one spread per method, once); lookups return the shared
    // record with zero per-call allocation. Monkey-patched prototype methods
    // still win: findMethod checks the live prototype BEFORE this map.
    // Memory: one Map per class + one small record per method, freed with the
    // class. klass.methods is never mutated after this point (verified).
    if (klass.methods.length > 0) {
      const methodMap = new Map();
      for (const m of klass.methods) {
        if (m && m.name !== undefined && !methodMap.has(m.name)) methodMap.set(m.name, { ...m, owner: klass });
      }
      klass._methodMap = methodMap;
    }
    return klass;
  };
  // B"H (2026-10-09): the trace now stores raw nodes; labels are computed
  // lazily on error only. Was: nodeLabel() string-building on EVERY node.
  const traceLabels = () => {
    const out = new Array(trace.length);
    for (let i = 0; i < trace.length; i++) out[i] = nodeLabel(trace[i]);
    return out;
  };
  const makeVmError = message => {
    const labels = traceLabels();
    const error = new Error(`${message} | trace=${labels.slice(-18).join(' > ')}`);
    error.code = 'MERKAVA_VM_INTERPRETER_GUARD';
    error.trace = labels.slice(-80);
    return error;
  };

  const findMethod = (klass, name) => {
    if (!klass) return null;
    // B"H 2026-10-09: prototype object first — monkey-patched methods override.
    if (klass.prototype && klass.prototype[name]?.__kind === 'function') {
      return { __patchedFn: klass.prototype[name], owner: klass };
    }
    // B"H (perf): O(1) map hit — was linear .find() + per-call spread.
    if (klass._methodMap) {
      const found = klass._methodMap.get(name);
      if (found !== undefined) return found;
    } else {
      const method = (klass.methods || []).find(m => m.name === name);
      if (method) return { ...method, owner: klass };
    }
    return findMethod(klass.superClass, name);
  };
  const newInstance = (klass, args = []) => {
    if (!klass) throw new TypeError('undefined is not a constructor');
    if (!klass) throw new TypeError('undefined is not a constructor');
    // B"H 2026-10-09: instances delegate to klass.prototype, so prototype
    // getters/setters fire on property access/assignment (native semantics).
    // Object.create(proto) is cheaper than setPrototypeOf (no deopt).
    const instance = Object.create(klass.prototype || null);
    instance.__kind = 'instance'; instance.__class = klass; instance.fields = {};
    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, Object.assign(Object.create(klass.closure || null), { this: instance }));
    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, Object.assign(Object.create(klass.closure || null), { this: instance }));
    const ctor = findMethod(klass, 'constructor');
    if (ctor) {
      const scope = Object.assign(Object.create(ctor.owner.closure || null), { this: instance, arguments: args, __class: ctor.owner });
      bindParams(scope, ctor.params || [], args);
      interpretNode(ctor.body, scope);
    }
    return instance;
  };
  const makeSyncPromise = value => ({ __kind: 'syncPromise', value, then(fn) { return makeSyncPromise(callFunction(fn, value)); }, catch() { return this; } });
  const unwrapPromiseValue = value => value && value.__kind === 'syncPromise' ? value.value : value;
  const nativePromise = { resolve: value => makeSyncPromise(value), reject: reason => { throw reason; }, all: values => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)), race: values => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)[0]) };
  const bindParams = (scope, params = [], args = []) => {
    let argIndex = 0;
    for (const param of params || []) {
      if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex);
      else if (param && typeof param === 'object' && param.name) {
        const value = args[argIndex++];
        scope[param.name] = value === undefined ? interpretNode(param.default, scope) : value;
      } else scope[param] = args[argIndex++];
    }
  };
  // B"H (2026-10-09): shared scope-holder walk for write(). Returns the object
  // in the chain that owns key, or scope itself when key is new.
  const writeHolder = (scope, key) => {
    let cursor = scope;
    while (cursor && cursor !== Object.prototype) {
      if (hasOwn.call(cursor, key)) return cursor;
      cursor = Object.getPrototypeOf(cursor);
    }
    return scope;
  };
  // B"H (2026-10-09): monomorphic inline cache for variable reads, attached
  // to the AST node (site). Loop bodies reuse the same scope object, so the
  // 2nd straight hit installs: later reads are one identity check + one load.
  // A scope change demotes to uninstalled (self-healing, no stale reads).
  // Memory: one scope reference per hot read site; nothing per variable.
  const read = (name, scope = {}, site = null) => {
    // B"H: skip String() for the common string-name case.
    const key = typeof name === 'string' ? name : (typeof name === 'symbol' ? name : String(name));
    if (site) {
      const rs = site._rIC;
      if (rs !== undefined) {
        if (rs === scope) return scope[key];
        site._rIC = undefined;
        site._rCand = scope;
      } else if (site._rCand === scope) {
        if (scope && key in scope) site._rIC = scope;
      } else {
        site._rCand = scope;
      }
    }
    if (scope && key in scope) return scope[key];
    if (hasOwn.call(rootScope, key)) return rootScope[key];
    if (key === 'undefined') return undefined;
    if (key === 'Promise') return nativePromise;
    if (hasOwn.call(globalThis, key)) return globalThis[key];
    throw new ReferenceError(String(key) + ' is not defined');
  };
  // B"H (2026-10-09): monomorphic inline cache for variable writes, attached
  // to the AST node. Caches the holder object found by the chain walk, so hot
  // stores skip String(), the walk, and getPrototypeOf entirely.
  // Memory: one tiny {s, h} record per hot write site.
  const write = (name, value, scope = {}, site = null) => {
    const key = typeof name === 'string' ? name : String(name);
    if (site) {
      const wic = site._wIC;
      if (wic !== undefined) {
        if (wic.s === scope) { wic.h[key] = value; return value; }
        site._wIC = undefined;
        site._wCand = scope;
      } else if (site._wCand === scope) {
        const h = writeHolder(scope, key);
        site._wIC = { s: scope, h };
        h[key] = value;
        return value;
      } else {
        site._wCand = scope;
      }
    }
    const h = writeHolder(scope, key);
    h[key] = value;
    return value;
  };
  const nodeLabel = node => {
    if (node == null) return 'null';
    if (typeof node !== 'object') return typeof node;
    if (node.op) return `op:${node.op}`;
    if (node.get) return `get:${String(node.get).slice(0, 40)}`;
    if (hasOwn.call(node, 'const')) return 'const';
    return 'object-node';
  };
  const evalBlock = (body = [], scope = {}) => {
    let value;
    for (const step of body) {
      if (step?.op === 'return') return makeReturn(interpretNode(step.value, scope));
      value = interpretNode(step, scope);
      if (isReturn(value)) return value;
    }
    return value;
  };
  const spreadFlat = flat => {
    const out = [];
    for (let i = 0; i < flat.length;) {
      if (flat[i++] === true) out.push(...Array.from(flat[i++] || []));
      else out.push(flat[i++]);
    }
    return out;
  };
  const interpretNode = (node, scope = {}, depth = 0) => {
    stepCount += 1;
    if (stepCount > MAX_STEPS) throw makeVmError("Merkava interpreter step budget exceeded at " + nodeLabel(node));
    if (depth > MAX_DEPTH) throw makeVmError(`Merkava interpreter depth exceeded at ${nodeLabel(node)}`);
    trace.push(node);
    try {
      if (node == null) return null;
      if (typeof node !== 'object') return node;
      if (hasOwn.call(node, 'const')) return node.const;
      if (node.get) return read(node.get, scope, node);
      if (node.op === 'set') return write(node.name, interpretNode(node.value, scope, depth + 1), scope, node);
      if (node.op === 'declare') { const v = interpretNode(node.value, scope, depth + 1); scope[node.name] = v; return v; }
      // B"H 2026-10-09: postfix i++ returns old value.
      if (node.op === 'postUpdate') { const old = read(node.name, scope, node); write(node.name, old + node.delta.const, scope, node); return old; }
      if (node.op === 'add') return interpretNode(node.args[0], scope, depth + 1) + interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'sub') return interpretNode(node.args[0], scope, depth + 1) - interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'mul') return interpretNode(node.args[0], scope, depth + 1) * interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'div') return interpretNode(node.args[0], scope, depth + 1) / interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'mod') return interpretNode(node.args[0], scope, depth + 1) % interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'pow') return Math.pow(interpretNode(node.args[0], scope, depth + 1), interpretNode(node.args[1], scope, depth + 1));
      // B"H 2026-10-09: bitwise ops — native JS semantics (ToInt32 etc.) come
      // free since values are real JS values. BigInt operands work natively too.
      if (node.op === 'band') return interpretNode(node.args[0], scope, depth + 1) & interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'bor') return interpretNode(node.args[0], scope, depth + 1) | interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'bxor') return interpretNode(node.args[0], scope, depth + 1) ^ interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'shl') return interpretNode(node.args[0], scope, depth + 1) << interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'shr') return interpretNode(node.args[0], scope, depth + 1) >> interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'ushr') return interpretNode(node.args[0], scope, depth + 1) >>> interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'bitnot') return ~interpretNode(node.value, scope, depth + 1);
      if (node.op === 'deleteProp') {
        const target = interpretNode(node.object, scope, depth + 1);
        const key = interpretNode(node.prop, scope, depth + 1);
        if (target == null) throw new TypeError('Cannot convert undefined or null to object');
        return delete target[key];
      }
      // B"H 2026-10-09: `in` — RHS must be an object (native TypeError otherwise).
      if (node.op === 'in') return interpretNode(node.args[0], scope, depth + 1) in Object(interpretNode(node.args[1], scope, depth + 1));
      if (node.op === 'nullish') { const a = interpretNode(node.args[0], scope, depth + 1); return a != null ? a : interpretNode(node.args[1], scope, depth + 1); }
      if (node.op === 'arraySpread') {
        const out = []; const parts = node.parts || [];
        for (let i = 0; i < parts.length;) {
          const isSpread = interpretNode(parts[i++], scope, depth + 1);
          const val = interpretNode(parts[i++], scope, depth + 1);
          if (isSpread) out.push(...Array.from(val || [])); else out.push(val);
        }
        return out;
      }
      if (node.op === 'spreadCall' || node.op === 'spreadCallMethod') {
        const args = []; const parts = node.parts || [];
        for (let i = 0; i < parts.length;) {
          const isSpread = interpretNode(parts[i++], scope, depth + 1);
          const val = interpretNode(parts[i++], scope, depth + 1);
          if (isSpread) args.push(...Array.from(val || [])); else args.push(val);
        }
        if (node.op === 'spreadCall') return callFunction(interpretNode(node.fn, scope, depth + 1), ...args);
        return callMethod(interpretNode(node.object, scope, depth + 1), node.method, ...args);
      }
      if (node.op === 'eq') return interpretNode(node.args[0], scope, depth + 1) == interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'seq') return interpretNode(node.args[0], scope, depth + 1) === interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'neq') return interpretNode(node.args[0], scope, depth + 1) != interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'sneq') return interpretNode(node.args[0], scope, depth + 1) !== interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'lt') return interpretNode(node.args[0], scope, depth + 1) < interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'lte') return interpretNode(node.args[0], scope, depth + 1) <= interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'gt') return interpretNode(node.args[0], scope, depth + 1) > interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'gte') return interpretNode(node.args[0], scope, depth + 1) >= interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'and') return interpretNode(node.args[0], scope, depth + 1) && interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'or') return interpretNode(node.args[0], scope, depth + 1) || interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'not') return !interpretNode(node.value, scope, depth + 1);
      if (node.op === 'neg') return -interpretNode(node.value, scope, depth + 1);
      if (node.op === 'pos') return +interpretNode(node.value, scope, depth + 1);
      if (node.op === 'typeof') {
        try {
          const v = interpretNode(node.value, scope, depth + 1);
          if (v && v.__kind === 'function') return 'function';
          return typeof v;
        }
        catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; }
      }
      if (node.op === 'void') return void interpretNode(node.value, scope, depth + 1);
      if (node.op === 'typeofName') { try { const tv = read(node.name, scope, node); if (tv && tv.__kind === 'function') return 'function'; return typeof tv; } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }
      if (node.op === 'typeofName') { try { const tv = read(node.name, scope, node); if (tv && tv.__kind === 'function') return 'function'; return typeof tv; } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }
      if (node.op === 'await') { const value = interpretNode(node.value, scope, depth + 1); return value && value.__kind === 'syncPromise' ? value.value : value; }
      if (node.op === 'array') return (node.items || []).map(item => interpretNode(item, scope, depth + 1));
      if (node.op === 'object') {
        const out = {};
        for (const prop of node.props || []) {
          // B"H 2026-10-09: get/set become real accessors, not data props.
          if (prop.getter || prop.setter) defineAccessor(out, prop.key, prop, scope);
          else out[prop.key] = interpretNode(prop.value, scope, depth + 1);
        }
        return out;
      }
      if (node.op === 'objectMerge') { const out = {}; for (const part of node.parts || []) { if (part.spread) Object.assign(out, interpretNode(part.spread, scope, depth + 1) || {}); else out[part.key] = interpretNode(part.value, scope, depth + 1); } return out; }
      if (node.op === 'typedArray') { const values = (node.items || []).map(item => interpretNode(item, scope, depth + 1)); const Ctor = globalThis[node.kind] || Uint8Array; return new Ctor(values); }
      if (node.op === 'newError') return new Error(interpretNode(node.message, scope, depth + 1));
      if (node.op === 'throw') throw interpretNode(node.value, scope, depth + 1);
      // B"H 2026-10-09: return signals propagate out of try/catch/finally
      // (were silently swallowed before). finally still runs before the
      // return completes, per JS semantics.
      if (node.op === 'try') {
        try { return evalBlock(node.body || [], scope); }
        catch (error) {
          const catchScope = Object.create(scope || null);
          if (node.catchParam) catchScope[node.catchParam] = error;
          return evalBlock(node.catchBody || [], catchScope);
        }
        finally { evalBlock(node.finallyBody || [], scope); }
      }
      if (node.op === 'instanceof') {
        const a = interpretNode(node.args[0], scope, depth + 1);
        const b = interpretNode(node.args[1], scope, depth + 1);
        let cls = a && a.__class;
        while (cls) { if (cls === b) return true; cls = cls.superClass; }
        try { return a instanceof b; } catch { return false; }
      }
      if (node.op === 'class') return defineClass(node.descriptor, interpretNode(node.descriptor.superClass, scope, depth + 1), scope);
      if (node.op === 'new') { const klass = interpretNode(node.class, scope, depth + 1); const args = (node.args || []).map(arg => interpretNode(arg, scope, depth + 1)); if (typeof klass === 'function') return new klass(...args); return klass?.__kind === 'compactClass' ? newCompactInstance(klass, args, rootScope) : newInstance(klass, args); }
      if (node.op === 'function') return makeFunction(node, scope);
      if (node.op === 'callMethod') return callMethod(interpretNode(node.object, scope, depth + 1), node.method, ...(node.args || []).map(arg => interpretNode(arg, scope, depth + 1)));
      if (node.op === 'optionalCallMethod') return optionalCallMethod(interpretNode(node.object, scope, depth + 1), node.method, ...(node.args || []).map(arg => interpretNode(arg, scope, depth + 1)));
      if (node.op === 'getProp') return getProp(interpretNode(node.object, scope, depth + 1), interpretNode(node.prop, scope, depth + 1));
      if (node.op === 'setProp') return setProp(interpretNode(node.object, scope, depth + 1), interpretNode(node.prop, scope, depth + 1), interpretNode(node.value, scope, depth + 1));
      if (node.op === 'callFunction') return callFunction(interpretNode(node.fn, scope, depth + 1), ...(node.args || []).map(arg => interpretNode(arg, scope, depth + 1)));
      if (node.op === 'optionalCallFunction') { const fn = interpretNode(node.fn, scope, depth + 1); return fn == null ? undefined : callFunction(fn, ...(node.args || []).map(arg => interpretNode(arg, scope, depth + 1))); }
      if (node.op === 'optionalCallFunction') { const fn = interpretNode(node.fn, scope, depth + 1); return fn == null ? undefined : callFunction(fn, ...(node.args || []).map(arg => interpretNode(arg, scope, depth + 1))); }
      if (node.op === 'conditional') return interpretNode(node.test, scope, depth + 1) ? interpretNode(node.consequent, scope, depth + 1) : interpretNode(node.alternate, scope, depth + 1);
      if (node.op === 'optionalGetProp') { const object = interpretNode(node.object, scope, depth + 1); return object == null ? undefined : getProp(object, interpretNode(node.prop, scope, depth + 1)); }
      if (node.op === 'if') return evalBlock(interpretNode(node.test, scope, depth + 1) ? (node.consequent || []) : (node.alternate || []), scope);
      if (node.op === 'forOf') {
        const values = interpretNode(node.right, scope, depth + 1) || [];
        // B"H 2026-10-09: per-iteration let/const — each iteration gets a fresh
        // child scope, so closures capture that iteration's value. var keeps
        // the classic single shared binding. One small object per iteration;
        // skipped entirely for var/untyped loops (zero-cost fast path).
        const scoped = node.kind === 'let' || node.kind === 'const';
        for (const value of values) {
          let r;
          if (!scoped) { scope[node.left] = value; r = evalBlock(node.body || [], scope); }
          else {
            const iter = Object.create(scope);
            iter[node.left] = value;
            r = evalBlock(node.body || [], iter);
            scope[node.left] = iter[node.left];
          }
          if (isReturn(r)) return r;
        }
        return undefined;
      }
      if (node.op === 'while') {
        const lets = node.letNames;
        let guard = MAX_LOOP;
        const update = node.update;
        // B"H 2026-10-09: fast path — no let bindings, no per-iteration alloc.
        if (!lets || lets.length === 0) {
          while (interpretNode(node.test, scope, depth + 1) && guard-- > 0) {
            const r = evalBlock(node.body || [], scope);
            if (isReturn(r)) return r;
            if (update) interpretNode(update, scope, depth + 1);
          }
          return undefined;
        }
        while (interpretNode(node.test, scope, depth + 1) && guard-- > 0) {
          const iter = Object.create(scope);
          for (let i = 0; i < lets.length; i++) iter[lets[i]] = scope[lets[i]];
          const r = evalBlock(node.body || [], iter);
          if (isReturn(r)) return r;
          const next = Object.create(scope);
          for (let i = 0; i < lets.length; i++) next[lets[i]] = iter[lets[i]];
          if (update) interpretNode(update, next, depth + 1);
          for (let i = 0; i < lets.length; i++) scope[lets[i]] = next[lets[i]];
        }
        return undefined;
      }
      if (node.op === 'switch') { const value = interpretNode(node.discriminant, scope, depth + 1); const cases = node.cases || []; const start = Math.max(0, cases.findIndex(item => item.test == null || interpretNode(item.test, scope, depth + 1) === value)); for (const item of cases.slice(start)) evalBlock(item.body || [], scope); return undefined; }
      if (node.op === 'superConstructor') {
        const superClass = scope.__class?.superClass || scope.super?.__class || null;
        const args = (node.args || []).map(arg => interpretNode(arg, scope, depth + 1));
        if (!superClass || !scope.this) return scope.super || null;
        const parent = newInstance(superClass, args);
        for (const [key, value] of Object.entries(parent || {})) {
          if (!['__kind', '__class', '__selfClass', 'fields'].includes(key)) scope.this[key] = value;
        }
        if (parent?.fields) Object.assign(scope.this.fields || (scope.this.fields = {}), parent.fields);
        return scope.this;
      }
      if (node.op === 'block') return evalBlock(node.body || [], Object.create(scope || null));
      return node;
    } finally {
      trace.pop();
    }
  };

  // B"H stream 7: the interpreted call path, extracted so the native tier can
  // fall back to it on bailout with the original args (correct state).
  const callInterpreted = (vessel, args = [], thisArg = undefined) => {
    const scope = Object.create(vessel.closure || null);
    // B"H 2026-10-09: arrows capture lexical `this` — ignore call-site thisArg.
    scope.this = vessel.arrow ? vessel.closure?.this : thisArg;
    scope.arguments = args;
    let argIndex = 0;
    vessel.params.forEach(param => { if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex); else if (param && typeof param === 'object' && param.name) { const value = args[argIndex++]; scope[param.name] = value === undefined ? interpretNode(param.default, scope) : value; } else scope[param] = args[argIndex++]; });
    const value = evalBlock(vessel.body, scope);
    return isReturn(value) ? value.value : value;
  };
  const makeFunction = (descriptor, closureScope = {}) => ({
    __kind: 'function', name: descriptor.name || '', params: descriptor.params || [], body: descriptor.body || [], closure: closureScope, arrow: !!descriptor.arrow,
    // B"H 2026-10-09: functions get a prototype object for `new` constructor pattern.
    prototype: {},
    call(args = [], thisArg = undefined) {
      // B"H stream 7 (native tier): hot functions run as real x86_64.
      // nativeTierEnter returns TIER_MISS when the interpreter should run.
      const tiered = nativeTierEnter(this, args, thisArg);
      if (tiered !== TIER_MISS) return tiered;
      return callInterpreted(this, args, thisArg);
    }
  });
  const callFunction = (fn, ...args) => {
    if (fn && fn.__kind === 'function') return fn.call(args);
    if (typeof fn === 'function') return fn(...args);
    if (fn && typeof fn.call === 'function') return fn.call(args);
    throw new TypeError(String(fn) + ' is not a function');
  };
  // B"H: Compile a simple sort comparator to native. Recognizes
  //   function(x,y){ return <binop>(x|y, x|y|const); }
  // where <binop> is sub/add/mul/div/mod. Returns a native (a,b)=>... or null.
  // Pure (no side effects, no this/closure use) so the substitution is exact.
  const tryCompileSortComparator = (fn) => {
    if (!fn || fn.__kind !== 'function') return null;
    const params = fn.params;
    if (!Array.isArray(params) || params.length !== 2) return null;
    if (typeof params[0] !== 'string' || typeof params[1] !== 'string') return null;
    const body = fn.body;
    if (!Array.isArray(body) || body.length !== 1) return null;
    const ret = body[0];
    if (!ret || ret.op !== 'return' || !ret.value || typeof ret.value !== 'object') return null;
    const expr = ret.value;
    // Binary op with both operands being params or constants
    const binOps = { sub: (a,b) => a-b, add: (a,b) => a+b, mul: (a,b) => a*b, div: (a,b) => a/b, mod: (a,b) => a%b };
    const opFn = binOps[expr.op];
    if (!opFn || !Array.isArray(expr.args) || expr.args.length !== 2) return null;
    const resolveIdx = (node) => {
      if (!node || typeof node !== 'object') return -1;
      // {get: 'x'} -> param index; {const: N} -> constant marker
      if (typeof node.get === 'string') {
        if (node.get === params[0]) return 0;
        if (node.get === params[1]) return 1;
        return -1; // closure variable — not pure, bail
      }
      if (Object.prototype.hasOwnProperty.call(node, 'const')) return 2;
      return -1;
    };
    const i0 = resolveIdx(expr.args[0]), i1 = resolveIdx(expr.args[1]);
    if (i0 < 0 || i1 < 0) return null;
    const c0 = i0 === 2 ? expr.args[0].const : null;
    const c1 = i1 === 2 ? expr.args[1].const : null;
    // Build (a,b) => op(select(a,b,c))
    return (a, b) => {
      const v0 = i0 === 0 ? a : (i0 === 1 ? b : c0);
      const v1 = i1 === 0 ? a : (i1 === 1 ? b : c0);
      return opFn(v0, v1);
    };
  };
  // ===========================================================================
  // B"H — Native tier v2, stream 7: tiering integration (compile-or-bail).
  //
  // Hot VM functions are compiled to real x86_64 machine code
  // (geelooy/scripts/awtsmoos/compiling/js/asm.js) and executed as a child
  // process; the tree-walking interpreter remains the semantics oracle.
  //
  //   Vessels count calls; past __merkavaNativeHotThreshold (default 10) an
  //   async compilation is kicked off once per vessel. Later calls run the
  //   native binary; the per-vessel cache means a hot function is never
  //   recompiled.
  //
  // COMPILABILITY (analyzeFunction) — a vessel compiles iff:
  //   R1  it is a __kind:'function' vessel with an array body;
  //   R2  every param is a simple identifier (<= 6 params: the native ABI);
  //   R3  every statement is declare/set/return/if/while, or a bare accepted
  //       expression (callFunction/postUpdate as a step);
  //   R4  every expression is a safe-integer const, a local/param read,
  //       integer arithmetic (+ - * / % & | ^ << >> >>>), unary (- + ~ !),
  //       a comparison, && / || / ?:, a direct call, or i++/i--;
  //   R5  every variable read or written is a param or a declared local —
  //       NO free variables, NO globals, NO closures over mutable state;
  //   R6  no `this` / `arguments` / `super` reads (arrows allowed when clean);
  //   R7  calls go to the function itself (direct recursion, verified against
  //       the live closure binding) or to a closure-resolved function vessel
  //       that is itself compilable (transitively, one binary); any other
  //       call shape or target is compiled to a bailout trap, not a rejection;
  //   R8  no nested functions/classes, try/catch, throw, new, property
  //       access, object/array literals, spread, eval, typeof, delete;
  //   R9  while loops may carry letNames (no closure can observe the
  //       per-iteration copy — R8 rejects function definitions);
  //   R10 consts and i++ deltas are safe integers (|v| <= 2^53-1).
  //
  // BAILOUT (child exits 42) — checked arithmetic traps on int64-unsafe
  // results, division by zero, inexact division, and calls to uncompiled
  // functions; a native call-depth guard (1000) stops machine-stack
  // overflow. The host re-runs the whole call in the interpreter with the
  // ORIGINAL arguments.
  //
  // CORRECTNESS INVARIANT: every accepted operation is free of externally
  // observable side effects (locals/params only; calls only to compiled-pure
  // callees), so re-execution from the original arguments is observationally
  // identical to continuing past the trap. A wrong result is a P0; when in
  // doubt the analysis rejects and the interpreter runs.
  //
  // VALUE MARSHALLING — the v1 boundary speaks safe integers: arguments are
  // argv decimals (Number.isSafeInteger, else the call stays interpreted) and
  // the result is parsed back from stdout. This is the int64 instantiation of
  // the tagged-value boundary in OBJECT_MODEL.md §16; marshalTierArgs /
  // unmarshalTierResult switch on a `kind` so v2 codegen can add tagged
  // kinds later without changing the call path.
  //
  // CACHE — WeakMap<vessel, record> {state: compiling|ready|rejected, path,
  // bindings}. Compilations kick off async (never block a call); in-flight
  // and rejected vessels run interpreted. Live closure bindings for
  // self/callees are revalidated on every native call; a rebinding retires
  // the entry to the interpreter (never a stale call).
  //
  // KILL SWITCH — MERKAVA_NO_NATIVE=1 (env) or rootScope.__merkavaNoNative
  // disables the tier entirely. __merkavaNativeHotThreshold and
  // __merkavaNativeTimeoutMs tune it. Stats + an idle() test hook are exposed
  // as a non-enumerable __nativeTier on the host object.
  // ===========================================================================
  // Must match MERKAVA_BAILOUT_EXIT in compiling/js/asm.js (kept as a literal:
  // the catch path is synchronous and cannot import the ESM module).
  const TIER_BAILOUT_EXIT = 42;
  const TIER_MISS = Symbol('merkavaTierMiss');
  const TIER_FAIL = Symbol('merkavaTierFail');
  const nativeTierEnabled = process.env.MERKAVA_NO_NATIVE !== '1' && !rootScope.__merkavaNoNative;
  const nativeHotThreshold = Math.max(1, Number(rootScope.__merkavaNativeHotThreshold) || 10);
  const nativeCallTimeoutMs = Number(rootScope.__merkavaNativeTimeoutMs) || 30000;
  const tierCache = new WeakMap();      // vessel -> record
  const tierCallCounts = new WeakMap(); // vessel -> number
  let tierInflight = 0;
  let tierCacheEntries = 0;
  const tierStats = { compiled: 0, rejected: 0, nativeCalls: 0, bailouts: 0, marshalFallback: 0, compileMsTotal: 0 };

  const TIER_BINOPS = new Set(['add', 'sub', 'mul', 'div', 'mod', 'band', 'bor', 'bxor', 'shl', 'shr', 'ushr']);
  const TIER_CMPOPS = new Set(['eq', 'seq', 'neq', 'sneq', 'lt', 'lte', 'gt', 'gte']);
  const TIER_UNOPS = new Set(['neg', 'pos', 'bitnot', 'not']);
  const TIER_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const tierBad = (reason) => { throw { [TIER_FAIL]: true, reason }; };

  // Analyze one vessel. Returns a record or null (rejected). Pure: reads the
  // vessel and its closure chain, mutates nothing.
  const analyzeSingleVessel = (v, jsName) => {
    if (!v || v.__kind !== 'function') return null;
    const vparams = v.params || [];
    if (vparams.length > 6) return null;
    for (const p of vparams) {
      if (typeof p !== 'string' || !TIER_IDENT.test(p) || p.startsWith('__tier')) return null;
    }
    const vbody = v.body;
    if (!Array.isArray(vbody)) return null;
    const vselfName = (typeof v.name === 'string' && TIER_IDENT.test(v.name)) ? v.name : null;
    // Pass 1: function-scoped declared names (mirrors the codegen pre-pass).
    const declared = new Set(vparams);
    const collectDeclares = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.op === 'declare' && typeof node.name === 'string') declared.add(node.name);
      if (node.op === 'function') return; // rejected in pass 2; don't descend
      for (const k of Object.keys(node)) {
        const c = node[k];
        if (Array.isArray(c)) { for (const x of c) collectDeclares(x); }
        else if (c && typeof c === 'object') collectDeclares(c);
      }
    };
    for (const s of vbody) collectDeclares(s);

    const callSites = []; // {fnName, kind:'self'|'resolved'|'trap', vessel?, scope?}
    const resolveInClosure = (name) => {
      let cursor = v.closure;
      while (cursor && cursor !== Object.prototype) {
        if (Object.prototype.hasOwnProperty.call(cursor, name)) return { scope: cursor, value: cursor[name] };
        cursor = Object.getPrototypeOf(cursor);
      }
      return null;
    };
    const checkCallTarget = (fnNode) => {
      if (!fnNode || typeof fnNode !== 'object' || typeof fnNode.get !== 'string') tierBad('indirect-call');
      const name = fnNode.get;
      if (vselfName && name === vselfName) {
        const found = resolveInClosure(name);
        if (found && found.value === v) callSites.push({ fnName: name, kind: 'self', vessel: v, scope: found.scope });
        else callSites.push({ fnName: name, kind: 'trap' }); // shadowed: conservative
        return;
      }
      const found = resolveInClosure(name);
      if (found && found.value && found.value.__kind === 'function') {
        callSites.push({ fnName: name, kind: 'resolved', vessel: found.value, scope: found.scope });
      } else {
        callSites.push({ fnName: name, kind: 'trap' });
      }
    };
    const checkExpr = (node) => {
      if (node == null) tierBad('null-expr');
      if (typeof node !== 'object') tierBad('primitive-expr');
      if (Object.prototype.hasOwnProperty.call(node, 'const')) {
        if (!Number.isSafeInteger(node.const)) tierBad('non-safe-int-const');
        return;
      }
      if (typeof node.get === 'string') {
        const name = node.get;
        if (name === 'this' || name === 'arguments' || name === 'super') tierBad('this-like-read');
        if (!declared.has(name)) tierBad('free-variable:' + name);
        return;
      }
      const op = node.op;
      if (typeof op !== 'string') tierBad('op-less-node');
      if (TIER_BINOPS.has(op) || TIER_CMPOPS.has(op) || op === 'and' || op === 'or') {
        const args = node.args;
        if (!Array.isArray(args) || args.length !== 2) tierBad('bad-args:' + op);
        checkExpr(args[0]); checkExpr(args[1]);
        return;
      }
      if (TIER_UNOPS.has(op)) {
        if (!node.value || typeof node.value !== 'object') tierBad('unary-no-value:' + op);
        checkExpr(node.value);
        return;
      }
      if (op === 'conditional') {
        checkExpr(node.test); checkExpr(node.consequent); checkExpr(node.alternate);
        return;
      }
      if (op === 'callFunction') {
        checkCallTarget(node.fn);
        const args = node.args || [];
        if (args.length > 6) tierBad('too-many-args');
        for (const a of args) checkExpr(a);
        return;
      }
      if (op === 'postUpdate') {
        if (typeof node.name !== 'string' || !declared.has(node.name)) tierBad('postupdate-nonlocal');
        const d = node.delta;
        if (!d || typeof d !== 'object' || !Object.prototype.hasOwnProperty.call(d, 'const') ||
            !Number.isSafeInteger(d.const) || d.const === 0) tierBad('postupdate-bad-delta');
        return;
      }
      tierBad('unsupported-expr-op:' + op);
    };
    const checkStmt = (node) => {
      if (!node || typeof node !== 'object') tierBad('bad-stmt');
      const op = node.op;
      if (op === 'declare') {
        if (typeof node.name !== 'string' || !TIER_IDENT.test(node.name)) tierBad('bad-declare-name');
        if (!node.value || typeof node.value !== 'object') tierBad('declare-no-value');
        checkExpr(node.value);
        return;
      }
      if (op === 'set') {
        if (typeof node.name !== 'string' || !declared.has(node.name)) tierBad('set-nonlocal:' + String(node.name));
        if (!node.value || typeof node.value !== 'object') tierBad('set-no-value');
        checkExpr(node.value);
        return;
      }
      if (op === 'return') {
        if (node.value != null) {
          if (typeof node.value !== 'object') tierBad('return-primitive');
          checkExpr(node.value);
        }
        return;
      }
      if (op === 'if') {
        checkExpr(node.test);
        for (const s of node.consequent || []) checkStmt(s);
        for (const s of node.alternate || []) checkStmt(s);
        return;
      }
      if (op === 'while') {
        checkExpr(node.test);
        for (const s of node.body || []) checkStmt(s);
        if (node.update != null) {
          if (typeof node.update !== 'object') tierBad('while-update-primitive');
          checkExpr(node.update);
        }
        return;
      }
      // Bare expression steps (the lowerer emits callFunction/postUpdate as steps).
      if (op === 'callFunction' || op === 'postUpdate') { checkExpr(node); return; }
      tierBad('unsupported-stmt-op:' + String(op));
    };
    try {
      for (const s of vbody) checkStmt(s);
    } catch (e) {
      if (e && e[TIER_FAIL]) { analyzeSingleVessel.lastReason = e.reason; return null; }
      throw e;
    }
    return { vessel: v, jsName, params: vparams, body: vbody, declared, callSites, selfName: vselfName, nativeName: null, renames: null };
  };

  // Analyze the transitive compilation unit (vessel + callees). Returns
  // {ok, functions:[rec...], bindings:[...]} or {ok:false, reason}.
  const analyzeFunction = (vessel) => {
    const seen = new Map(); // vessel -> rec|null
    const queue = [{ vessel, jsName: (typeof vessel.name === 'string' && TIER_IDENT.test(vessel.name)) ? vessel.name : null }];
    const recs = [];
    let firstReason = 'rejected';
    while (queue.length) {
      const { vessel: v, jsName } = queue.shift();
      if (seen.has(v)) continue;
      const rec = analyzeSingleVessel(v, jsName);
      seen.set(v, rec);
      if (!rec) { if (v === vessel) return { ok: false, reason: firstReason }; continue; }
      recs.push(rec);
      for (const cs of rec.callSites) {
        if (cs.kind === 'resolved' && !seen.has(cs.vessel) && !queue.some(q => q.vessel === cs.vessel)) {
          queue.push({ vessel: cs.vessel, jsName: cs.fnName });
        }
      }
    }
    const top = seen.get(vessel);
    if (!top) return { ok: false, reason: firstReason };
    recs.forEach((rec, i) => { rec.nativeName = `__tier${i}`; });
    const bindings = [];
    const seenBinding = new Set();
    for (const rec of recs) {
      rec.renames = new Map();
      for (const cs of rec.callSites) {
        if (cs.kind === 'self') {
          rec.renames.set(cs.fnName, rec.nativeName);
        } else if (cs.kind === 'resolved') {
          const target = seen.get(cs.vessel);
          if (target) rec.renames.set(cs.fnName, target.nativeName);
          // else: no rename entry -> the printer emits a bailout trap.
        }
        if ((cs.kind === 'self' || cs.kind === 'resolved') && cs.scope && !seenBinding.has(cs.vessel)) {
          seenBinding.add(cs.vessel);
          bindings.push({ scope: cs.scope, name: cs.fnName, vessel: cs.vessel });
        }
      }
    }
    return { ok: true, functions: recs, bindings };
  };

  // --- IR -> JS source printer (only for analysis-accepted nodes) ---
  const TIER_JS_BINOP = { add: '+', sub: '-', mul: '*', div: '/', mod: '%', band: '&', bor: '|', bxor: '^', shl: '<<', shr: '>>', ushr: '>>>' };
  const TIER_JS_CMP = { eq: '==', seq: '===', neq: '!=', sneq: '!==', lt: '<', lte: '<=', gt: '>', gte: '>=' };
  const TIER_JS_UNOP = { neg: '-', pos: '+', bitnot: '~', not: '!' };
  const tierPrintExpr = (rec, node) => {
    if (Object.prototype.hasOwnProperty.call(node, 'const')) {
      const v = node.const;
      return v < 0 ? `(0 - ${-v})` : `${v}`; // safe int; negatives via (0 - n)
    }
    if (typeof node.get === 'string') return node.get; // validated local/param
    const op = node.op;
    if (TIER_JS_BINOP[op]) return `(${tierPrintExpr(rec, node.args[0])} ${TIER_JS_BINOP[op]} ${tierPrintExpr(rec, node.args[1])})`;
    if (TIER_JS_CMP[op]) return `(${tierPrintExpr(rec, node.args[0])} ${TIER_JS_CMP[op]} ${tierPrintExpr(rec, node.args[1])})`;
    if (op === 'and' || op === 'or') return `(${tierPrintExpr(rec, node.args[0])} ${op === 'and' ? '&&' : '||'} ${tierPrintExpr(rec, node.args[1])})`;
    if (TIER_JS_UNOP[op]) {
      const v = tierPrintExpr(rec, node.value);
      return op === 'not' ? `(!${v})` : `(${TIER_JS_UNOP[op]}${v})`;
    }
    if (op === 'conditional') return `(${tierPrintExpr(rec, node.test)} ? ${tierPrintExpr(rec, node.consequent)} : ${tierPrintExpr(rec, node.alternate)})`;
    if (op === 'callFunction') {
      const name = node.fn.get;
      const target = rec.renames.get(name);
      const args = (node.args || []).map(a => tierPrintExpr(rec, a)).join(', ');
      // Unresolvable callee -> bailout trap (evaluates args first, then exits 42).
      if (!target) return `__merkava_trap(${args})`;
      return `${target}(${args})`;
    }
    if (op === 'postUpdate') {
      const d = node.delta.const;
      if (d === 1) return `(${node.name}++)`;
      if (d === -1) return `(${node.name}--)`;
      return `(${node.name} += ${d})`;
    }
    throw new Error('tierPrint: unexpected op ' + op);
  };
  const tierPrintStmt = (rec, node, pad) => {
    const op = node.op;
    if (op === 'declare') return `${pad}var ${node.name} = ${tierPrintExpr(rec, node.value)};`;
    if (op === 'set') return `${pad}${node.name} = ${tierPrintExpr(rec, node.value)};`;
    if (op === 'return') return node.value == null ? `${pad}return;` : `${pad}return ${tierPrintExpr(rec, node.value)};`;
    if (op === 'if') {
      const cons = (node.consequent || []).map(s => tierPrintStmt(rec, s, pad + '  ')).join('\n');
      const alt = (node.alternate || []).map(s => tierPrintStmt(rec, s, pad + '  ')).join('\n');
      let out = `${pad}if (${tierPrintExpr(rec, node.test)}) {\n${cons}\n${pad}}`;
      if ((node.alternate || []).length) out += ` else {\n${alt}\n${pad}}`;
      return out;
    }
    if (op === 'while') {
      const b = (node.body || []).map(s => tierPrintStmt(rec, s, pad + '  ')).join('\n');
      const u = node.update != null ? `\n${pad}  ${tierPrintExpr(rec, node.update)};` : '';
      return `${pad}while (${tierPrintExpr(rec, node.test)}) {\n${b}${u}\n${pad}}`;
    }
    return `${pad}${tierPrintExpr(rec, node)};`; // bare expression step
  };
  const printTierSource = (analysis) => analysis.functions.map(rec => {
    const params = rec.params.join(', ');
    const body = rec.body.map(s => tierPrintStmt(rec, s, '  ')).join('\n');
    return `function ${rec.nativeName}(${params}) {\n${body}\n}`;
  }).join('\n\n');

  // --- value marshalling (v1: safe integers; structured by kind for v2) ---
  const marshalTierArgs = (params, args) => {
    const argv = new Array(params.length);
    for (let i = 0; i < params.length; i++) {
      const a = i < args.length ? args[i] : undefined;
      // kind: 'int' — the only v1 kind. Tagged kinds (fixnum immediate bits,
      // heap strings, ...) plug in here when v2 codegen lands.
      if (!Number.isSafeInteger(a)) return { kind: 'unsupported' };
      argv[i] = { kind: 'int', text: String(a) };
    }
    return { kind: 'ok', argv: argv.map(x => x.text) };
  };
  const unmarshalTierResult = (stdout) => {
    const text = String(stdout).trim();
    if (!/^-?\d+$/.test(text)) throw new Error('merkavaTier: native binary printed non-integer result: ' + text.slice(0, 80));
    const v = Number(text);
    if (!Number.isSafeInteger(v)) throw new Error('merkavaTier: native result outside safe range');
    return v;
  };

  // --- v2 boundary protocol: mutation-safe marshal (option (c)) ---
  // Contract decision (parent, 2026-10-09): encodeValue keeps a per-heap
  // identity table, so re-encoding a MUTATED object returns its ORIGINAL
  // (stale) handle. The tier boundary closes this with option (c): every
  // top-level crossing re-marshals fresh, bypassing the table.
  //
  // Protocol:
  //   1. interp->native: tierEncodeCrossing(heap, argsArray) =
  //      encodeValue(heap, tierFreshCopy(argsArray)) — ONE top-level call.
  //      The deep copy is a fresh JS reference, so the identity table can
  //      never return a stale handle; the CURRENT interpreter-side state
  //      (including mutations since the last crossing) is what gets encoded.
  //   2. native->interp: tierDecodeCrossing(heap, handle) =
  //      decodeValue(heap, handle) — ONE top-level call (fresh memo per call
  //      by construction); yields fresh mutable JS objects.
  // Identity: preserved WITHIN one crossing (the copy keeps shared refs and
  // cycles; the per-call memo keeps them in the handle graph; decode's fresh
  // memo keeps them on the way back) — so `a === a` survives a marshal
  // boundary. Across crossings, values are snapshots: a mutated object
  // re-crosses as its CURRENT state, never as a stale handle. (Two handles
  // for the same unmutated reference across two crossings compare by content,
  // not by identity — the documented cost of closing the stale-handle hole.)
  // v1 (integers) is unaffected: integers are immutable, so the hazard is
  // vacuous there; this protocol activates with v2 tagged kinds.
  const tierFreshCopy = (js) => {
    const memo = new Map();
    const copy = (v) => {
      if (v === null || typeof v !== 'object') return v; // primitives: immutable
      const hit = memo.get(v);
      if (hit !== undefined) return hit;
      let out;
      if (Array.isArray(v)) {
        out = new Array(v.length);
        memo.set(v, out); // two-phase: memoize before filling (cycles)
        for (let i = 0; i < v.length; i++) if (i in v) out[i] = copy(v[i]);
      } else if (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null) {
        out = {};
        memo.set(v, out); // two-phase: memoize before filling (cycles)
        for (const k of Object.keys(v)) out[k] = copy(v[k]);
      } else {
        // Bailout conservatism: exotic objects (Date, class instances, ...)
        // have no faithful heap encoding — refuse rather than corrupt.
        throw new Error('merkavaTier: cannot marshal ' + ((v.constructor && v.constructor.name) || typeof v) + ' across the native boundary');
      }
      return out;
    };
    return copy(js);
  };
  // One top-level encode per crossing. The fresh copy defeats the identity
  // table (fresh reference -> table miss -> fresh two-phase encode), so
  // interpreter-side mutations are always visible natively.
  const tierEncodeCrossing = async (heap, js) => {
    const vm = await import('../../compiling/js/value-model.js');
    return vm.encodeValue(heap, tierFreshCopy(js));
  };
  const tierDecodeCrossing = async (heap, handle) => {
    const vm = await import('../../compiling/js/value-model.js');
    return vm.decodeValue(heap, handle);
  };

  const verifyTierBindings = (rec) => {
    const bindings = rec.bindings;
    if (!bindings) return true;
    for (const b of bindings) {
      if (!b.scope || b.scope[b.name] !== b.vessel) return false;
    }
    return true;
  };

  // Compile a vessel (async; never blocks a call). Updates rec in place.
  const compileVesselNative = async (vessel, rec) => {
    tierInflight++;
    try {
      const analysis = analyzeFunction(vessel);
      if (!analysis.ok) {
        rec.state = 'rejected'; rec.reason = analysis.reason;
        tierStats.rejected++;
        return;
      }
      const asmMod = await import('../../compiling/js/asm.js');
      // The bailout trap is itself a codegen extension — it dogfoods the
      // stream-7 hook: __merkava_trap(...) evaluates its args, then jumps to
      // the bailout trampoline (exit 42). Re-registration is idempotent.
      asmMod.registerCodegenExtension('merkava-tier-trap', {
        call(gen, node) {
          if (node.callee && node.callee.type === 'Identifier' && node.callee.name === '__merkava_trap') {
            for (const a of node.arguments || []) gen.exprVoid(a);
            gen.emit(`JMP $jsa_bailout_trap`);
            return true;
          }
          return false;
        }
      });
      const source = printTierSource(analysis);
      const t0 = Date.now();
      const built = await asmMod.compileJsToNativeAsm(
        source,
        { name: analysis.functions[0].nativeName, args: 'argv' },
        { checkedArithmetic: true, nativeDepthGuard: true, nargs: (vessel.params || []).length }
      );
      rec.state = 'ready';
      rec.path = built.path;
      rec.bindings = analysis.bindings;
      rec.compileMs = Date.now() - t0;
      tierStats.compiled++;
      tierStats.compileMsTotal += rec.compileMs;
    } catch (e) {
      rec.state = 'rejected';
      rec.reason = 'compile-error: ' + (e && e.message);
      tierStats.rejected++;
    } finally {
      tierInflight--;
    }
  };

  // The per-call tier entry. Returns TIER_MISS when the interpreter should
  // run; otherwise the call's result (bailouts re-run interpreted inside).
  const nativeTierEnter = (vessel, args, thisArg) => {
    if (!nativeTierEnabled) return TIER_MISS;
    let rec = tierCache.get(vessel);
    if (rec === undefined) {
      const n = (tierCallCounts.get(vessel) || 0) + 1;
      tierCallCounts.set(vessel, n);
      if (n < nativeHotThreshold) return TIER_MISS;
      rec = { state: 'compiling' };
      tierCache.set(vessel, rec);
      tierCacheEntries++;
      void compileVesselNative(vessel, rec);
      return TIER_MISS;
    }
    if (rec.state !== 'ready') return TIER_MISS; // compiling or rejected
    if (!verifyTierBindings(rec)) {
      // A callee (or self) was rebound after compilation: retire the entry.
      // The interpreter sees the new binding; the binary never runs stale.
      rec.state = 'rejected'; rec.reason = 'bindings-changed';
      return TIER_MISS;
    }
    const marshalled = marshalTierArgs(vessel.params || [], args);
    if (marshalled.kind !== 'ok') { tierStats.marshalFallback++; return TIER_MISS; }
    try {
      const out = execFileSync(rec.path, marshalled.argv, { encoding: 'utf8', timeout: nativeCallTimeoutMs });
      tierStats.nativeCalls++;
      return unmarshalTierResult(out);
    } catch (e) {
      if (e && e.status === TIER_BAILOUT_EXIT) {
        // Mid-function bailout: re-run the whole call interpreted with the
        // original args. Correct by the side-effect-freedom invariant.
        tierStats.bailouts++;
        return callInterpreted(vessel, args, thisArg);
      }
      throw e; // real crash (segfault, timeout): loud, never silent
    }
  };

  // Test/debug handle (non-enumerable on the host object, set below).
  const nativeTierDebug = {
    stats: tierStats,
    cacheEntries: () => tierCacheEntries,
    inflight: () => tierInflight,
    // v2 boundary protocol (option (c)): fresh-copy marshal per crossing.
    marshal: { copy: tierFreshCopy, encode: tierEncodeCrossing, decode: tierDecodeCrossing },
    async idle() {
      for (;;) {
        if (tierInflight <= 0) return;
        await new Promise(r => setTimeout(r, 25));
      }
    },
  };
  const callMethod = (receiver, method, ...args) => {
    if (receiver == null) throw new TypeError(String(receiver) + ' has no method ' + String(method));
    // B"H: JSON.parse/stringify hot path — direct native call. Wraps only
    // function-kind args (reviver/replacer); no args.map array + closure alloc.
    if (receiver === JSON && (method === 'parse' || method === 'stringify')) {
      const w = (a) => a && a.__kind === 'function' ? (...inner) => callFunction(a, ...inner) : a;
      return method === 'parse' ? JSON.parse(w(args[0]), w(args[1])) : JSON.stringify(w(args[0]), w(args[1]), args[2]);
    }
    // B"H 2026-10-09: Function.prototype.apply/call/bind for VM functions.
    if (receiver && receiver.__kind === 'function') {
      if (method === 'apply') return receiver.call(args[1] != null ? Array.from(args[1]) : [], args[0]);
      if (method === 'call') return receiver.call(args.slice(1), args[0]);
      if (method === 'bind') {
        const target = receiver, boundThis = args[0], boundArgs = args.slice(1);
        return (...callArgs) => target.call([...boundArgs, ...callArgs], boundThis);
      }
    }
    if (receiver && receiver.__kind === 'iterator' && method === 'next') return receiver.next();
    if (receiver && receiver.__kind === 'compactInstance') return callCompactMethod(receiver, method, args, rootScope);
    if (receiver && receiver[method]?.__kind === 'function') return receiver[method].call(args, receiver);
    // B"H: sort comparator fast path. A comparator like function(x,y){return x-y;}
    // would otherwise cost ~300k VM calls (interpretNode each) for 20k elements.
    // We recognize single-return binary-op-on-params shapes and compile to a
    // native function once — semantically identical, no VM calls per comparison.
    if (method === 'sort' && args.length === 1) {
      const fastCmp = tryCompileSortComparator(args[0]);
      if (fastCmp) return receiver.sort(fastCmp);
    }
    if (receiver && typeof receiver[method] === 'function' && receiver.__kind !== 'instance') {
      const bridged = args.map(arg => arg && arg.__kind === 'function' ? (...inner) => callFunction(arg, ...inner) : arg);
      return receiver[method](...bridged);
    }
    const klass = receiver?.__selfClass || receiver?.__class;
    const found = findMethod(klass, method);
    if (!found) { const protoFn = klass?.prototype?.[method]; if (protoFn?.call) return protoFn.call(args, receiver); throw new TypeError(String(method) + ' is not a function'); }
    // B"H 2026-10-09: monkey-patched prototype method — call the VM function directly.
    if (found.__patchedFn) return found.__patchedFn.call(args, receiver);
    const superReceiver = found.owner.superClass ? { __kind: 'instance', __class: found.owner.superClass, __selfClass: found.owner.superClass, fields: receiver.fields || {} } : null;
    const scope = Object.assign(Object.create(found.owner.closure || null), { this: receiver, super: superReceiver, arguments: args, __class: found.owner });
    bindParams(scope, found.params || [], args);
    const value = interpretNode(found.body, scope);
    return isReturn(value) ? value.value : value;
  };
  const optionalCallMethod = (receiver, method, ...args) => {
    if (receiver == null) return undefined;
    const value = getProp(receiver, method);
    if (value == null) return undefined;
    return callMethod(receiver, method, ...args);
  };
  const makeGenerator = values => ({ __kind: 'generatorFactory', call: () => { let index = 0; return { __kind: 'iterator', next: () => index < values.length ? { value: values[index++], done: false } : { value: undefined, done: true } }; } });
  const makeAsyncVessel = result => ({ __kind: 'asyncFunction', call: () => interpretNode(result, {}) });
  const getProp = (obj, prop) => {
    if (obj == null) throw new TypeError('Cannot read properties of ' + String(obj) + " (reading '" + String(prop) + "')");
    if (hasOwn.call(obj, prop)) return obj[prop];
    // B"H 2026-10-09: instance.constructor returns the class.
    if (obj.__kind === 'instance' && prop === 'constructor') return obj.__class;
    if (obj.__kind === 'instance') {
      const found = findMethod(obj.__class, prop);
      if (found) return (...args) => callMethod(obj, prop, ...args);
    }
    const value = obj[prop];
    if (typeof value === 'function' && obj && (obj.ownerDocument || obj.documentElement || obj.body || obj.tagName)) return value.bind(obj);
    return value;
  };
  const setProp = (obj, prop, value) => { if (obj != null) obj[prop] = value; return value; };

  // B"H 2026-10-09: real getters/setters via defineProperty. The VM function
  // is built once per accessor (not per access); the native bridge invokes it
  // with the receiver as `this`. Lean: one closure per accessor, no per-get alloc.
  const defineAccessor = (obj, key, prop, scope) => {
    // B"H 2026-10-09: merge with an existing accessor so get+set pairs unite.
    // (A pre-existing data descriptor is replaced, per defineProperty semantics.)
    const cur = Object.getOwnPropertyDescriptor(obj, key);
    const desc = (cur && (cur.get || cur.set)) ? cur : { enumerable: true, configurable: true };
    if (prop.getter) {
      const g = interpretNode(prop.getter, scope);
      desc.get = function() { return g.call([], this); };
    }
    if (prop.setter) {
      const s = interpretNode(prop.setter, scope);
      desc.set = function(v) { s.call([v], this); };
    }
    Object.defineProperty(obj, key, desc);
  };
  const isAccessorKey = k => k !== null && typeof k === 'object' && !Array.isArray(k) && typeof k.__accessor === 'string';

  const host = {
    20: defineClass, 21: (klass, ...args) => {
      if (typeof klass === 'function') return new klass(...args);
      if (klass?.__kind === 'compactClass') return newCompactInstance(klass, args, rootScope);
      // B"H 2026-10-09: `new` on a plain VM function — constructor pattern.
      // Instance links to fn.prototype; fn runs with this=instance.
      if (klass?.__kind === 'function') {
        const instance = { __kind: 'instance', __class: { methods: [], prototype: klass.prototype || {}, superClass: null }, fields: {} };
        klass.call(args, instance);
        return instance;
      }
      return newInstance(klass, args);
    }, 22: callMethod, 23: getProp, 24: makeGenerator, 25: makeAsyncVessel, 26: callFunction, 27: (...items) => items,
    // B"H 2026-10-09: __accessor-marked keys become real getters/setters.
    28: (...flat) => { const out = {}; for (let i = 0; i < flat.length; i += 2) { const k = flat[i]; if (isAccessorKey(k)) defineAccessor(out, k.__accessor, flat[i + 1], rootScope); else out[k] = flat[i + 1]; } return out; }, 29: (kind, ...items) => new (globalThis[kind] || Uint8Array)(items || []), 30: node => interpretNode(node, Object.create(rootScope)), 31: setProp, 32: node => makeFunction(node, rootScope), 33: (op, a, b) => interpretNode({ op, args: [{ const: a }, { const: b }] }), 34: (op, value) => interpretNode({ op, value: { const: value } }), 35: (test, consequent, alternate) => test ? consequent : alternate, 36: (...flat) => { const out = {}; for (let i = 0; i < flat.length;) { if (flat[i++] === true) { Object.assign(out, flat[i++] || {}); continue; } const k = flat[i++], v = flat[i++]; if (isAccessorKey(k)) defineAccessor(out, k.__accessor, v, rootScope); else out[k] = v; } return out; }, 37: value => value && value.__kind === 'syncPromise' ? value.value : value, 38: (obj, prop) => obj == null ? undefined : getProp(obj, prop), 39: message => new Error(message), 40: node => interpretNode(node, Object.create(rootScope)), 41: node => interpretNode(node, Object.create(rootScope)), 42: node => interpretNode(node, Object.create(rootScope)), 43: node => interpretNode({ op: 'block', body: node.body || [] }, Object.create(rootScope)), 44: (receiver, method, ...args) => optionalCallMethod(receiver, method, ...args), 45: (fn, ...args) => fn == null ? undefined : callFunction(fn, ...args), 46: name => { try { return typeof read(name, rootScope); } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }, 47: (...flat) => spreadFlat(flat), 48: (fn, ...flat) => callFunction(fn, ...spreadFlat(flat)), 49: (receiver, method, ...flat) => callMethod(receiver, method, ...spreadFlat(flat)), 60: classes => installCompactClasses(classes, rootScope)
  };
  // B"H stream 7: native-tier test/debug handle. Non-enumerable so opcode-map
  // consumers that enumerate keys are unaffected.
  Object.defineProperty(host, '__nativeTier', { value: nativeTierDebug, enumerable: false, configurable: true });
  return host;
}
module.exports = { createDefaultHost };

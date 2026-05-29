// B"H
/**
 * @file DefaultMerkavaHost.js
 * @description Chapter 80: the Merkava VM host learns mercy before infinity.
 * Chrome reports one exception; it does not consume the process. This host now
 * guards recursive AST interpretation, reports the op/get path that exceeded
 * fuel, and keeps native hooks separate from Merkava function vessels.
 */
const { installCompactClasses, newCompactInstance, callCompactMethod } = require('./CompactClassRuntime.js');

function createDefaultHost(rootScope = {}) {
  const MAX_DEPTH = Number(rootScope.__merkavaMaxDepth || 900);
  const MAX_STEPS = Number(rootScope.__merkavaMaxSteps || 240000);
  let stepCount = 0;
  const trace = [];
  const RETURN = Symbol('merkavaReturn');
  const isReturn = value => value && value.__signal === RETURN;
  const makeReturn = value => ({ __signal: RETURN, value });
  const defineClass = (desc, superClass = null, closure = {}) => ({ __kind: 'class', prototype: {}, ...desc, superClass, closure: Object.assign(Object.create(null), rootScope, closure || {}) });
  const makeVmError = message => {
    const error = new Error(`${message} | trace=${trace.slice(-18).join(' > ')}`);
    error.code = 'MERKAVA_VM_INTERPRETER_GUARD';
    error.trace = trace.slice(-80);
    return error;
  };

  const findMethod = (klass, name) => {
    if (!klass) return null;
    const method = (klass.methods || []).find(m => m.name === name);
    if (method) return { ...method, owner: klass };
    return findMethod(klass.superClass, name);
  };
  const newInstance = (klass, args = []) => {
    if (!klass) throw new TypeError('undefined is not a constructor');
    if (!klass) throw new TypeError('undefined is not a constructor');
    const instance = { __kind: 'instance', __class: klass, fields: {} };
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
  const read = (name, scope = {}) => {
    const key = typeof name === 'symbol' ? name : String(name);
    if (scope && key in scope) return scope[key];
    if (Object.prototype.hasOwnProperty.call(rootScope, key)) return rootScope[key];
    if (key === 'undefined') return undefined;
    if (key === 'Promise') return nativePromise;
    if (Object.prototype.hasOwnProperty.call(globalThis, key)) return globalThis[key];
    throw new ReferenceError(String(key) + ' is not defined');
  };
  const write = (name, value, scope = {}) => {
    const key = String(name);
    let cursor = scope;
    while (cursor && cursor !== Object.prototype) {
      if (Object.prototype.hasOwnProperty.call(cursor, key)) { cursor[key] = value; return value; }
      cursor = Object.getPrototypeOf(cursor);
    }
    scope[key] = value;
    return value;
  };
  const nodeLabel = node => {
    if (node == null) return 'null';
    if (typeof node !== 'object') return typeof node;
    if (node.op) return `op:${node.op}`;
    if (node.get) return `get:${String(node.get).slice(0, 40)}`;
    if (Object.prototype.hasOwnProperty.call(node, 'const')) return 'const';
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
  const interpretNode = (node, scope = {}, depth = 0) => {
    stepCount += 1;
    if (stepCount > MAX_STEPS) throw makeVmError("Merkava interpreter step budget exceeded at " + nodeLabel(node));
    if (depth > MAX_DEPTH) throw makeVmError(`Merkava interpreter depth exceeded at ${nodeLabel(node)}`);
    trace.push(nodeLabel(node));
    try {
      if (node == null) return null;
      if (typeof node !== 'object') return node;
      if (Object.prototype.hasOwnProperty.call(node, 'const')) return node.const;
      if (node.get) return read(node.get, scope);
      if (node.op === 'set') return write(node.name, interpretNode(node.value, scope, depth + 1), scope);
      if (node.op === 'add') return interpretNode(node.args[0], scope, depth + 1) + interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'sub') return interpretNode(node.args[0], scope, depth + 1) - interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'mul') return interpretNode(node.args[0], scope, depth + 1) * interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'div') return interpretNode(node.args[0], scope, depth + 1) / interpretNode(node.args[1], scope, depth + 1);
      if (node.op === 'mod') return interpretNode(node.args[0], scope, depth + 1) % interpretNode(node.args[1], scope, depth + 1);
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
        try { return typeof interpretNode(node.value, scope, depth + 1); }
        catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; }
      }
      if (node.op === 'void') return void interpretNode(node.value, scope, depth + 1);
      if (node.op === 'typeofName') { try { return typeof read(node.name, scope); } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }
      if (node.op === 'typeofName') { try { return typeof read(node.name, scope); } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }
      if (node.op === 'await') { const value = interpretNode(node.value, scope, depth + 1); return value && value.__kind === 'syncPromise' ? value.value : value; }
      if (node.op === 'array') return (node.items || []).map(item => interpretNode(item, scope, depth + 1));
      if (node.op === 'object') { const out = {}; for (const prop of node.props || []) out[prop.key] = interpretNode(prop.value, scope, depth + 1); return out; }
      if (node.op === 'objectMerge') { const out = {}; for (const part of node.parts || []) { if (part.spread) Object.assign(out, interpretNode(part.spread, scope, depth + 1) || {}); else out[part.key] = interpretNode(part.value, scope, depth + 1); } return out; }
      if (node.op === 'typedArray') { const values = (node.items || []).map(item => interpretNode(item, scope, depth + 1)); const Ctor = globalThis[node.kind] || Uint8Array; return new Ctor(values); }
      if (node.op === 'newError') return new Error(interpretNode(node.message, scope, depth + 1));
      if (node.op === 'throw') throw interpretNode(node.value, scope, depth + 1);
      if (node.op === 'try') { try { evalBlock(node.body || [], scope); } catch (error) { const catchScope = Object.create(scope || null); if (node.catchParam) catchScope[node.catchParam] = error; evalBlock(node.catchBody || [], catchScope); } finally { evalBlock(node.finallyBody || [], scope); } return undefined; }
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
      if (node.op === 'forOf') { const values = interpretNode(node.right, scope, depth + 1) || []; for (const value of values) { scope[node.left] = value; evalBlock(node.body || [], scope); } return undefined; }
      if (node.op === 'while') { let guard = 10000; while (interpretNode(node.test, scope, depth + 1) && guard-- > 0) evalBlock(node.body || [], scope); return undefined; }
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

  const makeFunction = (descriptor, closureScope = {}) => ({
    __kind: 'function', name: descriptor.name || '', params: descriptor.params || [], body: descriptor.body || [], closure: closureScope,
    call(args = [], thisArg = undefined) {
      const scope = Object.create(this.closure || null);
      scope.this = thisArg;
      scope.arguments = args;
      let argIndex = 0;
      this.params.forEach(param => { if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex); else if (param && typeof param === 'object' && param.name) { const value = args[argIndex++]; scope[param.name] = value === undefined ? interpretNode(param.default, scope) : value; } else scope[param] = args[argIndex++]; });
      const value = evalBlock(this.body, scope);
      return isReturn(value) ? value.value : value;
    }
  });
  const callFunction = (fn, ...args) => {
    if (fn && fn.__kind === 'function') return fn.call(args);
    if (typeof fn === 'function') return fn(...args);
    if (fn && typeof fn.call === 'function') return fn.call(args);
    throw new TypeError(String(fn) + ' is not a function');
  };
  const callMethod = (receiver, method, ...args) => {
    if (receiver == null) throw new TypeError(String(receiver) + ' has no method ' + String(method));
    if (receiver && receiver.__kind === 'iterator' && method === 'next') return receiver.next();
    if (receiver && receiver.__kind === 'compactInstance') return callCompactMethod(receiver, method, args, rootScope);
    if (receiver && receiver[method]?.__kind === 'function') return receiver[method].call(args, receiver);
    if (receiver && typeof receiver[method] === 'function' && receiver.__kind !== 'instance') {
      const bridged = args.map(arg => arg && arg.__kind === 'function' ? (...inner) => callFunction(arg, ...inner) : arg);
      return receiver[method](...bridged);
    }
    const klass = receiver?.__selfClass || receiver?.__class;
    const found = findMethod(klass, method);
    if (!found) { const protoFn = klass?.prototype?.[method]; if (protoFn?.call) return protoFn.call(args, receiver); throw new TypeError(String(method) + ' is not a function'); }
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
    if (Object.prototype.hasOwnProperty.call(obj, prop)) return obj[prop];
    if (obj.__kind === 'instance') {
      const found = findMethod(obj.__class, prop);
      if (found) return (...args) => callMethod(obj, prop, ...args);
    }
    const value = obj[prop];
    if (typeof value === 'function' && obj && (obj.ownerDocument || obj.documentElement || obj.body || obj.tagName)) return value.bind(obj);
    return value;
  };
  const setProp = (obj, prop, value) => { if (obj != null) obj[prop] = value; return value; };

  return {
    20: defineClass, 21: (klass, ...args) => typeof klass === 'function' ? new klass(...args) : (klass?.__kind === 'compactClass' ? newCompactInstance(klass, args, rootScope) : newInstance(klass, args)), 22: callMethod, 23: getProp, 24: makeGenerator, 25: makeAsyncVessel, 26: callFunction, 27: (...items) => items, 28: (...flat) => { const out = {}; for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1]; return out; }, 29: (kind, ...items) => new (globalThis[kind] || Uint8Array)(items || []), 30: node => interpretNode(node, Object.create(rootScope)), 31: setProp, 32: node => makeFunction(node, rootScope), 33: (op, a, b) => interpretNode({ op, args: [{ const: a }, { const: b }] }), 34: (op, value) => interpretNode({ op, value: { const: value } }), 35: (test, consequent, alternate) => test ? consequent : alternate, 36: (...flat) => { const out = {}; for (let i = 0; i < flat.length;) { if (flat[i++] === true) Object.assign(out, flat[i++] || {}); else out[flat[i++]] = flat[i++]; } return out; }, 37: value => value && value.__kind === 'syncPromise' ? value.value : value, 38: (obj, prop) => obj == null ? undefined : getProp(obj, prop), 39: message => new Error(message), 40: node => interpretNode(node, Object.create(rootScope)), 41: node => interpretNode(node, Object.create(rootScope)), 42: node => interpretNode(node, Object.create(rootScope)), 43: node => interpretNode({ op: 'block', body: node.body || [] }, Object.create(rootScope)), 44: (receiver, method, ...args) => optionalCallMethod(receiver, method, ...args), 45: (fn, ...args) => fn == null ? undefined : callFunction(fn, ...args), 46: name => { try { return typeof read(name, rootScope); } catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; } }, 60: classes => installCompactClasses(classes, rootScope)
  };
}
module.exports = { createDefaultHost };

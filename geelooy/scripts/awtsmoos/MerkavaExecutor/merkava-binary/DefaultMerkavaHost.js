// B"H
/**
 * DefaultMerkavaHost gives structured JSON opcodes living semantics.
 * No raw source is evaluated here: classes, instances, functions, arrays,
 * typed arrays, generators, and async-like vessels are plain data interpreted
 * by the Merkava VM syscall path.
 */
const { installCompactClasses, newCompactInstance, callCompactMethod } = require('./CompactClassRuntime.js');

function createDefaultHost(rootScope = {}) {
  const defineClass = (desc, superClass = null) => ({ __kind: 'class', prototype: {}, ...desc, superClass });
  const newInstance = (klass, args = []) => {
    const instance = { __kind: 'instance', __class: klass, fields: {} };
    const ctor = findMethod(klass, 'constructor');
    if (ctor) interpretNode(ctor.body, { this: instance, arguments: args, __class: ctor.owner });
    return instance;
  };
  const findMethod = (klass, name) => {
    if (!klass) return null;
    const method = (klass.methods || []).find(m => m.name === name);
    if (method) return { ...method, owner: klass };
    return findMethod(klass.superClass, name);
  };

  const makeSyncPromise = value => ({
    __kind: 'syncPromise',
    value,
    then(fn) { return makeSyncPromise(callFunction(fn, value)); }
  });
  const nativePromise = { resolve: value => makeSyncPromise(value) };

  const read = (name, scope = {}) => {
    if (name in scope) return scope[name];
    if (Object.prototype.hasOwnProperty.call(rootScope, name)) return rootScope[name];
    if (name === 'Promise') return nativePromise;
    if (Object.prototype.hasOwnProperty.call(globalThis, name)) return globalThis[name];
    return undefined;
  };
  const write = (name, value, scope = {}) => {
    let cursor = scope;
    while (cursor && cursor !== Object.prototype) {
      if (Object.prototype.hasOwnProperty.call(cursor, name)) { cursor[name] = value; return value; }
      cursor = Object.getPrototypeOf(cursor);
    }
    scope[name] = value;
    return value;
  };

  const evalBlock = (body = [], scope = {}) => {
    let value;
    for (const step of body) {
      if (step?.op === 'return') return interpretNode(step.value, scope);
      value = interpretNode(step, scope);
    }
    return value;
  };

  const interpretNode = (node, scope = {}) => {
    if (node == null) return null;
    if (typeof node !== 'object') return node;
    if (node.const !== undefined) return node.const;
    if (node.get) return read(node.get, scope);
    if (node.op === 'set') return write(node.name, interpretNode(node.value, scope), scope);
    if (node.op === 'set') return write(node.name, interpretNode(node.value, scope), scope);
    if (node.op === 'add') return interpretNode(node.args[0], scope) + interpretNode(node.args[1], scope);
    if (node.op === 'sub') return interpretNode(node.args[0], scope) - interpretNode(node.args[1], scope);
    if (node.op === 'mul') return interpretNode(node.args[0], scope) * interpretNode(node.args[1], scope);
    if (node.op === 'div') return interpretNode(node.args[0], scope) / interpretNode(node.args[1], scope);
    if (node.op === 'mod') return interpretNode(node.args[0], scope) % interpretNode(node.args[1], scope);
    if (node.op === 'eq') return interpretNode(node.args[0], scope) == interpretNode(node.args[1], scope);
    if (node.op === 'seq') return interpretNode(node.args[0], scope) === interpretNode(node.args[1], scope);
    if (node.op === 'neq') return interpretNode(node.args[0], scope) != interpretNode(node.args[1], scope);
    if (node.op === 'sneq') return interpretNode(node.args[0], scope) !== interpretNode(node.args[1], scope);
    if (node.op === 'lt') return interpretNode(node.args[0], scope) < interpretNode(node.args[1], scope);
    if (node.op === 'lte') return interpretNode(node.args[0], scope) <= interpretNode(node.args[1], scope);
    if (node.op === 'gt') return interpretNode(node.args[0], scope) > interpretNode(node.args[1], scope);
    if (node.op === 'gte') return interpretNode(node.args[0], scope) >= interpretNode(node.args[1], scope);
    if (node.op === 'and') return interpretNode(node.args[0], scope) && interpretNode(node.args[1], scope);
    if (node.op === 'or') return interpretNode(node.args[0], scope) || interpretNode(node.args[1], scope);
    if (node.op === 'not') return !interpretNode(node.value, scope);
    if (node.op === 'neg') return -interpretNode(node.value, scope);
    if (node.op === 'pos') return +interpretNode(node.value, scope);
    if (node.op === 'await') {
      const value = interpretNode(node.value, scope);
      return value && value.__kind === 'syncPromise' ? value.value : value;
    }
    if (node.op === 'array') return (node.items || []).map(item => interpretNode(item, scope));
    if (node.op === 'object') {
      const out = {};
      for (const prop of node.props || []) out[prop.key] = interpretNode(prop.value, scope);
      return out;
    }
    if (node.op === 'objectMerge') {
      const out = {};
      for (const part of node.parts || []) {
        if (part.spread) Object.assign(out, interpretNode(part.spread, scope) || {});
        else out[part.key] = interpretNode(part.value, scope);
      }
      return out;
    }
    if (node.op === 'objectMerge') {
      const out = {};
      for (const part of node.parts || []) {
        if (part.spread) Object.assign(out, interpretNode(part.spread, scope) || {});
        else out[part.key] = interpretNode(part.value, scope);
      }
      return out;
    }
    if (node.op === 'typedArray') {
      const values = (node.items || []).map(item => interpretNode(item, scope));
      const Ctor = globalThis[node.kind] || Uint8Array;
      return new Ctor(values);
    }
    if (node.op === 'newError') return new Error(interpretNode(node.message, scope));
    if (node.op === 'throw') throw interpretNode(node.value, scope);
    if (node.op === 'try') {
      try { evalBlock(node.body || [], scope); }
      catch (error) {
        const catchScope = Object.create(scope || null);
        if (node.catchParam) catchScope[node.catchParam] = error;
        evalBlock(node.catchBody || [], catchScope);
      } finally {
        evalBlock(node.finallyBody || [], scope);
      }
      return undefined;
    }
    if (node.op === 'class') return defineClass(node.descriptor, interpretNode(node.descriptor.superClass, scope));
    if (node.op === 'new') {
      const klass = interpretNode(node.class, scope);
      const args = (node.args || []).map(arg => interpretNode(arg, scope));
      if (typeof klass === 'function') return new klass(...args);
      return klass?.__kind === 'compactClass' ? newCompactInstance(klass, args, rootScope) : newInstance(klass, args);
    }
    if (node.op === 'function') return makeFunction(node, scope);
    if (node.op === 'callMethod') return callMethod(interpretNode(node.object, scope), node.method, ...(node.args || []).map(arg => interpretNode(arg, scope)));
    if (node.op === 'getProp') return getProp(interpretNode(node.object, scope), interpretNode(node.prop, scope));
    if (node.op === 'setProp') return setProp(interpretNode(node.object, scope), interpretNode(node.prop, scope), interpretNode(node.value, scope));
    if (node.op === 'callFunction') return callFunction(interpretNode(node.fn, scope), ...(node.args || []).map(arg => interpretNode(arg, scope)));
    if (node.op === 'conditional') return interpretNode(node.test, scope) ? interpretNode(node.consequent, scope) : interpretNode(node.alternate, scope);
    if (node.op === 'optionalGetProp') {
      const object = interpretNode(node.object, scope);
      if (object == null) return undefined;
      return object[interpretNode(node.prop, scope)];
    }
    if (node.op === 'optionalGetProp') {
      const object = interpretNode(node.object, scope);
      if (object == null) return undefined;
      return object[interpretNode(node.prop, scope)];
    }
    if (node.op === 'if') return evalBlock(interpretNode(node.test, scope) ? (node.consequent || []) : (node.alternate || []), scope);
    if (node.op === 'if') return evalBlock(interpretNode(node.test, scope) ? (node.consequent || []) : (node.alternate || []), scope);
    if (node.op === 'superConstructor') return scope.super || null;
    if (node.op === 'superConstructor') return scope.super || null;
    if (node.op === 'block') return evalBlock(node.body || [], scope);
    if (node.op === 'block') return evalBlock(node.body || [], scope);
    return node;
  };

  const makeFunction = (descriptor, closureScope = {}) => ({
    __kind: 'function',
    name: descriptor.name || '',
    params: descriptor.params || [],
    body: descriptor.body || [],
    closure: closureScope,
    call(args = [], thisArg = undefined) {
      const scope = Object.create(this.closure || null);
      scope.this = thisArg;
      scope.arguments = args;
      let argIndex = 0;
      this.params.forEach(param => {
        if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex);
        else scope[param] = args[argIndex++];
      });
      return evalBlock(this.body, scope);
    }
  });

  const callMethod = (receiver, method, ...args) => {
    if (receiver && receiver.__kind === 'iterator' && method === 'next') return receiver.next();
    if (receiver && receiver.__kind === 'compactInstance') return callCompactMethod(receiver, method, args, rootScope);
    if (receiver && receiver.__kind === 'compactInstance') return callCompactMethod(receiver, method, args, rootScope);
    if (receiver && receiver[method]?.__kind === 'function') {
      return receiver[method].call(args, receiver);
    }
    if (receiver && receiver[method]?.__kind === 'function') {
      return receiver[method].call(args, receiver);
    }
    if (receiver && typeof receiver[method] === 'function' && receiver.__kind !== 'instance') {
      const bridged = args.map(arg => arg && arg.__kind === 'function' ? (...inner) => callFunction(arg, ...inner) : arg);
      return receiver[method](...bridged);
    }
    const klass = receiver?.__selfClass || receiver?.__class;
    const found = findMethod(klass, method);
    if (!found) {
      const protoFn = klass?.prototype?.[method];
      if (protoFn?.call) return protoFn.call(args, receiver);
      return undefined;
    }
    const superReceiver = found.owner.superClass ? { __kind: 'instance', __class: found.owner.superClass, __selfClass: found.owner.superClass, fields: receiver.fields || {} } : null;
    const scope = { this: receiver, super: superReceiver, arguments: args, __class: found.owner };
    (found.params || []).forEach((name, index) => { scope[name] = args[index]; });
    return interpretNode(found.body, scope);
  };
  const makeGenerator = values => ({ __kind: 'generatorFactory', call: () => {
    let index = 0;
    return { __kind: 'iterator', next: () => index < values.length ? { value: values[index++], done: false } : { value: undefined, done: true } };
  } });
  const makeAsyncVessel = result => ({ __kind: 'asyncFunction', call: () => interpretNode(result, {}) });
  const callFunction = (fn, ...args) => fn?.call ? fn.call(args) : (typeof fn === 'function' ? fn(...args) : undefined);
  const getProp = (obj, prop) => obj == null ? undefined : obj[prop];
  const setProp = (obj, prop, value) => { if (obj != null) obj[prop] = value; return value; };

  return {
    20: defineClass,
    21: (klass, ...args) => typeof klass === 'function' ? new klass(...args) : (klass?.__kind === 'compactClass' ? newCompactInstance(klass, args, rootScope) : newInstance(klass, args)),
    22: callMethod,
    23: getProp,
    24: makeGenerator,
    25: makeAsyncVessel,
    26: callFunction,
    27: (...items) => items,
    28: (...flat) => {
      const out = {};
      for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1];
      return out;
    },
    29: (kind, ...items) => new (globalThis[kind] || Uint8Array)(items || []),
    30: node => interpretNode(node, Object.create(rootScope)),
    31: setProp,
    32: makeFunction,
    33: (op, a, b) => interpretNode({ op, args: [{ const: a }, { const: b }] }),
    34: (op, value) => interpretNode({ op, value: { const: value } }),
    35: (test, consequent, alternate) => test ? consequent : alternate,
    36: (...flat) => {
      const out = {};
      for (let i = 0; i < flat.length;) {
        if (flat[i++] === true) Object.assign(out, flat[i++] || {});
        else out[flat[i++]] = flat[i++];
      }
      return out;
    },
    37: value => value && value.__kind === 'syncPromise' ? value.value : value,
    38: (obj, prop) => obj == null ? undefined : obj[prop],
    39: message => new Error(message),
    60: (classes) => installCompactClasses(classes, rootScope),
    60: (classes) => installCompactClasses(classes, rootScope)
  };
}

module.exports = { createDefaultHost };

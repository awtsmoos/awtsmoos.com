// B"H
const { CC_OP } = require('./CompactClassCodec.js');

function specName(spec) { return Array.isArray(spec) ? spec[0] : spec.name; }
function specSuper(spec) { return Array.isArray(spec) ? spec[1] : spec.superName; }
function specFields(spec) { return Array.isArray(spec) ? spec[2] : (spec.fields || []); }
function specMethods(spec) {
  const raw = Array.isArray(spec) ? spec[3] : (spec.methods || []);
  return raw.map(m => Array.isArray(m) ? { name: m[0], params: m[1] || [], code: m[2] || [] } : m);
}
function specConstants(spec) { return Array.isArray(spec) ? (spec[4] || []) : (spec.constants || []); }
function specClassId(spec, index) { return Array.isArray(spec) ? (spec[5] ?? index) : (spec.classId ?? index); }
function specScopeName(spec, fallback) { return Array.isArray(spec) ? (spec[6] || fallback) : (spec.scopeName || fallback); }
function ensureScope(rootScope, scopeName) {
  rootScope.__merkavaScopes = rootScope.__merkavaScopes || {};
  return rootScope.__merkavaScopes[scopeName] = rootScope.__merkavaScopes[scopeName] || { name: scopeName, classes: [], byName: {} };
}

function installCompactClasses(classes = [], rootScope = {}, options = {}) {
  const scopeName = options.scopeName || (classes[0] ? specScopeName(classes[0], 'global') : 'global');
  const scope = ensureScope(rootScope, scopeName);
  const byName = {};
  const makeClass = (spec, index) => {
    const classId = specClassId(spec, index);
    const klass = {
      __kind: 'compactClass',
      scopeName,
      classId,
      name: specName(spec),
      fields: specFields(spec),
      methods: {},
      methodOrder: [],
      superClass: null,
      constants: specConstants(spec)
    };
    byName[klass.name] = klass;
    scope.byName[klass.name] = klass;
    scope.classes[classId] = klass;
    if (options.exposeGlobals !== false) rootScope[klass.name] = klass;
    return klass;
  };
  classes.forEach(makeClass);
  for (const spec of classes) {
    const klass = byName[specName(spec)];
    klass.superClass = byName[specSuper(spec)] || scope.byName[specSuper(spec)] || rootScope[specSuper(spec)] || null;
    for (const method of specMethods(spec)) {
      klass.methodOrder.push(method.name);
      klass.methods[method.name] = method;
    }
  }
  return { scope, byName };
}

function newCompactInstance(klass, args = [], rootScope = {}) {
  const instance = { __kind: 'compactInstance', __class: klass, slots: Array((klass.fields || []).length).fill(undefined) };
  callCompactMethod(instance, 'constructor', args, rootScope);
  return instance;
}

function findCompactMethod(klass, name) {
  if (!klass) return null;
  if (klass.methods?.[name]) return { klass, method: klass.methods[name] };
  return findCompactMethod(klass.superClass, name);
}

function callCompactMethod(instance, name, args = [], rootScope = {}) {
  const found = findCompactMethod(instance.__class, name);
  if (!found) return undefined;
  return runCompactMethod(instance, found.klass, found.method, args, rootScope);
}

function callSuperCompact(instance, ownerClass, name, args = [], rootScope = {}) {
  const found = findCompactMethod(ownerClass?.superClass, name);
  if (!found) return undefined;
  return runCompactMethod(instance, found.klass, found.method, args, rootScope);
}

function runCompactMethod(instance, ownerClass, method, args = [], rootScope = {}) {
  const stack = [];
  const code = method.code || [];
  const constants = ownerClass.constants || method.constants || [];
  let ip = 0;
  const readVar = () => {
    let shift = 0, out = 0;
    for (;;) {
      const b = code[ip++];
      out |= (b & 127) << shift;
      if (!(b & 128)) return out >>> 0;
      shift += 7;
    }
  };
  const c = idx => constants[idx];
  while (ip < code.length) {
    const op = code[ip++];
    if (op === CC_OP.END) break;
    if (op === CC_OP.SUPER_CTOR) continue;
    if (op === CC_OP.SET_THIS_SLOT_CONST) { instance.slots[code[ip++]] = c(readVar()); continue; }
    if (op === CC_OP.GET_THIS_SLOT) { stack.push(instance.slots[code[ip++]]); continue; }
    if (op === CC_OP.CALL_SUPER_METHOD) { stack.push(callSuperCompact(instance, ownerClass, c(readVar()), [], rootScope)); continue; }
    if (op === CC_OP.ADD) { const b = stack.pop(), a = stack.pop(); stack.push(a + b); continue; }
    if (op === CC_OP.CONST) { stack.push(c(readVar())); continue; }
    if (op === CC_OP.SET_DOM_TEXT_ARG) {
      const target = rootScope[c(readVar())];
      const arg = args[code[ip++]];
      if (target) target.textContent = arg;
      stack.push(arg);
      continue;
    }
    if (op === CC_OP.SET_DOM_TEXT_CONST) {
      const target = rootScope[c(readVar())];
      const value = c(readVar());
      if (target) target.textContent = value;
      stack.push(value);
      continue;
    }
    if (op === CC_OP.RETURN) return stack.pop();
    throw new Error(`Unknown compact class opcode: ${op}`);
  }
  return stack.pop();
}

module.exports = { installCompactClasses, newCompactInstance, callCompactMethod, ensureScope };

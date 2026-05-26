// B"H
const { encodeSangArtifact } = require('./SangCodec.js');

const BIN = { add: 0x40, sub: 0x41, mul: 0x42, div: 0x43, mod: 0x44 };
const SYS = {
  class: 20, new: 21, callMethod: 22, getProp: 23, generator: 24,
  asyncFunction: 25, callFunction: 26, array: 27, object: 28, typedArray: 29,
  setProp: 31, function: 32, binary: 33, unary: 34, conditional: 35,
  objectMerge: 36, awaitValue: 37, optionalGetProp: 38, newError: 39, forOf: 40, whileLoop: 41, switchStmt: 42
};

function addConst(constants, value) { constants.push(value); return constants.length - 1; }
function u16(bytes, value) { bytes.push(value & 255, (value >> 8) & 255); }
function patch16(bytes, at, value) { bytes[at] = value & 255; bytes[at + 1] = (value >> 8) & 255; }
function pushConst(bytes, constants, value) { bytes.push(0x13); u16(bytes, addConst(constants, value)); }
function load(bytes, constants, name) { bytes.push(0x22); u16(bytes, addConst(constants, name)); }
function store(bytes, constants, name) { bytes.push(0x23); u16(bytes, addConst(constants, name)); }
function propArg(prop) {
  if (prop && typeof prop === 'object' && (prop.op || prop.get || prop.const !== undefined)) return prop;
  return { const: prop };
}

/**
 * Compiles raw JSON Merkava code into VM bytecode.
 * No semantic JSON eval route is emitted: control flow and throw routes become
 * direct VM instructions, while tiny host syscalls only perform native value
 * construction/access where the VM intentionally delegates.
 */
function compileJsonCode(program = {}) {
  const constants = [], bytecode = [];
  const emitSys = (id, args) => { for (const arg of args || []) emit(arg); bytecode.push(0x90, id, (args || []).length); };
  const emitConstSys = (id, rawArgs) => { for (const arg of rawArgs || []) pushConst(bytecode, constants, arg); bytecode.push(0x90, id, (rawArgs || []).length); };

  const emitBlock = body => {
    for (const step of body || []) {
      if (step?.op === 'return') { emit(step.value); bytecode.push(0x02); }
      else emit(step);
    }
  };

  const emitJumpIfFalse = test => {
    emit(test);
    bytecode.push(0x04);
    const patchAt = bytecode.length;
    bytecode.push(0, 0);
    return patchAt;
  };

  const emitJump = () => {
    bytecode.push(0x03);
    const patchAt = bytecode.length;
    bytecode.push(0, 0);
    return patchAt;
  };

  const patchRelative = patchAt => patch16(bytecode, patchAt, bytecode.length - (patchAt + 2));

  const emit = node => {
    if (typeof node === 'number' || typeof node === 'string' || typeof node === 'boolean' || node == null) return pushConst(bytecode, constants, node);
    if (node.get) return load(bytecode, constants, node.get);
    if (node.const !== undefined) return pushConst(bytecode, constants, node.const);
    if (BIN[node.op]) { emit(node.args[0]); emit(node.args[1]); bytecode.push(BIN[node.op]); return; }
    if (node.op === 'set') { emit(node.value); store(bytecode, constants, node.name); load(bytecode, constants, node.name); return; }
    if (node.op === 'syscall') return emitSys(node.id || 0, node.args || []);
    if (node.op === 'class') return emitSys(SYS.class, [{ const: node.descriptor }, node.descriptor.superClass || { const: null }]);
    if (node.op === 'new') return emitSys(SYS.new, [node.class, ...(node.args || [])]);
    if (node.op === 'callMethod') return emitSys(SYS.callMethod, [node.object, { const: node.method }, ...(node.args || [])]);
    if (node.op === 'getProp') return emitSys(SYS.getProp, [node.object, propArg(node.prop)]);
    if (node.op === 'optionalGetProp') return emitSys(SYS.optionalGetProp, [node.object, propArg(node.prop)]);
    if (node.op === 'setProp') return emitSys(SYS.setProp, [node.object, propArg(node.prop), node.value]);
    if (node.op === 'generator') return emitConstSys(SYS.generator, [node.values || []]);
    if (node.op === 'asyncFunction') return emitConstSys(SYS.asyncFunction, [node.result]);
    if (node.op === 'function') return emitConstSys(SYS.function, [node]);
    if (node.op === 'callFunction') return emitSys(SYS.callFunction, [node.fn, ...(node.args || [])]);
    if (node.op === 'await') return emitSys(SYS.awaitValue, [node.value]);
    if (node.op === 'newError') return emitSys(SYS.newError, [node.message || { const: '' }]);
    if (node.op === 'throw') { emit(node.value); bytecode.push(0x91); return; }
    if (node.op === 'forOf') return emitSys(SYS.forOf, [{ const: node }]);
    if (node.op === 'while') return emitSys(SYS.whileLoop, [{ const: node }]);
    if (node.op === 'switch') return emitSys(SYS.switchStmt, [{ const: node }]);
    if (node.op === 'if') {
      const falsePatch = emitJumpIfFalse(node.test);
      emitBlock(node.consequent || []);
      if (node.alternate && node.alternate.length) {
        const endPatch = emitJump();
        patchRelative(falsePatch);
        emitBlock(node.alternate || []);
        patchRelative(endPatch);
      } else patchRelative(falsePatch);
      pushConst(bytecode, constants, undefined);
      return;
    }
    if (node.op === 'try') {
      bytecode.push(0x92);
      const catchPatch = bytecode.length;
      bytecode.push(0, 0);
      emitBlock(node.body || []);
      bytecode.push(0x93);
      const endPatch = emitJump();
      patchRelative(catchPatch);
      if (node.catchParam) store(bytecode, constants, node.catchParam);
      emitBlock(node.catchBody || []);
      patchRelative(endPatch);
      emitBlock(node.finallyBody || []);
      pushConst(bytecode, constants, undefined);
      return;
    }
    if (node.op === 'array') return emitSys(SYS.array, node.items || []);
    if (node.op === 'object') {
      const flat = [];
      for (const prop of node.props || []) flat.push({ const: prop.key }, prop.value);
      return emitSys(SYS.object, flat);
    }
    if (node.op === 'objectMerge') {
      const flat = [];
      for (const part of node.parts || []) {
        if (part.spread) flat.push({ const: true }, part.spread);
        else flat.push({ const: false }, { const: part.key }, part.value);
      }
      return emitSys(SYS.objectMerge, flat);
    }
    if (node.op === 'typedArray') return emitSys(SYS.typedArray, [{ const: node.kind }, ...(node.items || [])]);
    if (['eq','seq','neq','sneq','lt','lte','gt','gte','and','or'].includes(node.op)) return emitSys(SYS.binary, [{ const: node.op }, node.args[0], node.args[1]]);
    if (['not','neg','pos'].includes(node.op)) return emitSys(SYS.unary, [{ const: node.op }, node.value]);
    if (node.op === 'conditional') return emitSys(SYS.conditional, [node.test, node.consequent, node.alternate]);
    throw new Error(`Unsupported Merkava JSON node: ${JSON.stringify(node)}`);
  };

  emitBlock(program.steps || []);
  if (program.result) emit(program.result);
  bytecode.push(0x01);
  return { constants, bytecode, meta: { kind: 'merkava-json', program } };
}

function compileJsonToSang(program) { return encodeSangArtifact(compileJsonCode(program)); }
module.exports = { compileJsonCode, compileJsonToSang };

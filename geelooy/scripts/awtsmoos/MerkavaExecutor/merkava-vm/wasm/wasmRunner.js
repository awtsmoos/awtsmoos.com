// B"H — High-level WebAssembly API for the Merkava VM family.
// WAT text -> binary (repo canonical builders) -> parse -> custom interpreter.
// Also bridges into MerkavaVM via hostAPI (additive; no existing files touched)
// and cross-checks against the host's native WebAssembly for test validation.
import { parseModule } from './wasmParser.js';
import { instantiate, invoke, invokeByIndex, WasmTrap } from './wasmExecutor.js';
import { compileWat } from './watEmit.js';

export { WasmTrap };

export function compileWatToBytes(wat) {
  return compileWat(wat);
}

export function instantiateBytes(bytes, importObject = {}, opts = {}) {
  const mod = parseModule(bytes);
  return instantiate(mod, importObject, opts);
}

export function instantiateWat(wat, importObject = {}, opts = {}) {
  return instantiateBytes(compileWat(wat), importObject, opts);
}

/** Call an exported function; returns plain JS values (numbers, BigInts). */
export function callExport(inst, name, args = []) {
  return invoke(inst, name, args);
}

/** Validate bytes with the host's native WebAssembly (test cross-check). */
export function nativeValidate(bytes) {
  if (typeof WebAssembly === 'undefined' || !WebAssembly.validate) {
    return { supported: false };
  }
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return { supported: true, valid: WebAssembly.validate(buf) };
}

/** Run the same export natively and return JS values (test cross-check). */
export async function nativeCall(bytes, exportName, args = [], importObject = {}) {
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const mod = await WebAssembly.compile(buf);
  const instance = await WebAssembly.instantiate(mod, importObject);
  const fn = instance.exports[exportName];
  if (typeof fn !== 'function') throw new Error('[wasm] native: no export ' + exportName);
  return fn(...args);
}

/**
 * Additive bridge: exposes the WASM engine on a MerkavaVM instance's hostAPI
 * so VM guest code can instantiate/call WASM modules. Does not modify any
 * existing VM file; uses only the public hostAPI object.
 */
export function bridgeMerkavaVM(vm) {
  vm.hostAPI = vm.hostAPI || {};
  vm.hostAPI.wasm = Object.freeze({
    compileWatToBytes,
    instantiateBytes,
    instantiateWat,
    callExport,
    nativeValidate,
    Trap: WasmTrap,
  });
  return vm.hostAPI.wasm;
}

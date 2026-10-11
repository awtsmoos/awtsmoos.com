// B"H — WAT module model -> WASM binary.
// Emission is built on the repo's canonical builders:
//   geelooy/scripts/awtsmoos/compiling/wasm/binary.js  (sections, vectors)
//   geelooy/scripts/awtsmoos/compiling/wasm/leb128.js   (ULEB/SLEB encoders)
// s64/f32/f64 immediates use merkava-vm/wasm/leb128.js writers.
import {
  wasmModule, section, vector, wasmName, byteVector, bytes,
} from '../../../compiling/wasm/binary.js';
import { encodeUnsigned, encodeSigned32 } from '../../../compiling/wasm/leb128.js';
import { writeS64, writeF32, writeF64 } from './leb128.js';
import { NAME_TO_OP, VALTYPE_CODE } from './wasmOpcodes.js';
import { buildModel, IMM_KIND, naturalAlign } from './watModel.js';

function encodeInstr(instr) {
  const out = [];
  const byte = NAME_TO_OP[instr.op];
  if (byte === undefined) throw new Error('[wat] cannot emit unknown op ' + instr.op);
  out.push(byte);
  const imm = instr.imm;
  const kind = IMM_KIND[instr.op] || 'none';
  switch (kind) {
    case 'none': break;
    case 'u32': out.push(...encodeUnsigned(imm)); break;
    case 's32': out.push(...encodeSigned32(imm)); break;
    case 's64': writeS64(out, imm); break;
    case 'f32': writeF32(out, imm); break;
    case 'f64': writeF64(out, imm); break;
    case 'blocktype':
      if (!imm || imm.length === 0) out.push(0x40);
      else out.push(VALTYPE_CODE[imm[0]]);
      break;
    case 'memarg': {
      const align = imm.align === null || imm.align === undefined ? naturalAlign(instr.op) : imm.align;
      out.push(...encodeUnsigned(align), ...encodeUnsigned(imm.offset));
      break;
    }
    case 'brtable':
      out.push(...encodeUnsigned(imm.targets.length));
      for (const t of imm.targets) out.push(...encodeUnsigned(t));
      out.push(...encodeUnsigned(imm.default));
      break;
    case 'callindirect':
      out.push(...encodeUnsigned(imm.typeIdx), ...encodeUnsigned(imm.tableIdx));
      break;
    default: throw new Error('[wat] cannot emit imm kind ' + kind);
  }
  return out;
}

function encodeLimits(lim) {
  return lim.max === null || lim.max === undefined
    ? bytes([0x00], encodeUnsigned(lim.min))
    : bytes([0x01], encodeUnsigned(lim.min), encodeUnsigned(lim.max));
}

function encodeInitExpr(instrs) {
  const out = [];
  for (const ins of instrs) out.push(...encodeInstr(ins));
  out.push(0x0b);
  return out;
}

export function emitModule(m) {
  const secs = [];

  if (m.types.length > 0) {
    secs.push(section(1, vector(m.types.map((t) =>
      bytes(
        [0x60],
        vector(t.params.map((p) => [VALTYPE_CODE[p]])),
        vector(t.results.map((r) => [VALTYPE_CODE[r]])),
      )
    ))));
  }

  if (m.imports.length > 0) {
    secs.push(section(2, vector(m.imports.map((im) => {
      let desc;
      if (im.kind === 'func') desc = bytes(encodeUnsigned(im.typeIdx));
      else if (im.kind === 'table') desc = bytes([0x70], encodeLimits(im));
      else if (im.kind === 'memory') desc = encodeLimits(im);
      else if (im.kind === 'global') desc = bytes([VALTYPE_CODE[im.valtype]], [im.mutable ? 1 : 0]);
      else throw new Error('[wat] bad import kind ' + im.kind);
      const kindByte = { func: 0, table: 1, memory: 2, global: 3 }[im.kind];
      return bytes(wasmName(im.module), wasmName(im.name), [kindByte], desc);
    }))));
  }

  const definedFuncs = m.funcs;
  if (definedFuncs.length > 0) {
    secs.push(section(3, vector(definedFuncs.map((fn) => encodeUnsigned(fn.typeIdx)))));
  }

  const allTables = [
    ...m.imports.filter((i) => i.kind === 'table'),
    ...m.tables,
  ];
  if (allTables.length > 0) {
    // only defined tables get a table section; imported ones don't
    if (m.tables.length > 0) {
      secs.push(section(4, vector(m.tables.map((t) => bytes([0x70], encodeLimits(t))))));
    }
  }

  if (m.memories.length > 0) {
    secs.push(section(5, vector(m.memories.map((mm) => encodeLimits(mm)))));
  }

  if (m.globals.length > 0) {
    secs.push(section(6, vector(m.globals.map((g) =>
      bytes([VALTYPE_CODE[g.valtype]], [g.mutable ? 1 : 0], encodeInitExpr(g.init))
    ))));
  }

  if (m.exports.length > 0) {
    const kindByte = { func: 0, table: 1, memory: 2, global: 3 };
    secs.push(section(7, vector(m.exports.map((e) =>
      bytes(wasmName(e.name), [kindByte[e.kind]], encodeUnsigned(e.index))
    ))));
  }

  if (m.start !== null && m.start !== undefined) {
    secs.push(section(8, bytes(encodeUnsigned(m.start))));
  }

  if (m.elems.length > 0) {
    secs.push(section(9, vector(m.elems.map((e) =>
      bytes(encodeUnsigned(0), encodeInitExpr(e.offset), vector(e.funcs.map((f) => encodeUnsigned(f))))
    ))));
  }

  if (definedFuncs.length > 0) {
    secs.push(section(10, vector(definedFuncs.map((fn) => {
      const groups = [];
      for (const l of fn.locals) {
        const last = groups[groups.length - 1];
        if (last && last.t === l.t) last.n++;
        else groups.push({ n: 1, t: l.t });
      }
      const localPart = [encodeUnsigned(groups.length)];
      for (const g of groups) localPart.push(encodeUnsigned(g.n), [VALTYPE_CODE[g.t]]);
      const codePart = [];
      for (const ins of fn.body) codePart.push(...encodeInstr(ins));
      codePart.push(0x0b);
      const body = bytes(bytes(...localPart), bytes(codePart));
      return bytes(encodeUnsigned(body.length), body);
    }))));
  }

  if (m.datas.length > 0) {
    secs.push(section(11, vector(m.datas.map((d) => {
      if (d.memory === 0) {
        return bytes(encodeUnsigned(0), encodeInitExpr(d.offset), byteVector(d.bytes));
      }
      return bytes(encodeUnsigned(2), encodeUnsigned(d.memory), encodeInitExpr(d.offset), byteVector(d.bytes));
    }))));
  }

  return wasmModule(secs);
}

export function compileWat(src) {
  return emitModule(buildModel(src));
}

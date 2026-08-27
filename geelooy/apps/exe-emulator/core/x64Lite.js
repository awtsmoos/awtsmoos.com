// B"H
import { createWinApi } from './winApi.js';

const REG = ['rax','rcx','rdx','rbx','rsp','rbp','rsi','rdi','r8','r9','r10','r11','r12','r13','r14','r15'];
const LOW32 = ['eax','ecx','edx','ebx','esp','ebp','esi','edi','r8d','r9d','r10d','r11d','r12d','r13d','r14d','r15d'];

/**
 * Executes the x64 subset emitted by the Awtsmoos compiler examples.
 * This is not a universal CPU; it is a grounded vessel for the compiler's PE output.
 * @param {object} image mapped PE image
 * @param {object} win virtual Windows host
 * @returns {{steps:number, halted:boolean}}
 */
export function runCompilerX64(image, win) {
  const text = image.pe.sections.find(s => s.name === '.text') || image.pe.sections[0];
  const cpu = makeCpu(image, text);
  const callImport = createWinApi(win, cpu);

  const maxInstructions = 120000;
  for (let guard = 0; guard < maxInstructions && !cpu.halted; guard++) {
    execOne(cpu, callImport);
  }
  if (!cpu.halted) throw new Error(`Execution instruction limit reached at 0x${cpu.rva().toString(16)}`);
  return { steps: cpu.steps, halted: cpu.halted };
}

function makeCpu(image, text) {
  const base = text.virtualAddress;
  const raw = text.rawPointer;
  const cpu = {
    image, text, base, raw,
    ip: image.pe.entryRva - base,
    regs: {}, mem: new Map(), stack: [], flags: {}, halted: false, steps: 0,
    queue: [1, 0]
  };
  REG.forEach(r => { cpu.regs[r] = 0; });
  cpu.regs.rsp = 0x800000;
  cpu.rva = () => base + cpu.ip;
  cpu.u8 = () => (cpu.steps++, image.bytes[raw + cpu.ip++]);
  cpu.i8 = () => sign(cpu.u8(), 8);
  cpu.u32 = () => { const v = image.view.getUint32(raw + cpu.ip, true); cpu.ip += 4; return v >>> 0; };
  cpu.i32 = () => { const v = image.view.getInt32(raw + cpu.ip, true); cpu.ip += 4; return v; };
  cpu.u64lo = () => { const lo = cpu.u32(); cpu.u32(); return lo; };
  cpu.readString = (rva, len = 4096) => image.readCString(rva).slice(0, len);
  cpu.push = v => { cpu.regs.rsp -= 8; cpu.mem.set(cpu.regs.rsp, v >>> 0); cpu.stack.push(v >>> 0); };
  cpu.pop = () => { const v = cpu.mem.get(cpu.regs.rsp) ?? cpu.stack.pop() ?? 0; cpu.regs.rsp += 8; return v >>> 0; };
  return cpu;
}

function execOne(cpu, callImport) {
  let b = cpu.u8();
  if (b === 0x08 && cpu.image.bytes[cpu.raw + cpu.ip] === 0xFF && cpu.image.bytes[cpu.raw + cpu.ip + 1] === 0xFF && cpu.image.bytes[cpu.raw + cpu.ip + 2] === 0xFF) { cpu.ip += 3; return; }
  if (b === 0x08 && cpu.image.bytes[cpu.raw + cpu.ip] === 0xFF && cpu.image.bytes[cpu.raw + cpu.ip + 1] === 0xFF && cpu.image.bytes[cpu.raw + cpu.ip + 2] === 0xFF) { cpu.ip += 3; return; }
  if (b === 0xFC || b === 0xFD || b === 0x90) return;
  if (b === 0xF3) return execRep(cpu);

  let rex = 0;
  if (b >= 0x40 && b <= 0x4F) { rex = b; b = cpu.u8(); }

  if (b >= 0x50 && b <= 0x57) return cpu.push(getReg(cpu, (b - 0x50) + rb(rex)));
  if (b >= 0x58 && b <= 0x5F) return setReg(cpu, (b - 0x58) + rb(rex), cpu.pop());
  if (b >= 0xB8 && b <= 0xBF) return setReg(cpu, (b - 0xB8) + rb(rex), rw(rex) ? cpu.u64lo() : cpu.u32());

  if (b === 0x31) return xorRmReg(cpu, rex, cpu.u8());
  if (b === 0x6B) return imulRegRmImm8(cpu, rex, cpu.u8());
  if (b === 0x6B) return imulRegRmImm8(cpu, rex, cpu.u8());
  if (b === 0x39) return cmpRmReg(cpu, rex, cpu.u8());
  if (b === 0x3B) return cmpRegRm(cpu, rex, cpu.u8());
  if (b === 0x83) return aluImm(cpu, rex, cpu.u8(), cpu.i8());
  if (b === 0x81) return aluImm(cpu, rex, cpu.u8(), cpu.u32());
  if (b === 0x89) return movRmReg(cpu, rex, cpu.u8());
  if (b === 0x8B) return movRegRm(cpu, rex, cpu.u8());
  if (b === 0x8D) return lea(cpu, rex, cpu.u8());
  if (b === 0xC7) return movRmImm(cpu, rex, cpu.u8());
  if (b === 0xD1) return shiftOne(cpu, rex, cpu.u8());
  if (b === 0xF7) return execF7(cpu, rex, cpu.u8());
  if (b === 0xFF) return execFf(cpu, rex, cpu.u8(), callImport);
  if (b === 0xE8) return callRel(cpu);
  if (b === 0xE9) return jmpRel(cpu);
  if (b === 0xEB) { cpu.ip += cpu.i8(); return; }
  if (b === 0xC3) return ret(cpu);
  if (b === 0x0F) return exec0f(cpu, rex);
  if (b === 0x08) return orRmReg(cpu, rex, cpu.u8());
  if (b === 0x08) return orRmReg(cpu, rex, cpu.u8());
  if (b === 0x0B) return orRegRm(cpu, rex, cpu.u8());
  if (b === 0x23) return andRegRm(cpu, rex, cpu.u8());
  if (b === 0x21) return andRmReg(cpu, rex, cpu.u8());
  if (b === 0x01) return addRmReg(cpu, rex, cpu.u8());
  if (b === 0x03) return addRegRm(cpu, rex, cpu.u8());
  if (b === 0x2B) return subRegRm(cpu, rex, cpu.u8());
  if (b === 0x29) return subRmReg(cpu, rex, cpu.u8());

  throw new Error(`Unsupported opcode 0x${b.toString(16)} at 0x${(cpu.rva() - 1).toString(16)}`);
}

function exec0f(cpu, rex) {
  const op = cpu.u8();
  if ([0x84,0x85,0x8C,0x8D,0x8E,0x8F].includes(op)) {
    const d = cpu.i32();
    if (take(cpu, op)) cpu.ip += d;
    return;
  }
  if ([0x94,0x95,0x9C,0x9D,0x9E,0x9F].includes(op)) {
    const m = cpu.u8();
    const d = decodeModRm(cpu, rex, m);
    const value = setccValue(cpu, op);
    d.direct ? setLow8(cpu, d.addr, value) : writeMem(cpu, d.addr, value);
    return;
  }
  if ([0x94,0x95,0x9C,0x9D,0x9E,0x9F].includes(op)) {
    const m = cpu.u8();
    const d = decodeModRm(cpu, rex, m);
    const value = setccValue(cpu, op);
    d.direct ? setLow8(cpu, d.addr, value) : writeMem(cpu, d.addr, value);
    return;
  }
  if (op === 0xB6 || op === 0xBE) {
    const m = cpu.u8();
    const { reg, addr, direct } = decodeModRm(cpu, rex, m);
    const v = direct ? getReg(cpu, addr) : readMem(cpu, addr);
    setReg(cpu, reg, op === 0xBE ? sign(v & 0xFF, 8) : (v & 0xFF));
    return;
  }
  throw new Error(`Unsupported 0F opcode 0x${op.toString(16)} at 0x${(cpu.rva() - 2).toString(16)}`);
}

function execRep(cpu) {
  const op = cpu.u8();
  if (op !== 0xAB) throw new Error(`Unsupported REP opcode 0x${op.toString(16)}`);
  const count = Math.min(getReg(cpu, 1), 200000);
  const val = getReg(cpu, 0);
  let ptr = getReg(cpu, 7);
  for (let i = 0; i < count; i++) { cpu.mem.set(ptr, val); ptr += 4; }
  setReg(cpu, 7, ptr);
}

function execFf(cpu, rex, m, callImport) {
  const op = (m >> 3) & 7;
  const decoded = decodeModRm(cpu, rex, m);
  if (op === 0 && decoded.direct) { setReg(cpu, decoded.addr, getReg(cpu, decoded.addr) + 1); setFlags(cpu, getReg(cpu, decoded.addr)); return; }
  if (op === 1 && decoded.direct) { setReg(cpu, decoded.addr, getReg(cpu, decoded.addr) - 1); setFlags(cpu, getReg(cpu, decoded.addr)); return; }
  if (op === 2 && !decoded.direct) {
    const name = cpu.image.imports.get(decoded.addr) || `IAT@${decoded.addr.toString(16)}`;
    callImport(name);
    return;
  }
  if (op === 4 && !decoded.direct) { cpu.ip = readMem(cpu, decoded.addr) - cpu.base; return; }
  throw new Error(`Unsupported FF /${op} at 0x${cpu.rva().toString(16)}`);
}

function execF7(cpu, rex, m) {
  const op = (m >> 3) & 7;
  const d = decodeModRm(cpu, rex, m);
  const old = d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr);
  let out = old;
  if (op === 3) out = -old;
  else if (op === 2) out = ~old;
  else throw new Error(`Unsupported F7 /${op} at 0x${cpu.rva().toString(16)}`);
  d.direct ? setReg(cpu, d.addr, out) : writeMem(cpu, d.addr, out);
  setFlags(cpu, out);
}

function callRel(cpu) { const d = cpu.i32(); cpu.push(cpu.rva()); cpu.ip += d; }
function jmpRel(cpu) { cpu.ip += cpu.i32(); }
function ret(cpu) { const rva = cpu.pop(); cpu.ip = rva ? rva - cpu.base : (cpu.halted = true, cpu.ip); }

function decodeModRm(cpu, rex, m) {
  const mode = m & 0xC0;
  const rm0 = m & 7;
  const reg = ((m >> 3) & 7) + rr(rex);
  let rm = rm0 + rb(rex);
  if (mode === 0xC0) return { reg, addr: rm, direct: true };

  let base = 0;
  if (rm0 === 4) {
    const sib = cpu.u8();
    const baseIndex = (sib & 7) + rb(rex);
    const index = ((sib >> 3) & 7) + rx(rex);
    const scale = 1 << ((sib >> 6) & 3);
    base = baseIndex === 5 && mode === 0 ? 0 : getReg(cpu, baseIndex);
    if (index !== 4) base += getReg(cpu, index) * scale;
  } else if (rm0 === 5 && mode === 0) {
    const disp = cpu.i32();
    return { reg, addr: cpu.rva() + disp, direct: false };
  } else {
    base = getReg(cpu, rm);
  }
  if (mode === 0x40) base += cpu.i8();
  if (mode === 0x80) base += cpu.i32();
  return { reg, addr: base >>> 0, direct: false };
}

function movRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); }
function movRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); setReg(cpu, d.reg, d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)); }
function movRmImm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = cpu.u32(); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); }
function lea(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); setReg(cpu, d.reg, d.addr); }
function xorRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) ^ getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); setFlags(cpu, v); }
function cmpRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); setFlags(cpu, (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) - getReg(cpu, d.reg)); }
function cmpRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); setFlags(cpu, getReg(cpu, d.reg) - (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr))); }
function orRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = getReg(cpu, d.reg) | (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)); setReg(cpu, d.reg, v); setFlags(cpu, v); }
function orRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) | getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); setFlags(cpu, v); }
function andRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = getReg(cpu, d.reg) & (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)); setReg(cpu, d.reg, v); setFlags(cpu, v); }
function andRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) & getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); setFlags(cpu, v); }
function addRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) + getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); setFlags(cpu, v); }
function addRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = getReg(cpu, d.reg) + (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)); setReg(cpu, d.reg, v); setFlags(cpu, v); }
function subRmReg(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)) - getReg(cpu, d.reg); d.direct ? setReg(cpu, d.addr, v) : writeMem(cpu, d.addr, v); setFlags(cpu, v); }
function subRegRm(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const v = getReg(cpu, d.reg) - (d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr)); setReg(cpu, d.reg, v); setFlags(cpu, v); }
function imulRegRmImm8(cpu, rex, m) { const d = decodeModRm(cpu, rex, m); const src = d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr); const v = src * cpu.i8(); setReg(cpu, d.reg, v); setFlags(cpu, v); }

function aluImm(cpu, rex, m, v) {
  const d = decodeModRm(cpu, rex, m);
  const op = (m >> 3) & 7;
  const old = d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr);
  let out = old;
  if (op === 0) out = old + v;
  else if (op === 4) out = old & v;
  else if (op === 5) out = old - v;
  else if (op === 7) { setFlags(cpu, old - v); return; }
  else throw new Error(`Unsupported ALU imm /${op}`);
  d.direct ? setReg(cpu, d.addr, out) : writeMem(cpu, d.addr, out);
  setFlags(cpu, out);
}

function shiftOne(cpu, rex, m) {
  const d = decodeModRm(cpu, rex, m);
  const op = (m >> 3) & 7;
  const old = d.direct ? getReg(cpu, d.addr) : readMem(cpu, d.addr);
  let out = old;
  if (op === 4) out = old << 1;
  else if (op === 5) out = old >>> 1;
  else if (op === 7) out = old >> 1;
  else if (op === 0 || op === 1 || op === 2 || op === 3) out = old;
  else throw new Error(`Unsupported shift /${op}`);
  d.direct ? setReg(cpu, d.addr, out) : writeMem(cpu, d.addr, out);
  setFlags(cpu, out);
}

function readMem(cpu, addr) {
  if (cpu.mem.has(addr)) return cpu.mem.get(addr) >>> 0;
  const off = cpu.image.rvaToOffset(addr);
  if (off >= 0 && off + 4 <= cpu.image.bytes.length) return cpu.image.view.getUint32(off, true) >>> 0;
  return 0;
}
function writeMem(cpu, addr, value) { cpu.mem.set(addr >>> 0, value >>> 0); }
function getReg(cpu, idx) { return cpu.regs[REG[idx]] || 0; }
function setReg(cpu, idx, val) { cpu.regs[REG[idx]] = val >>> 0; if (idx < LOW32.length) cpu.regs[LOW32[idx]] = val >>> 0; }
function setLow8(cpu, idx, val) { setReg(cpu, idx, (getReg(cpu, idx) & 0xFFFFFF00) | (val & 0xFF)); }
function rw(rex) { return (rex & 8) !== 0; }
function rr(rex) { return (rex & 4) ? 8 : 0; }
function rx(rex) { return (rex & 2) ? 8 : 0; }
function rb(rex) { return (rex & 1) ? 8 : 0; }
function sign(v, bits) { const m = 1 << (bits - 1); return (v & m) ? v - (1 << bits) : v; }
function setccValue(cpu, op) {
  if (op === 0x94) return cpu.flags.z ? 1 : 0;
  if (op === 0x95) return !cpu.flags.z ? 1 : 0;
  if (op === 0x9C) return cpu.flags.s ? 1 : 0;
  if (op === 0x9D) return !cpu.flags.s ? 1 : 0;
  if (op === 0x9E) return (cpu.flags.z || cpu.flags.s) ? 1 : 0;
  if (op === 0x9F) return (!cpu.flags.z && !cpu.flags.s) ? 1 : 0;
  return 0;
}
function setFlags(cpu, v) { cpu.flags.z = (v >>> 0) === 0; cpu.flags.s = v < 0; }
function take(cpu, op) {
  if (op === 0x85) return !cpu.flags.z;
  if (op === 0x84) return cpu.flags.z;
  if (op === 0x8D) return !cpu.flags.s;
  if (op === 0x8C) return cpu.flags.s;
  if (op === 0x8F) return !cpu.flags.z && !cpu.flags.s;
  if (op === 0x8E) return cpu.flags.z || cpu.flags.s;
  return false;
}

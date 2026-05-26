// B"H
import { createWinApi } from './winApi.js';

const REG = ['rax','rcx','rdx','rbx','rsp','rbp','rsi','rdi','r8','r9','r10','r11','r12','r13','r14','r15'];

/**
 * Executes the x64 subset emitted by the Awtsmoos compiler examples.
 * @param {object} image mapped PE image
 * @param {object} win virtual Windows host
 * @returns {{steps:number, halted:boolean}}
 */
export function runCompilerX64(image, win) {
  const text = image.pe.sections.find(s => s.name === '.text') || image.pe.sections[0];
  const cpu = makeCpu(image, text);
  const callImport = createWinApi(win, cpu);
  for (let steps = 0; steps < 50000 && !cpu.halted; steps++) {
    const b = cpu.u8();
    if (b === 0x48 || b === 0x49 || b === 0x4C || b === 0x4D || b === 0x41) execRex(cpu, b, callImport);
    else if (b >= 0x50 && b <= 0x57) cpu.push(cpu.regs[REG[b - 0x50]]);
    else if (b >= 0x58 && b <= 0x5F) cpu.regs[REG[b - 0x58]] = cpu.pop();
    else if (b === 0xE8) cpu.callRel();
    else if (b === 0xE9) cpu.jmpRel();
    else if (b === 0x0F) exec0f(cpu);
    else if (b === 0x31) xorReg(cpu, cpu.u8(), 0);
    else if (b === 0xFF) execFf(cpu, callImport);
    else if (b === 0xC3) cpu.ret();
    else if (b === 0x90 || b === 0xFC || b === 0xFD) {}
    else if (b === 0xEB) cpu.ip += cpu.i8();
    else throw new Error(`Unsupported opcode 0x${b.toString(16)} at 0x${cpu.rva().toString(16)}`);
    if (steps === 49999) throw new Error('Execution step limit reached.');
  }
  return { steps: cpu.steps, halted: cpu.halted };
}

function makeCpu(image, text) {
  const base = text.virtualAddress, raw = text.rawPointer;
  const cpu = { image, text, ip: image.pe.entryRva - base, regs: {}, mem: new Map(), stack: [], flags: {}, halted:false, steps:0, queue:[1,0] };
  REG.forEach(r => { cpu.regs[r] = 0; }); cpu.regs.rsp = 0x800000;
  cpu.rva = () => base + cpu.ip; cpu.off = () => raw + cpu.ip;
  cpu.u8 = () => (cpu.steps++, image.bytes[raw + cpu.ip++]);
  cpu.i8 = () => { const n = cpu.u8(); return n > 127 ? n - 256 : n; };
  cpu.u32 = () => { const v = image.view.getUint32(raw + cpu.ip, true); cpu.ip += 4; return v; };
  cpu.i32 = () => { const v = image.view.getInt32(raw + cpu.ip, true); cpu.ip += 4; return v; };
  cpu.push = v => cpu.stack.push(v >>> 0); cpu.pop = () => cpu.stack.pop() || 0;
  cpu.readString = (rva, len=4096) => image.readCString(rva).slice(0, len);
  cpu.callRel = () => { const d = cpu.i32(); cpu.push(cpu.rva()); cpu.ip += d; };
  cpu.jmpRel = () => { cpu.ip += cpu.i32(); };
  cpu.ret = () => { const rva = cpu.pop(); cpu.ip = rva ? rva - base : (cpu.halted = true, cpu.ip); };
  return cpu;
}

function execRex(cpu, rex, callImport) {
  const op = cpu.u8();
  if (op >= 0xB8 && op <= 0xBF) { const lo=cpu.u32(); const isWide=(rex & 0x08)!==0; if (isWide) cpu.u32(); return setReg(cpu, (op - 0xB8) + ((rex & 1) ? 8 : 0), lo); }
  if (op === 0x83) return alu83(cpu);
  if (op === 0x81) return alu81(cpu);
  if (op === 0x39) return cmpReg(cpu, cpu.u8(), rex);
  if (op === 0x31) return xorReg(cpu, cpu.u8(), rex);
  if (op === 0x89) return movRmReg(cpu, cpu.u8(), rex);
  if (op === 0x8B) return movRegRm(cpu, cpu.u8(), rex);
  if (op === 0x8D) return lea(cpu, cpu.u8(), rex);
  if (op === 0xC7) return movRmImm(cpu, cpu.u8(), rex);
  if (op === 0xFF) return execFf(cpu, callImport);
  throw new Error(`Unsupported REX opcode 0x${op.toString(16)}`);
}

function execFf(cpu, callImport) {
  const mod = cpu.u8();
  if (mod === 0x15 || mod === 0x25) {
    const disp = cpu.i32();
    const target = cpu.rva() + disp;
    callImport(cpu.image.imports.get(target) || `IAT@${target.toString(16)}`);
    return;
  }
  if ((mod & 0xC0) === 0xC0) {
    const op=(mod>>3)&7, r=regFromRm(mod,0);
    if (op===0) setReg(cpu,r,getReg(cpu,r)+1);
    else if (op===1) setReg(cpu,r,getReg(cpu,r)-1);
    else throw new Error(`Unsupported FF reg op ${op} mod=0x${mod.toString(16)} at 0x${cpu.rva().toString(16)}`);
    setFlags(cpu,getReg(cpu,r));
    return;
  }
  throw new Error(`Unsupported FF modrm 0x${mod.toString(16)}`);
}

function exec0f(cpu) {
  const op = cpu.u8();
  const rel = () => { const d = cpu.i32(); if (take(cpu, op)) cpu.ip += d; };
  if ([0x84,0x85,0x8C,0x8D,0x8E,0x8F].includes(op)) return rel();
  throw new Error(`Unsupported 0F opcode 0x${op.toString(16)}`);
}

function alu83(cpu) {
  const m=cpu.u8(), op=(m>>3)&7, r=regFromRm(m,0), v=cpu.i8();
  if (op===0) { setReg(cpu,r,getReg(cpu,r)+v); setFlags(cpu,getReg(cpu,r)); }
  else if (op===5) { setReg(cpu,r,getReg(cpu,r)-v); setFlags(cpu,getReg(cpu,r)); }
  else if (op===7) setFlags(cpu,getReg(cpu,r)-v);
  else throw new Error('Unsupported 83');
}
function alu81(cpu) { const m=cpu.u8(), v=cpu.u32(); if (m===0xEC) cpu.regs.rsp-=v; else if (m===0xC4) cpu.regs.rsp+=v; else throw new Error('Unsupported 81'); }
function xorReg(cpu, mod, rex) { const r = regFromRm(mod, rex); setReg(cpu, r, 0); setFlags(cpu,0); }
function cmpReg(cpu, mod, rex) { setFlags(cpu, getReg(cpu, regFromRm(mod, rex)) - getReg(cpu, regField(mod, rex))); }
function setReg(cpu, idx, val) { cpu.regs[REG[idx]] = val >>> 0; }
function getReg(cpu, idx) { return cpu.regs[REG[idx]] || 0; }
function regFromRm(mod, rex) { return (mod & 7) + ((rex & 1) ? 8 : 0); }
function regField(mod, rex) { return ((mod >> 3) & 7) + ((rex & 4) ? 8 : 0); }

function movRmReg(cpu, mod, rex) { const v = getReg(cpu, regField(mod, rex)); if ((mod & 0xC0) === 0xC0) setReg(cpu, regFromRm(mod, rex), v); else cpu.mem.set(memAddr(cpu, mod), v); }
function movRegRm(cpu, mod, rex) { const dst = regField(mod, rex); if ((mod & 0xC0) === 0xC0) setReg(cpu, dst, getReg(cpu, regFromRm(mod, rex))); else setReg(cpu, dst, cpu.mem.get(memAddr(cpu, mod)) || 0); }
function movRmImm(cpu, mod) { const direct=(mod&0xC0)===0xC0, addr=direct?0:memAddr(cpu,mod), val=cpu.u32(); if (direct) setReg(cpu, regFromRm(mod,0), val); else cpu.mem.set(addr, val); }
function lea(cpu, mod, rex) { const dst = regField(mod, rex); if ((mod & 7) === 5) setReg(cpu, dst, cpu.rva() + 4 + cpu.i32()); else setReg(cpu, dst, memAddr(cpu, mod)); }
function memAddr(cpu, mod) {
  const rm = mod & 7, mode = mod & 0xC0;
  const base = rm === 4 ? (cpu.u8(), cpu.regs.rsp) : getReg(cpu, rm);
  if (mode === 0x40) return base + cpu.i8();
  if (mode === 0x80) return base + cpu.i32();
  return base;
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

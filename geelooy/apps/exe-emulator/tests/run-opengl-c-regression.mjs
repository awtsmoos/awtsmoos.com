// B"H
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { compile } from '../../../scripts/awtsmoos/compiling/index.js';
import { C_EXAMPLES } from '../../../scripts/awtsmoos/compiling/pe/c/examples/index.js';
import { emulatePortableExecutable } from '../core/emulator.js';

const oldLog = console.log;
const dir = 'geelooy/apps/exe-emulator/tests/generated';
const cases = ['opengl_triangle', 'opengl_stress'];
await fs.mkdir(dir, { recursive: true });
const out = [];

for (const name of cases) {
  console.log = () => {};
  const blob = compile(C_EXAMPLES[name], 'c');
  console.log = oldLog;
  const bytes = Buffer.from(await blob.arrayBuffer());
  const exe = path.join(dir, `c-${name}.exe`);
  await fs.writeFile(exe, bytes);
  const emulated = emulate(bytes);
  const native = await runNative(exe);
  out.push({ name, exe, bytes: bytes.length, emulated, native });
}

await fs.writeFile(path.join(dir, 'opengl-c-regression.json'), JSON.stringify(out, null, 2));
oldLog(JSON.stringify(out.map(r => ({
  name: r.name,
  exe: r.exe,
  bytes: r.bytes,
  emulated: {
    msg: r.emulated.msg,
    reason: r.emulated.reason,
    halted: r.emulated.halted,
    steps: r.emulated.steps,
    draws: r.emulated.draws,
    glTail: r.emulated.glTail
  },
  native: r.native
})), null, 2));

function emulate(bytes) {
  const lines = [];
  const windows = [];
  const draws = [];
  const win = {
    print: x => lines.push(String(x)),
    openWindow: (title, body) => windows.push({ title, body }),
    draw: op => draws.push(op)
  };
  const result = emulatePortableExecutable(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), win);
  return {
    msg: result.message,
    reason: result.runtime?.reason || null,
    halted: result.runtime?.halted,
    steps: result.runtime?.steps,
    windows: windows.length,
    draws: draws.length,
    glTail: lines.filter(x => /OpenGL|gl/.test(x)).slice(-10),
    tail: lines.slice(-8)
  };
}

function runNative(exe) {
  return new Promise(resolve => {
    const child = spawn(path.resolve(exe), [], { windowsHide: false });
    let stdout = '';
    let stderr = '';
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      try { child.kill(); } catch {}
    }, 2500);
    child.stdout?.on('data', d => { stdout += d.toString(); });
    child.stderr?.on('data', d => { stderr += d.toString(); });
    child.on('error', error => {
      clearTimeout(timer);
      resolve({ ok: false, error: error.message, killed, stdout, stderr });
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      resolve({ ok: code === 0 || killed, code, signal, killed, stdout, stderr });
    });
  });
}

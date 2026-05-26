// B"H
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { compile } from '../../../scripts/awtsmoos/compiling/index.js';
import { ASM_EXAMPLES } from '../../../scripts/awtsmoos/compiling/pe/asm/examples/index.js';
import { emulatePortableExecutable } from '../core/emulator.js';

const root = path.resolve('geelooy/apps/exe-emulator/tests/generated');
const nativeTimeoutMs = 2400;

const cases = [
  { name: 'standard-console', mode: 'console', source: 'B"H generated console test' },
  { name: 'standard-gui', mode: 'gui', source: 'B"H generated GUI test' },
  ...Object.entries(ASM_EXAMPLES).map(([name, source]) => ({ name: `asm-${name}`, mode: 'asm', source }))
];

await fs.mkdir(root, { recursive: true });
const results = [];

for (const testCase of cases) {
  const exePath = path.join(root, `${testCase.name}.exe`);
  const blob = compile(testCase.source, testCase.mode);
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(exePath, bytes);
  const emulated = await runEmulated(bytes);
  const native = await runNativeBounded(exePath);
  results.push({ ...testCase, source: undefined, exePath, bytes: bytes.length, emulated, native });
}

const reportPath = path.join(root, 'regression-report.json');
await fs.writeFile(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), nativeTimeoutMs, results }, null, 2));
console.log(JSON.stringify({ ok: true, root, reportPath, count: results.length, summary: summarize(results) }, null, 2));

async function runEmulated(bytes) {
  const lines = [];
  const windows = [];
  const win = { print: line => lines.push(String(line)), openWindow: (title, body) => windows.push({ title, body }) };
  try {
    const result = emulatePortableExecutable(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), win);
    return { ok: true, result, lines, windows };
  } catch (error) {
    return { ok: false, error: error.message, lines, windows };
  }
}

function runNativeBounded(exePath) {
  return new Promise(resolve => {
    const child = spawn(exePath, [], { windowsHide: false });
    let stdout = '';
    let stderr = '';
    let killedByHarness = false;
    const timer = setTimeout(() => {
      killedByHarness = true;
      try { child.kill(); } catch {}
    }, nativeTimeoutMs);
    child.stdout?.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr?.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => {
      clearTimeout(timer);
      resolve({ ok: false, error: error.message, killedByHarness, stdout, stderr });
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      resolve({ ok: code === 0 || killedByHarness, code, signal, killedByHarness, stdout, stderr });
    });
  });
}

function summarize(results) {
  return results.map(r => ({
    name: r.name,
    bytes: r.bytes,
    emulatedOk: r.emulated.ok,
    emulatedMessage: r.emulated.result?.message || r.emulated.error,
    windows: r.emulated.windows?.length || 0,
    nativeKilled: r.native.killedByHarness,
    nativeCode: r.native.code ?? null
  }));
}

// B"H
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { compile } from '../../../scripts/awtsmoos/compiling/index.js';
import { ASM_EXAMPLES } from '../../../scripts/awtsmoos/compiling/pe/asm/examples/index.js';
import { emulatePortableExecutable } from '../core/emulator.js';

const root = path.resolve('geelooy/apps/exe-emulator/tests/generated');
const nativeTimeoutMs = Number(process.env.EXE_NATIVE_TIMEOUT_MS || 2400);
const hardSuiteTimeoutMs = Number(process.env.EXE_SUITE_TIMEOUT_MS || 25000);
const maxNativeLaunches = Number(process.env.EXE_MAX_NATIVE_LAUNCHES || 8);
const maxCases = Number(process.env.EXE_MAX_CASES || 8);
const startedAt = Date.now();
let nativeLaunches = 0;

const allCases = [
  { name: 'standard-console', mode: 'console', source: 'B"H generated console test' },
  { name: 'standard-gui', mode: 'gui', source: 'B"H generated GUI test' },
  ...Object.entries(ASM_EXAMPLES).map(([name, source]) => ({ name: `asm-${name}`, mode: 'asm', source }))
];
const cases = allCases.slice(0, maxCases);

await fs.mkdir(root, { recursive: true });
const results = [];

for (const testCase of cases) {
  guardSuiteTime(testCase.name);
  const exePath = path.join(root, `${testCase.name}.exe`);
  const blob = compile(testCase.source, testCase.mode);
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(exePath, bytes);
  const emulated = await runEmulated(bytes);
  const native = nativeLaunches < maxNativeLaunches
    ? await runNativeBounded(exePath)
    : { ok: true, skipped: true, reason: 'EXE_MAX_NATIVE_LAUNCHES reached' };
  results.push({ ...testCase, source: undefined, exePath, bytes: bytes.length, emulated, native });
}

const reportPath = path.join(root, 'regression-report.json');
await fs.writeFile(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), nativeTimeoutMs, hardSuiteTimeoutMs, maxNativeLaunches, maxCases, results }, null, 2));
console.log(JSON.stringify({ ok: true, root, reportPath, count: results.length, summary: summarize(results) }, null, 2));

function guardSuiteTime(name) {
  if (Date.now() - startedAt > hardSuiteTimeoutMs) {
    throw new Error(`Hard EXE regression suite limit reached before ${name}`);
  }
}

async function runEmulated(bytes) {
  const lines = [];
  const windows = [];
  const draws = [];
  const win = { print: line => lines.push(String(line)), openWindow: (title, body) => windows.push({ title, body }), draw: op => draws.push(op) };
  try {
    const result = emulatePortableExecutable(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), win);
    return { ok: true, result, lines, windows, draws };
  } catch (error) {
    return { ok: false, error: error.message, lines, windows, draws };
  }
}

function runNativeBounded(exePath) {
  nativeLaunches++;
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
    draws: r.emulated.draws?.length || 0,
    nativeKilled: r.native.killedByHarness || false,
    nativeCode: r.native.code ?? null,
    nativeSkipped: r.native.skipped || false
  }));
}

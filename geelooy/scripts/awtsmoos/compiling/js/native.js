// B"H
// Merkava JS→Native runner: JS source -> C (transpile.js) -> x86_64 ELF
// (self-hosted Awtsmoos C compiler) -> execute -> parsed integer result.
//
// The compiled binary is real machine code: no interpreter, no type guards,
// no GC write barriers. Compile once, run many times for benchmarking.

import { execFileSync } from "child_process";
import { chmodSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { compilePortableCProgram } from "../native/c/compiler.js";
import { transpileJsToC } from "./transpile.js";

const WORK = join(tmpdir(), "merkava-js-native");
mkdirSync(WORK, { recursive: true });
let counter = 0;

/**
 * Compile JS to a native binary.
 * @returns {{path, c, compileMs}}
 */
export async function compileJsToNative(jsSource, entryCall) {
  const t0 = Date.now();
  const { c } = await transpileJsToC(jsSource, entryCall);
  const out = await compilePortableCProgram(c, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const id = `k${process.pid}_${counter++}`;
  const path = join(WORK, id);
  writeFileSync(path, Buffer.from(out.bytes));
  chmodSync(path, 0o755);
  return { path, c, compileMs };
}

/**
 * Run a compiled binary, parse its stdout as a signed integer.
 * @returns {{value, runMs}}
 */
export function runNativeBinary(path) {
  const t0 = process.hrtime.bigint();
  const stdout = execFileSync(path, { encoding: "utf8", timeout: 120000 });
  const runMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const value = parseInt(stdout.trim(), 10);
  if (!Number.isFinite(value)) throw new Error(`jsNative: unparsable output ${JSON.stringify(stdout)}`);
  return { value, runMs };
}

/**
 * One-shot: compile JS and run it natively.
 * @returns {{value, c, compileMs, runMs}}
 */
export async function runJsNatively(jsSource, entryCall) {
  const compiled = await compileJsToNative(jsSource, entryCall);
  const ran = runNativeBinary(compiled.path);
  return { value: ran.value, c: compiled.c, compileMs: compiled.compileMs, runMs: ran.runMs };
}

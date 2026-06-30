// B"H
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const here = path.dirname(new URL(import.meta.url).pathname);

/**
 * Manifest validator and legacy external-compiler launcher.
 *
 * This file is intentionally honest: it is NOT the pure-JS C compiler demanded
 * by the 50ms vessel.  It may describe the platform command, but it refuses to
 * execute clang/gcc/cl unless AWTS_ALLOW_EXTERNAL_CC=1 is explicitly set.
 */
export function buildAddon(manifestPath, options = {}) {
  const manifest = readJson(manifestPath);
  const root = path.resolve(path.dirname(manifestPath), manifest.root || '.');
  const out = path.resolve(root, manifest.output || 'awtai_native.node');
  const target = options.target || process.env.AWTS_NATIVE_TARGET || os.platform();
  const sources = checkedSources(root, manifest.sources || []);
  const command = commandFor(root, out, sources, manifest, target);
  const report = { ok: true, mode: 'external-cc-policy', target, cwd: root, output: out, ...command,
    allowed: externalAllowed(), pureJsCompiler: false };
  if (options.dryRun || process.env.AWTS_NATIVE_DRY_RUN === '1') { console.log(JSON.stringify(report, null, 2)); return out; }
  if (!externalAllowed()) throw new Error("B'H external native compiler forbidden; set AWTS_ALLOW_EXTERNAL_CC=1 only for legacy rebuilds");
  const result = spawnSync(command.cc, command.args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`B'H native build failed with ${command.cc}`);
  console.log(`B"H built ${out}`);
  return out;
}

function externalAllowed() {
  return /^(1|true|yes)$/.test(String(process.env.AWTS_ALLOW_EXTERNAL_CC || '0'));
}

function commandFor(root, out, sources, manifest, target) {
  const cc = process.env.CC || manifest.compiler || defaultCompiler(target);
  return target === 'win32' ? windowsCommand(root, out, sources, manifest, cc)
    : unixCommand(root, out, sources, manifest, cc, target);
}

function unixCommand(root, out, sources, manifest, cc, target) {
  const common = ['-O3', '-pthread', '-DNAPI_VERSION=10', '-I', nodeIncludeDir()];
  const platform = target === 'darwin' ? ['-bundle', '-undefined', 'dynamic_lookup'] : ['-shared', '-fPIC'];
  const libs = target === 'linux' ? ['-lm'] : [];
  return { cc, args: [...common, ...includeArgs(root, manifest, '-I'), ...platform, '-o', out, ...sources, ...libs] };
}

function windowsCommand(root, out, sources, manifest, cc) {
  const lower = path.basename(cc).toLowerCase();
  if (lower === 'cl' || lower === 'cl.exe' || lower.includes('clang-cl')) {
    return { cc, args: ['/nologo', '/O2', '/LD', '/DNAPI_VERSION=10', `/I${nodeIncludeDir()}`,
      ...includeArgs(root, manifest, '/I'), ...sources, 'node.lib', `/Fe:${out}`, '/link', `/LIBPATH:${nodeLibDir()}`] };
  }
  return { cc, args: ['-O3', '-DNAPI_VERSION=10', '-I', nodeIncludeDir(), ...includeArgs(root, manifest, '-I'),
    '-shared', '-o', out, ...sources, '-L', nodeLibDir(), '-lnode'] };
}

function defaultCompiler(target) { return target === 'win32' ? 'cl' : 'clang'; }

function includeArgs(root, manifest, flag) {
  return (manifest.includeDirs || []).flatMap(dir => {
    const full = path.resolve(root, dir);
    if (!inside(full, root)) throw new Error(`B'H include escaped root ${dir}`);
    return flag.startsWith('/') ? [`${flag}${full}`] : [flag, full];
  });
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function checkedSources(root, sources) {
  return sources.map(source => {
    if (!source.endsWith('.c')) throw new Error(`B'H refusing non-C source ${source}`);
    const full = path.resolve(root, source);
    if (!inside(full, root)) throw new Error(`B'H source escaped root ${source}`);
    if (!fs.existsSync(full)) throw new Error(`B'H missing source ${source}`);
    return source;
  });
}

function nodeIncludeDir() {
  const inc = path.join(nodeRoot(), 'include', 'node');
  if (!fs.existsSync(inc)) throw new Error(`B'H Node headers not found: ${inc}`);
  return inc;
}
function nodeLibDir() { const root = nodeRoot(); return [path.join(root, 'lib'), root].find(fs.existsSync) || root; }
function nodeRoot() { return path.dirname(path.dirname(process.env.NODE_BIN || process.execPath)); }
function inside(file, root) { const rel = path.relative(root, file); return rel && !rel.startsWith('..') && !path.isAbsolute(rel); }

function cliOptions(argv) {
  const dryRun = argv.includes('--dry-run');
  const targetAt = argv.indexOf('--target');
  const target = targetAt >= 0 ? argv[targetAt + 1] : undefined;
  const manifest = argv.find(arg => arg && !arg.startsWith('--')) || path.join(here, 'build-manifest.json');
  return { manifest, dryRun, target };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { manifest, dryRun, target } = cliOptions(process.argv.slice(2));
  buildAddon(path.resolve(manifest), { dryRun, target });
}

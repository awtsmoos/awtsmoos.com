// B"H
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const here = path.dirname(new URL(import.meta.url).pathname);

/**
 * B"H
 * Repo-owned raw C addon builder. No CMake, no package build ritual, no hidden
 * native dependency caravan. The manifest names `.c` files inside the repo;
 * this script shapes the platform compiler command at the instant of need.
 */
export function buildAddon(manifestPath, options = {}) {
  const manifest = readJson(manifestPath);
  const root = path.resolve(path.dirname(manifestPath), manifest.root || '.');
  const out = path.resolve(root, manifest.output || 'awtai_native.node');
  const target = options.target || process.env.AWTS_NATIVE_TARGET || os.platform();
  const sources = checkedSources(root, manifest.sources || []);
  const command = commandFor(root, out, sources, manifest, target);
  if (options.dryRun || process.env.AWTS_NATIVE_DRY_RUN === '1') {
    console.log(JSON.stringify({ target, cwd: root, ...command }, null, 2));
    return out;
  }
  const result = spawnSync(command.cc, command.args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`B'H native build failed with ${command.cc}`);
  console.log(`B"H built ${out}`);
  return out;
}

function commandFor(root, out, sources, manifest, target) {
  const cc = process.env.CC || manifest.compiler || defaultCompiler(target);
  if (target === 'win32') return windowsCommand(root, out, sources, manifest, cc);
  return unixCommand(root, out, sources, manifest, cc, target);
}

function unixCommand(root, out, sources, manifest, cc, target) {
  const common = ['-O3', '-pthread', '-DNAPI_VERSION=10', '-I', nodeIncludeDir()];
  const platform = target === 'darwin'
    ? ['-bundle', '-undefined', 'dynamic_lookup']
    : ['-shared', '-fPIC'];
  const includes = includeArgs(root, manifest, '-I');
  const libs = target === 'linux' ? ['-lm'] : [];
  return { cc, args: [...common, ...includes, ...platform, '-o', out, ...sources, ...libs] };
}

function windowsCommand(root, out, sources, manifest, cc) {
  const lower = path.basename(cc).toLowerCase();
  if (lower === 'cl' || lower === 'cl.exe' || lower.includes('clang-cl')) {
    const includes = includeArgs(root, manifest, '/I');
    return {
      cc,
      args: [
        '/nologo', '/O2', '/LD', '/DNAPI_VERSION=10', `/I${nodeIncludeDir()}`,
        ...includes, ...sources, `node.lib`, `/Fe:${out}`, '/link', `/LIBPATH:${nodeLibDir()}`
      ]
    };
  }
  const includes = includeArgs(root, manifest, '-I');
  return {
    cc,
    args: ['-O3', '-DNAPI_VERSION=10', '-I', nodeIncludeDir(), ...includes, '-shared', '-o', out, ...sources, '-L', nodeLibDir(), '-lnode']
  };
}

function defaultCompiler(target) {
  if (target === 'win32') return 'cl';
  return 'clang';
}

function includeArgs(root, manifest, flag) {
  return (manifest.includeDirs || []).flatMap(dir => {
    const full = path.resolve(root, dir);
    if (!inside(full, root)) throw new Error(`B'H include escaped root ${dir}`);
    return flag.startsWith('/') ? [`${flag}${full}`] : [flag, full];
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

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

function nodeLibDir() {
  const root = nodeRoot();
  const candidates = [path.join(root, 'lib'), root];
  return candidates.find(dir => fs.existsSync(dir)) || root;
}

function nodeRoot() {
  const bin = process.env.NODE_BIN || process.execPath;
  return path.dirname(path.dirname(bin));
}

function inside(file, root) {
  const rel = path.relative(root, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

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

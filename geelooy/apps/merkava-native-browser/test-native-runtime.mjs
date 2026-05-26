// B"H
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');

function run(args) {
  try {
    const stdout = execFileSync(exe, args, { cwd: dist, encoding: 'utf8', timeout: 15000 });
    return { ok: true, code: 0, stdout };
  } catch (error) {
    return { ok: false, code: error.status ?? -1, stdout: error.stdout?.toString() || '', stderr: error.stderr?.toString() || '', message: error.message };
  }
}

function assertIncludes(name, text, needle) {
  if (!text.includes(needle)) throw new Error(`${name} missing ${needle}\n${text}`);
}

const cases = [];

cases.push(['help', run(['--help']), out => {
  assertIncludes('help', out.stdout, 'Usage:');
  assertIncludes('help', out.stdout, '--check file.js');
  assertIncludes('help', out.stdout, 'Native navigation:');
}]);

cases.push(['version', run(['--version']), out => {
  assertIncludes('version', out.stdout, 'merkavaapp native 0.5.0');
}]);

cases.push(['bytecode-check', run(['--check', 'sample.merkava']), out => {
  assertIncludes('bytecode-check', out.stdout, 'ok=1');
}]);

cases.push(['js-check', run(['--check', '..\\samples\\app.js']), out => {
  assertIncludes('js-check', out.stdout, 'B\'H Merkava JS analyzer');
  assertIncludes('js-check', out.stdout, 'webgl=');
  assertIncludes('js-check', out.stdout, 'webgl-command-table:');
  assertIncludes('js-check', out.stdout, 'native-c-vm=partial');
}]);

cases.push(['html-check', run(['--check', '..\\samples\\frontend.html']), out => {
  assertIncludes('html-check', out.stdout, 'B\'H Merkava HTML analyzer');
  assertIncludes('html-check', out.stdout, 'canvasTags=1');
}]);

cases.push(['native-fs-pattern-executor', run(['..\\samples\\fs-native.js']), out => {
  assertIncludes('native-fs-pattern-executor', out.stdout, 'native-fs-runtime=active');
  assertIncludes('native-fs-pattern-executor', out.stdout, 'fs.existsSync(../samples/app.js)=true');
  assertIncludes('native-fs-pattern-executor', out.stdout, 'fs.readFileSync(../samples/app.js).bytes=506');
  assertIncludes('native-fs-pattern-executor', out.stdout, 'fs.statSync(../samples/app.js).size=506');
  assertIncludes('native-fs-pattern-executor', out.stdout, 'fs.readdirSync(../samples)=');
}]);

cases.push(['native-webgl-command-table', run(['--check', '..\\samples\\webgl-native.html']), out => {
  assertIncludes('native-webgl-command-table', out.stdout, 'webgl-command-table: viewport=1 clearColor=1 clear=1 drawArrays=1');
  assertIncludes('native-webgl-command-table', out.stdout, 'webgl-status=command-table-plus-opengl-smoke');
}]);

cases.push(['node-server-refuses-fake-success', run(['..\\samples\\server.js']), out => {
  if (out.code !== 7) throw new Error(`expected exit 7 for unsupported native node server, got ${out.code}`);
  assertIncludes('node-server-refuses-fake-success', out.stdout, 'node-core-detected=true');
  assertIncludes('node-server-refuses-fake-success', out.stdout, 'refusing to fake success');
}]);

cases.push(['index-navigation-renders-executor-stream', run(['--nav-test', '/index.html']), out => {
  assertIncludes('index-navigation-renders-executor-stream', out.stdout, 'pageKind=merkava-executor-render-stream');
  assertIncludes('index-navigation-renders-executor-stream', out.stdout, 'pageTitle=/index.html');
  assertIncludes('index-navigation-renders-executor-stream', out.stdout, 'status=loaded MerkavaExecutor render stream: /index.html');
  assertIncludes('index-navigation-renders-executor-stream', out.stdout, 'domCount=0');
}]);

cases.push(['address-hitbox-aligns-with-rendered-bar', run(['--hit-test', '960', '540', '175', '45']), out => {
  assertIncludes('address-hitbox-aligns-with-rendered-bar', out.stdout, 'address=1');
  assertIncludes('address-hitbox-aligns-with-rendered-bar', out.stdout, 'left=170');
  assertIncludes('address-hitbox-aligns-with-rendered-bar', out.stdout, 'right=900');
  assertIncludes('address-hitbox-aligns-with-rendered-bar', out.stdout, 'top=36');
  assertIncludes('address-hitbox-aligns-with-rendered-bar', out.stdout, 'bottom=64');
}]);

cases.push(['local-html-does-not-use-c-dom-fallback', run(['--nav-test', '..\\samples\\frontend.html']), out => {
  assertIncludes('local-html-does-not-use-c-dom-fallback', out.stdout, 'pageKind=file');
  assertIncludes('local-html-does-not-use-c-dom-fallback', out.stdout, 'domCount=0');
  assertIncludes('local-html-does-not-use-c-dom-fallback', out.stdout, 'canvas=-1');
  assertIncludes('local-html-does-not-use-c-dom-fallback', out.stdout, 'waiting for MerkavaExecutor render ops');
}]);

cases.push(['browser-shell-smoke', run(['--smoke']), out => {
  assertIncludes('browser-shell-smoke', out.stdout, 'B\'H Merkava Native Browser');
  assertIncludes('browser-shell-smoke', out.stdout, 'bytecode=embedded_executor.merkava');
  assertIncludes('browser-shell-smoke', out.stdout, 'browser-shell=browser-shell.html browser-shell.js');
  assertIncludes('browser-shell-smoke', out.stdout, 'navigation=type-address-enter');
  assertIncludes('browser-shell-smoke', out.stdout, 'loaded MerkavaExecutor render stream: /index.html');
  assertIncludes('browser-shell-smoke', out.stdout, 'opengl_renderer=');
  assertIncludes('browser-shell-smoke', out.stdout, 'browser-shell=drawn');
  assertIncludes('browser-shell-smoke', out.stdout, 'mode=smoke');
}]);

const results = [];
for (const [name, result, verify] of cases) {
  try {
    verify(result);
    results.push({ name, ok: true, code: result.code, preview: result.stdout.slice(0, 300) });
  } catch (error) {
    results.push({ name, ok: false, code: result.code, error: error.message, stdout: result.stdout, stderr: result.stderr });
  }
}

const failed = results.filter(x => !x.ok);
console.log(JSON.stringify({ ok: failed.length === 0, total: results.length, failed: failed.map(x => x.name), results }, null, 2));
if (failed.length) process.exit(1);

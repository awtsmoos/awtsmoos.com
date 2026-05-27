// B"H
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const url = process.argv[2] || 'http://localhost:8080';

function assertHas(text, needle) {
  if (!text.includes(needle)) throw new Error(`missing ${needle}\n${text}`);
}

function assertNotHas(text, needle) {
  if (text.includes(needle)) throw new Error(`forbidden ${needle}\n${text}`);
}

const stdout = execFileSync(exe, ['--render-test', url], {
  cwd: dist,
  encoding: 'utf8',
  timeout: 25000
});

assertHas(stdout, `render-test-start url=${url}`);
assertHas(stdout, 'awts-executor-compile-ok');
assertHas(stdout, 'dom=executor-owned');
assertHas(stdout, 'cHost=native-bindings-only');
assertHas(stdout, 'route=network-executor-render-stream reason=merkava-executor-compiled-html');
assertHas(stdout, 'pageKind=network-executor-render-stream');
assertHas(stdout, 'awts-render-decision route=executor-stream result=drawn');
assertHas(stdout, 'awts-opengl-render-stream-draw source=network-executor-render-stream');
assertHas(stdout, 'glError=0');
assertNotHas(stdout, 'pageKind=network-html-dynamic');
assertNotHas(stdout, 'route=dynamic-network result=drawn source=network-fetched');
assertNotHas(stdout, 'preview=Awtsmoos |');
assertNotHas(stdout, 'console.log');
assertNotHas(stdout, 'onclick');
assertNotHas(stdout, 'function ');
assertNotHas(stdout, 'import(');
assertNotHas(stdout, '�');

console.log(JSON.stringify({ ok: true, kind: 'live-localhost-executor-render', url, stdout }, null, 2));

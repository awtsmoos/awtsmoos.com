// B"H
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');

const stdout = execFileSync(exe, ['--render-test', '/index.html'], {
  cwd: dist,
  encoding: 'utf8',
  timeout: 20000
});

function assertHas(needle) {
  if (!stdout.includes(needle)) throw new Error(`missing ${needle}\n${stdout}`);
}

assertHas('awts-bytecode-load target=sample.merkava');
assertHas('pageKind=merkava-executor-render-stream');
assertHas('opengl_renderer=');
assertHas('awts-render-decision route=executor-stream result=drawn');
assertHas('awts-opengl-webgl-draw source=merkava-bytecode-render-stream');
assertHas('glError=0');
assertHas('render-test-end frames=8');

console.log(JSON.stringify({ ok: true, kind: 'embedded-merkava-stream-opengl', stdout }, null, 2));

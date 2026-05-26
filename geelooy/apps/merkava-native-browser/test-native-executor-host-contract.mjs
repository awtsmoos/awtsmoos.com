// B"H
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');

function assertHas(text, needle) {
  if (!text.includes(needle)) throw new Error(`missing ${needle}\n${text}`);
}

function assertNotHas(text, needle) {
  if (text.includes(needle)) throw new Error(`forbidden ${needle}\n${text}`);
}

const stdout = execFileSync(exe, ['--bytecode-vm-test', 'embedded_executor.merkava'], {
  cwd: dist,
  encoding: 'utf8',
  timeout: 15000
});

for (const needle of [
  'bytecode-vm-test ok=1',
  'mode=embedded-executor-host',
  'hostBindings=36',
  'awts-executor-host-bindings count=36',
  'awts-host-binding[0]=window.createWindow',
  'awts-host-binding[12]=network.fetch',
  'awts-host-binding[17]=webgl.createContext',
  'awts-host-binding[29]=webgl.drawArrays',
  'dom=executor-owned',
  'cHost=native-bindings-only'
]) assertHas(stdout, needle);

for (const forbidden of [
  'executed Merkava bytecode header',
  'native DOM renderer',
  'waiting for MerkavaExecutor'
]) assertNotHas(stdout, forbidden);

console.log(JSON.stringify({ ok: true, contract: 'embedded-executor-host', checkedBindings: 36, stdout }, null, 2));

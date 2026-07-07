import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const files = [
  'geelooy/style/social/home/mobile/viewport.css',
  'geelooy/style/social/home/mobile/overflow-guards.css',
  'geelooy/style/social/home/mobile/dock-clearance.css',
  'geelooy/style/social/home/dock/shell.css'
];
const text = files.map(path => readFileSync(join(root, path), 'utf8')).join('\n');
for (const token of ['overflow-x: hidden', 'max-width: 100vw', 'min-width: 0', 'env(safe-area-inset-bottom)', 'position: fixed']) {
  if (!text.includes(token)) throw new Error(`missing mobile overflow/safe-area rule: ${token}`);
}
console.log('homeMobileNoOverflow: ok');

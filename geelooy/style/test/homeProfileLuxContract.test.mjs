import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const home = read('geelooy/style/social/home/index.css');
const profile = read('geelooy/style/social/profile/index.css');
if (!home.includes('./lux/index.css')) throw new Error('home lux layer missing');
if (!profile.includes('./lux/index.css')) throw new Error('profile lux layer missing');
for (const p of ['geelooy/style/social/home/lux/edge-light.css','geelooy/style/social/home/lux/hero-lux.css','geelooy/style/social/profile/lux/surface-lux.css','geelooy/style/social/profile/lux/dock-lux.css']) {
  if (!existsSync(join(root, p))) throw new Error(`missing lux file ${p}`);
}
const text = [
  read('geelooy/style/social/home/lux/edge-light.css'),
  read('geelooy/style/social/home/lux/micro-motion.css'),
  read('geelooy/style/social/profile/lux/surface-lux.css')
].join('\n');
for (const token of ['inset', 'translate3d', 'backface-visibility', 'rgba(139,92,246']) {
  if (!text.includes(token)) throw new Error(`missing lux token ${token}`);
}
if (/backdrop-filter|filter:\s*blur/.test(text)) throw new Error('lux layer has heavy blur filter');
console.log('homeProfileLuxContract: ok');

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const homeIndex = read('geelooy/style/social/home/index.css');
const profileIndex = read('geelooy/style/social/profile/index.css');
if (!homeIndex.includes('./fit/index.css')) throw new Error('home fit layer not imported');
if (!profileIndex.includes('./fit/index.css')) throw new Error('profile fit layer not imported');
for (const p of ['geelooy/style/social/home/fit/dock-fit.css','geelooy/style/social/home/fit/feed-fit.css','geelooy/style/social/profile/fit/dock-fit.css','geelooy/style/social/profile/fit/panel-fit.css']) {
  if (!existsSync(join(root, p))) throw new Error(`missing fit file ${p}`);
}
const text = [
  read('geelooy/style/social/home/fit/dock-fit.css'),
  read('geelooy/style/social/home/fit/feed-fit.css'),
  read('geelooy/style/social/profile/fit/dock-fit.css'),
  read('geelooy/style/social/profile/fit/panel-fit.css')
].join('\n');
for (const token of ['max-width: calc(100vw - 1.1rem)', 'min-width: 0', 'contain: layout paint', '@media (max-width: 430px)']) {
  if (!text.includes(token)) throw new Error(`missing fit token ${token}`);
}
console.log('homeProfileFitContract: ok');

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const indexCss = read('geelooy/style/social/profile/index.css').trim();
const shield = read('geelooy/style/social/profile/repair/legacy-shield.css');
const hero = read('geelooy/style/social/profile/repair/hero.css');
const dock = read('geelooy/style/social/profile/repair/dock.css');
if (!indexCss.includes('@import "./repair/index.css";\n@import "./fit/index.css";\n@import "./lux/index.css";')) {
  throw new Error('profile repair, fit, and lux layers must be final imports in that order');
}
for (const file of ['tokens.css','legacy-shield.css','shell.css','hero.css','controls.css','tabs.css','panels.css','dock.css','mobile.css']) {
  if (!existsSync(join(root, 'geelooy/style/social/profile/repair', file))) throw new Error(`missing profile repair module ${file}`);
}
for (const token of ['awtsmoosificationalisticaticalism','sidebarMitzvah','menuBtn','aliasSelector','curAlias']) {
  if (!shield.includes(token)) throw new Error(`profile shield missing ${token}`);
}
for (const token of ['#8b5cf6','#9a4dff','#2ea7ff','linear-gradient']) {
  if (!(hero + dock).includes(token)) throw new Error(`profile repair missing palette token ${token}`);
}
console.log('profileRepairContract: ok');

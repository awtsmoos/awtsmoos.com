import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const index = readFileSync(join(root, 'geelooy/index.html'), 'utf8');
const shield = ['hide-old-header.css','hide-old-sidebar.css','alias-chip-reset.css','menu-reset.css']
  .map(file => readFileSync(join(root, 'geelooy/style/social/home/legacy-shield', file), 'utf8')).join('\n');
if (index.includes('nav/page.html')) throw new Error('home still uses legacy nav/page wrapper');
for (const token of ['awtsmoosificationalisticaticalism', 'sidebarMitzvah', 'aliasSelector', 'menuBtn']) {
  if (!shield.includes(token)) throw new Error(`legacy shield missing ${token}`);
}
console.log('homeNoLegacyHeader: ok');

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const index = read('geelooy/index.html');
const css = read('geelooy/style/social/home/index.css');
const required = [
  'home-dashboard-shell', 'home-mobile-topbar', 'home-hero-panel', 'home-command-search',
  'home-action-grid', 'home-dashboard-grid', 'home-feed-panel', 'home-discovery-grid',
  'home-command-dock', 'scripts/awtsmoos/social/home/dashboard/index.js'
];
for (const token of required) {
  if (!index.includes(token)) throw new Error(`missing home dashboard token: ${token}`);
}
for (const folder of ['dashboard','search','actions','feed','states','dock','mobile','desktop','legacy-shield']) {
  if (!css.includes(`./${folder}/index.css`)) throw new Error(`home CSS does not import ${folder}`);
}
if (!existsSync(join(root, 'geelooy/scripts/awtsmoos/social/home/dashboard/boot.js'))) {
  throw new Error('missing split home dashboard JS boot module');
}
console.log('homeDashboardContract: ok');

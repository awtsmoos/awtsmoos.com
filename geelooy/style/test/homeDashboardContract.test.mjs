import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const index = read('geelooy/index.html');
const css = read('geelooy/style/social/home/index.css');
const required = [
  'home-dashboard-shell', 'home-app-header', 'home-orb-logo', 'home-bell-button',
  'Create. Share.', 'Elevate.', 'home-action-grid', 'home-feed-panel', 'home-crystal',
  'home-glance-panel', 'home-activity-panel', 'home-command-dock',
  'scripts/awtsmoos/social/home/dashboard/index.js'
];
for (const token of required) {
  if (!index.includes(token)) throw new Error(`missing image-matched home token: ${token}`);
}
for (const folder of ['dashboard','top-shell','search','actions','feed','states','dock','mobile','desktop','legacy-shield','future','finish']) {
  if (!css.includes(`./${folder}/index.css`)) throw new Error(`home CSS does not import ${folder}`);
}
if (!existsSync(join(root, 'geelooy/scripts/awtsmoos/social/home/dashboard/boot.js'))) {
  throw new Error('missing split home dashboard JS boot module');
}
console.log('homeDashboardContract: ok');

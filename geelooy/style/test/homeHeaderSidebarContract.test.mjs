import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const index = read('geelooy/index.html');
const css = read('geelooy/style/social/home/index.css');
const js = read('geelooy/scripts/awtsmoos/social/home/dashboard/boot.js');
for (const token of ['home-app-header','home-bell-button','home-orb-brand','home-brand-copy','data-home-sidebar','Home</a>','Mail</a>','Profile</a>']) {
  if (!index.includes(token)) throw new Error(`missing image header/sidebar token: ${token}`);
}
if (!css.includes('./top-shell/index.css')) throw new Error('top-shell CSS not imported');
if (!existsSync(join(root, 'geelooy/scripts/awtsmoos/social/home/dashboard/sidebar.js'))) throw new Error('sidebar JS missing');
if (!js.includes('bindSidebar')) throw new Error('boot does not bind sidebar');
console.log('homeHeaderSidebarContract: ok');

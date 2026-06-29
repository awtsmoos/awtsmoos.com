// B"H
/** Chapter 517: focused covenant for the luminous home and Heichelos pass. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const homeCss = read('geelooy/style/social/home/index.css');
const homeStates = read('geelooy/style/social/home/civilization/states.css');
const homeMobile = read('geelooy/style/social/home/civilization/mobile-command.css');
const spaces = read('geelooy/heichelos/_awtsmoos.index.html');
const spacesCss = read('geelooy/style/heichelos/social-index.css');
const heichel = read('geelooy/heichelos/_awtsmoos.heichel.html');
const heichelCss = read('geelooy/style/heichelos/heichel/index.css');
const routeGate = read('geelooy/heichelos/_awtsmoos.derech.js');
const postRoutes = read('geelooy/api/social/_awtsmoos.posts.js');

for (const token of ['data-home-dashboard', 'data-home-empty-state', 'data-home-error-state', 'home-route-constellation', 'data-home-reduced-motion-safe']) assert.ok(home.includes(token), `home missing ${token}`);
for (const token of ['./civilization/states.css', './civilization/mobile-command.css']) assert.ok(homeCss.includes(token), `home css missing ${token}`);
for (const token of ['prefers-reduced-motion: reduce', ':focus-visible', '.home-state-card']) assert.ok(homeStates.includes(token), `home states css missing ${token}`);
for (const token of ['@media (max-width: 980px)', '@media (max-width: 560px)']) assert.ok(homeMobile.includes(token), `home mobile css missing ${token}`);
for (const token of ['data-heichelos-index', 'data-heichelos-empty-state', 'spaces-state-row', 'space-meta-line', 'Create Heichel']) assert.ok(spaces.includes(token), `spaces missing ${token}`);
for (const token of ['./spaces/civilization-board.css', '.social-spaces-shell', '.spaces-grid']) assert.ok(spacesCss.includes(token), `spaces css missing ${token}`);
for (const token of ['data-heichel-page', 'data-heichel-render-root', 'data-heichel-boot-state', 'heichel-boot-grid']) assert.ok(heichel.includes(token), `heichel shell missing ${token}`);
assert.ok(heichelCss.includes('../revamped-partials/heichel-boot-states.css'), 'heichel css entry missing boot states import');
assert.ok(routeGate.indexOf('"/submit"') < routeGate.indexOf('"/:heichel"'), 'global submit route must precede dynamic heichel route');
for (const file of ['geelooy/style/social/home/civilization/mobile-command.css', 'geelooy/style/heichelos/spaces/civilization-board.css', 'geelooy/api/social/helper/response/routeResponses.js']) assert.ok(existsSync(file), `${file} must exist`);
assert.ok(postRoutes.includes('methodNotAllowed'), 'posts route wrapper must use response-shape guard');
console.log('B"H homeHeichelosUpgradeStatic.test passed');

// B"H
/** Chapter 581: focused covenant for home, Heichelos, submit, and route safety. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const homeCss = read('geelooy/style/social/home/index.css');
const homeStates = read('geelooy/style/social/home/civilization/states.css');
const homePremium = read('geelooy/style/social/home/premium/index.css');
const premiumStates = read('geelooy/style/social/home/premium/states.css');
const spaces = read('geelooy/heichelos/_awtsmoos.index.html');
const heichel = read('geelooy/heichelos/_awtsmoos.heichel.html');
const submit = read('geelooy/heichelos/_awtsmoos.submitToHeichel.html');
const submitCss = read('geelooy/heichelos/heichel/submit/style.css');
const submitCore = read('geelooy/heichelos/heichel/submit/logic/core.js');
const heichelRoute = read('geelooy/api/social/_awtsmoos.heichel.js');
const localAccess = read('geelooy/os/session/localFileAccess.js');

for (const token of ['data-home-dashboard', 'data-home-empty-state', 'data-home-error-state', 'home-route-constellation', 'data-home-reduced-motion-safe']) assert.ok(home.includes(token), `home missing ${token}`);
for (const token of ['./civilization/states.css', './civilization/mobile-command.css']) assert.ok(homeCss.includes(token), `home css missing ${token}`);
for (const token of ['prefers-reduced-motion: reduce', ':focus-visible', '.home-state-card']) assert.ok(homeStates.includes(token), `home states css missing ${token}`);
for (const token of ['./polish.css', './states.css']) assert.ok(homePremium.includes(token), `premium index missing ${token}`);
for (const token of ['object-inspector-body:empty', 'prefers-reduced-motion: reduce', ':focus-visible']) assert.ok(premiumStates.includes(token), `premium states missing ${token}`);
for (const token of ['data-heichelos-index', 'data-heichelos-empty-state', 'spaces-state-row', 'Create Heichel']) assert.ok(spaces.includes(token), `spaces missing ${token}`);
for (const token of ['data-heichel-page', 'data-heichel-render-root', 'data-heichel-boot-state']) assert.ok(heichel.includes(token), `heichel shell missing ${token}`);
for (const id of ['title', 'aliasId', 'postId', 'contentType', 'mainContentEditor', 'sectionsArea', 'toolbarTemplate', 'sectionTemplate', 'subSectionTemplate', 'imageUploadModal', 'submitPost']) assert.ok(submit.includes(`id="${id}"`), `submit missing ${id}`);
for (const token of ['data-submit-console', 'data-submit-status-rail', '/heichelos/heichel/submit/style.css', '/heichelos/heichel/submit/script.js', 'section-id-input', 'generateSectionsFromBulk']) assert.ok(submit.includes(token), `submit missing ${token}`);
assert.equal((submit.match(/rel="stylesheet"/g) || []).length, 1, 'submit page should load one stylesheet');
for (const token of ['./style/heichelos/submit/mobile.css'.replace('./style', '/style'), '/style/heichelos/submit/actions.css', '/style/heichelos/submit/sections.css']) assert.ok(submitCss.includes(token), `submit css manifest missing ${token}`);
for (const token of ['getHeichelId', 'url.searchParams.get("heichel")', 'localStorage.getItem("lastAliasUsed")']) assert.ok(submitCore.includes(token), `submit core missing ${token}`);
for (const token of ['methodNotAllowed', 'makeHeichelRouteTools', 'OWNERSHIP_CHECK_FAILED']) assert.ok(heichelRoute.includes(token), `heichel route missing ${token}`);
for (const token of ['publishLocalFile', 'joinApiPath', "publicFileUrl({ alias, path:'', fileName:remotePath })"]) assert.ok(localAccess.includes(token), `local file access missing ${token}`);
for (const file of ['geelooy/style/heichelos/submit/index.css', 'geelooy/api/social/helper/heichelRoutes/routeTools.js', 'geelooy/api/social/helper/response/routeResponses.js']) assert.ok(existsSync(file), `${file} must exist`);
console.log('B"H homeHeichelosUpgradeStatic.test passed');

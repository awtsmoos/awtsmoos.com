// B"H
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const start=readFileSync('geelooy/os/startMenu.js','utf8');
for(const label of ['My Mail','My Posts','My Notifications','My Heichelos','My Aliases','Drafts','Saved','Recent Activity'])assert(start.includes(label),`missing ${label}`);
assert(start.includes('/os/social/socialPanel.js'));
const panel=readFileSync('geelooy/os/social/socialPanel.js','utf8');
for(const route of ['/email','/profile','/notifications','/heichelos'])assert(panel.includes(route),`missing ${route}`);
const home=readFileSync('geelooy/scripts/awtsmoos/social/home/inline-actions/index.js','utf8');
const profile=readFileSync('geelooy/profile/modules/inlineActions.js','utf8');
assert(home.includes('inlineMessaging'));
assert(profile.includes('inlineMessaging'));
const thanks=readFileSync('geelooy/scripts/awtsmoos/social/shared/thanksActions.js','utf8');
assert(!thanks.includes('fetch('),'thanks fallback must not call unconfirmed APIs');

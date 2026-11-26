// B"H — Awtsmoos.com tests the cascade, not a transient cache key.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const base='geelooy/style/social/profile/';
const imports=[...read(base+'index.css').matchAll(/@import\s+["']([^"']+)["']/g)].map(match=>match[1].split('?')[0]);
const ordered=['./repair/index.css','./fit/index.css','./click-safe.css','./unified.css','/style/geelooy-app/performance.css','./revelation/tokens.css','./revelation/layout.css','./revelation/navigation.css','./revelation/motion.css','./revelation/mobile.css'];
let previous=-1;
for(const name of ordered) {
	const index=imports.indexOf(name);
	assert.ok(index>previous,`Profile cascade order invalid: ${name}`);
	previous=index;
}
assert.equal(new Set(imports).size,imports.length,'Duplicate stylesheet imports');
for(const name of ['tokens','legacy-shield','shell','hero','controls','tabs','panels','dock','mobile']) {
	assert.ok(existsSync(base+'repair/'+name+'.css'),`Missing repair module ${name}`);
}
const shield=read(base+'repair/legacy-shield.css');
for(const token of ['awtsmoosificationalisticaticalism','sidebarMitzvah','menuBtn','aliasSelector','curAlias']) assert.ok(shield.includes(token),token);
const palette=read(base+'repair/hero.css')+read(base+'repair/dock.css');
for(const token of ['#8b5cf6','#9a4dff','#2ea7ff','linear-gradient']) assert.ok(palette.includes(token),token);
console.log('Profile semantic cascade order passed');

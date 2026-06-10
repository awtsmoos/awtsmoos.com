// B"H
/**
 * Chapter 95: the ancient Heichel series URL must never fall into invalid-route JSON.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const derech = readFileSync('geelooy/heichelos/_awtsmoos.derech.js', 'utf8');
const shell = readFileSync('geelooy/heichelos/heichel/_awtsmoos.heichel.html', 'utf8');
const fallbackShell = readFileSync('geelooy/heichelos/_awtsmoos.heichel.html', 'utf8');

for (const route of ['/:heichel/series/:series', '/:heichel/series/:series/index', '/:heichel']) {
  assert.ok(derech.includes(route), `missing route ${route}`);
}
assert.ok(derech.indexOf('/:heichel/series/:series') < derech.indexOf('/:heichel":'), 'series route must be registered before generic heichel route');
assert.ok(derech.includes('renderHeichelShell(vars.heichel)'), 'series route must render the heichel shell');
for (const file of [shell, fallbackShell]) {
  assert.ok(file.includes('/style/heichelos/heichel/index.css'), 'heichel shell must load split mobile css');
  assert.ok(file.includes('/heichelos/heichel/app.js'), 'heichel shell must keep the app entry');
}
console.log('B"H heichelRouteCompatibility.test passed');

//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos keeps the visible gate simple while every security covenant remains explicit and testable. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const template = fs.readFileSync('geelooy/login/index.html', 'utf8');
const adapter = fs.readFileSync('geelooy/login/styles/index.css', 'utf8');

assert.match(template, /Cache-Control.*no-store/);
assert.match(template, /action="\/login\/" method="POST"/);
for (const name of ['next', 'username', 'password']) {
	assert.match(template, new RegExp(`name="${name}"`));
}
assert.match(template, /session\/login\.js/);
assert.match(template, /handleLogin\(this\.request, \$_POST, server\.secret\)/);
assert.match(template, /awtsmoosKey=.*HttpOnly;.*Path=\/; SameSite=Lax; Secure/);
assert.match(template, /hostname === "awtsmoos\.com"/);
assert.match(template, /viewport-fit=cover/);
assert.match(template, /aria-live="polite"/);
assert.doesNotMatch(template, /social\/shell\/boot\.js/);
assert.match(adapter, /revelation-v4\/index\.css/);
assert.match(adapter, /style\/forms\.css/);
assert.ok(template.split(/\r?\n/).length <= 120, 'login template must remain modular');
console.log('B"H authSurfaceContract.test passed.');

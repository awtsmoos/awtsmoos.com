// B"H
/**
 * Chapter 81: profile CSS must be split, imported, and under the line limit.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const dir = 'geelooy/style/social/profile';
const entry = readFileSync(`${dir}/index.css`, 'utf8');
const required = ['tokens.css', 'shell.css', 'nav.css', 'hero.css', 'tabs.css', 'cards.css', 'comments.css', 'tree.css', 'templates.css', 'mobile.css'];

for (const file of required) {
  assert.ok(entry.includes(`./${file}`), `index.css must import ${file}`);
  const source = readFileSync(`${dir}/${file}`, 'utf8');
  assert.ok(source.split('\n').length <= 150, `${file} must stay under 150 lines`);
}
assert.equal(existsSync('geelooy/style/social/public-profile.css'), false, 'old monolith css must be gone');
assert.deepEqual(readdirSync(dir).filter(name => name.endsWith('.css')).sort(), ['cards.css','comments.css','hero.css','index.css','mobile.css','nav.css','shell.css','tabs.css','templates.css','tokens.css','tree.css'].sort());
console.log('B"H profileCssSplit.test passed');

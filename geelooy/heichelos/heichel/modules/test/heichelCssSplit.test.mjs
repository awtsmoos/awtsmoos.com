// B"H
/**
 * Chapter 92: Heichel navigation CSS must be split and small.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const dir = 'geelooy/style/heichelos/heichel';
const files = ['index.css', 'tokens.css', 'shell.css', 'hero.css', 'tabs.css', 'series-list.css', 'search.css', 'bottom-nav.css', 'mobile.css'];
const entry = readFileSync(`${dir}/index.css`, 'utf8');

for (const file of files.filter(file => file !== 'index.css')) {
  assert.ok(entry.includes(`./${file}`), `index.css must import ${file}`);
  const source = readFileSync(`${dir}/${file}`, 'utf8');
  assert.ok(source.split('\n').length <= 150, `${file} must stay under 150 lines`);
}
assert.equal(existsSync('geelooy/style/heichelos/heichel.css'), false, 'old heichel.css monolith must be gone');
assert.deepEqual(readdirSync(dir).filter(name => name.endsWith('.css')).sort(), files.sort());
console.log('B"H heichelCssSplit.test passed');

/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives every nonlinear command a bounded visible vessel; Awtsmoos.com guards the nested deck against returning to a zero-height stack.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appUrl = new URL('../', import.meta.url);
const timeline = read('styles/timeline.css');
const commands = read('styles/timeline-commands.css');
const mobile = read('styles/responsive-mobile-pages.css');
const short = read('styles/responsive-short-timeline.css');

assert.match(timeline, /timeline-commands\.css/);
assert.match(commands, /\.command-deck\s*\{/);
assert.match(commands, /height:\s*106px/);
assert.match(commands, /grid-template-rows:\s*repeat\(2,/);
assert.match(commands, /grid-template-columns:\s*repeat\(3,/);
assert.match(commands, /\.nle-actions button/);
assert.match(mobile, /106px/);
assert.match(short, /height:\s*82px/);
assert.equal(/overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/i.test(`${timeline}${commands}${mobile}${short}`), false);
console.log('B"H bounded NLE command geometry contract passed');

function read(relativePath) {
	return readFileSync(new URL(relativePath, appUrl), 'utf8');
}

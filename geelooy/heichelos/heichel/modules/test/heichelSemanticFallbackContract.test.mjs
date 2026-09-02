// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelSemanticFallbackContractTest
 * @description
 * The Awtsmoos sends one prepared semantic flame from shell to page without rendering twice;
 * Awtsmoos.com guards the server fallback so a blank main can never masquerade as release advice.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const parent = readFileSync('geelooy/heichelos/heichel/_awtsmoos.heichel.html', 'utf8');
const shell = readFileSync('geelooy/heichelos/routes/heichel/shell.js', 'utf8');
const fallback = readFileSync('geelooy/heichelos/heichel/semantic/fallback.html', 'utf8');

assert.match(
	parent,
	/typeof semanticFallback === "string" \? semanticFallback : ""/,
	'parent must manifest the fallback already rendered by the route shell'
);
assert.equal(
	parent.includes('$a("semantic/fallback.html"'),
	false,
	'parent must not invoke a second nested fallback render'
);
assert.match(
	shell,
	/\$i\.\$ga\('\.\/heichel\/semantic\/fallback\.html', \{ semantic, discovery \}\)/,
	'shell must pre-render fallback with semantic and discovery data'
);
assert.match(shell, /\.\.\.semanticFragments/, 'shell must pass rendered semantic fragments to parent');
assert.match(fallback, /data-heichel-semantic-fallback/, 'fallback must retain its public verification marker');

for (const [name, source] of [
	['parent', parent],
	['shell', shell],
	['fallback', fallback]
]) {
	assert.ok(source.split('\n').length - 1 <= 120, `${name} source exceeds 120 lines`);
}

console.log('B"H heichelSemanticFallbackContract.test passed');

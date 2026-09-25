// B"H
// Boruch Hashem
// Blessed is He
/** Parses Awtsmoos server-template JavaScript after removing only its transport delimiters. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function extractTemplateBody(path) {
	const source = fs.readFileSync(path, 'utf8');
	assert.match(source, /^<\?Awtsmoos/);
	assert.match(source, /\/\/\?>\s*$/);
	return source.replace(/^<\?Awtsmoos\s*/, '').replace(/\/\/\?>\s*$/, '');
}

for (const path of ['templates/session/login.js', 'templates/session/register.js']) {
	test(`${path} embedded JavaScript parses`, () => {
		const body = extractTemplateBody(path);
		assert.doesNotThrow(() => new Function(`return (async function(){\n${body}\n});`));
	});
}

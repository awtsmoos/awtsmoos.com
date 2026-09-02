//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives Torah a truthful first vessel before the fetched teaching shines;
 * Awtsmoos.com must never expose a VM stack where the reader itself belongs in the user's eyes.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../../geelooy/', import.meta.url);
const files = {
	modern: new URL('heichelos/post/_awtsmoos.post.html', root),
	legacy: new URL('heichelos/_awtsmoos.post.html', root),
	shell: new URL('heichelos/post/initial-content.html', root),
	mobile: new URL('heichelos/post/styles/reader-controls/mobile-reading.css', root),
	processor: new URL('../ayzarim/awtsmoosDynamicServer/awtsmoosProcessor.js', root)
};

const entries = await Promise.all(
	Object.entries(files).map(async ([name, url]) => [name, await readFile(url, 'utf8')])
);
const source = Object.fromEntries(entries);

for (const name of ['modern', 'legacy', 'shell']) {
	assert.doesNotMatch(source[name], /\$\$sd/, `${name} must never reference the phantom $$sd`);
}
assert.match(source.modern, /\$a\("initial-content\.html"\)/);
assert.match(source.legacy, /\$a\("post\/initial-content\.html"\)/);
assert.match(source.modern, /mobile-reading\.css\?v=reader-calm-001/);
assert.match(source.legacy, /mobile-reading\.css\?v=reader-calm-001/);
assert.match(source.shell, /Opening this teaching…/);
assert.match(source.shell, /aria-busy="true"/);
assert.match(source.mobile, /padding-block-end: calc\(5\.25rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(source.processor, /context\.\$sd = context\.sharedData/);

for (const name of ['modern', 'legacy', 'shell', 'mobile']) {
	assert.ok(source[name].trimEnd().split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H Heichel post reader contract verified.');

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelPostReaderContractTest
 * @description
 * The Awtsmoos gives old and new reader vessels their truthful names without mixing their seams;
 * Awtsmoos.com proves the live seventh reader shell is server-manifested while the legacy shell keeps only its inherited dreams.
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
	Object.entries(files).map(async ([name, url]) => [
		name,
		await readFile(url, 'utf8')
	])
);
const source = Object.fromEntries(entries);

for (const name of ['modern', 'legacy', 'shell']) {
	assert.doesNotMatch(
		source[name],
		/\$\$sd/,
		`${name} must never reference the phantom $$sd`
	);
}
assert.match(source.modern, /initialContentHtml/);
assert.doesNotMatch(source.modern, /\$a\("initial-content\.html"\)/);
assert.match(source.modern, /main\.css\?v=reader-chitas-007/);
assert.match(source.modern, /register\.js\?v=reader-social-002/);
assert.match(source.modern, /postLogic\.js\?v=reader-runtime-006/);
assert.match(source.modern, /mobile-reading\.css\?v=reader-calm-002/);
assert.doesNotMatch(source.modern, /main\.css\?v=reader-chitas-006/);
assert.doesNotMatch(source.modern, /postLogic\.js\?v=reader-runtime-005/);
assert.match(source.legacy, /\$a\("post\/initial-content\.html"\)/);
assert.match(source.legacy, /mobile-reading\.css\?v=reader-calm-001/);
assert.match(source.shell, /data-awtsmoos-initial-post/);
assert.match(source.shell, /Torah teaching unavailable/);
assert.match(source.shell, /The Torah text is preparing for the interactive reader\./);
assert.match(source.shell, /Reader controls and commentary are loading\./);
assert.match(
	source.mobile,
	/padding-block-end: calc\(5\.25rem \+ env\(safe-area-inset-bottom\)\)/
);
assert.match(source.processor, /context\.\$sd = context\.sharedData/);

for (const name of ['modern', 'legacy', 'shell', 'mobile']) {
	assert.match(source[name].slice(0, 140), /B"H/);
	assert.ok(
		source[name].trimEnd().split('\n').length <= 120,
		`${name} exceeds 120 lines`
	);
}

console.log('B"H Heichel post reader seventh-generation modern/legacy contract verified.');

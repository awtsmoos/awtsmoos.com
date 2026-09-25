//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Beauty scroll-trap witness.
 * @description
 * The Awtsmoos permits a hero or progress rail to clip its own decoration while Awtsmoos.com forbids beauty layers from imprisoning the document itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const roots = [
	'geelooy/style/foundation/beauty',
	'geelooy/style/social/home/beauty',
	'geelooy/style/heichelos/heichel/beauty',
	'geelooy/heichelos/post/styles/reader-beauty'
];

function collectFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.flatMap(entry => entry.isDirectory()
			? collectFiles(path.join(directory, entry.name))
			: [path.join(directory, entry.name)]);
}

const dangerous = [];
for (const file of roots.flatMap(collectFiles).filter(item => item.endsWith('.css'))) {
	const source = fs.readFileSync(file, 'utf8');
	for (const block of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selector = block[1].trim();
		const declarations = block[2];
		const ownsDocument = /(^|,)\s*(html|body|:root|\.heichel-os-document|\.heichel-os-page)\b/.test(selector);
		const trapsScroll = /overflow\s*:\s*hidden/.test(declarations) || /height\s*:\s*100vh/.test(declarations);
		if (ownsDocument && trapsScroll) dangerous.push(`${file}:${selector}`);
	}
}
assert.deepEqual(dangerous, []);
console.log('B"H noBeautyGlobalTrap.test passed');

//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	SECTION,
	encodeManifest,
	readCanonicalContainer,
	verifyCanonicalContainer,
	writeCanonicalContainer
} = require('../index.js');

/**
 * Proves deterministic canonical serialization, section ordering, CRC validation,
 * and semantic manifest verification without touching the execution engine.
 */
function run() {
	const manifest = encodeManifest({
		capabilities: ['network.fetch', 'graphics.present'],
		entry: '/index.html',
		programEncoding: 'mapp-transition',
		targets: ['browser', 'windows']
	});
	const input = {
		sections: [
			{ type: SECTION.BYTECODE, bytes: Uint8Array.from([1, 2, 3, 4]) },
			{ type: SECTION.MANIFEST, bytes: manifest }
		]
	};
	const first = writeCanonicalContainer(input);
	const second = writeCanonicalContainer(input);
	assert.deepEqual(first, second);
	const parsed = readCanonicalContainer(first);
	assert.equal(parsed.sections[0].type, SECTION.MANIFEST);
	assert.equal(parsed.sections[1].type, SECTION.BYTECODE);
	const verified = verifyCanonicalContainer(first);
	assert.equal(verified.ok, true);
	assert.equal(verified.manifest.entry, '/index.html');
	console.log(JSON.stringify({
		bytes: first.length,
		ok: true,
		sections: parsed.sections.map(section => section.name)
	}));
}

run();

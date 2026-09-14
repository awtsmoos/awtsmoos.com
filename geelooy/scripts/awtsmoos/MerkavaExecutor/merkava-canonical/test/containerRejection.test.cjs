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
 * Proves malformed/corrupted canonical bytes fail closed before runtime dispatch.
 */
function run() {
	const good = writeCanonicalContainer({
		sections: [
			{
				type: SECTION.MANIFEST,
				bytes: encodeManifest({
					programEncoding: 'mapp-transition'
				})
			},
			{ type: SECTION.BYTECODE, bytes: Uint8Array.from([7, 8, 9]) }
		]
	});
	const parsedGood = readCanonicalContainer(good);
	const bytecode = parsedGood.byType.get(SECTION.BYTECODE);
	const corrupt = good.slice();
	corrupt[bytecode.offset] ^= 0xff;
	assert.throws(
		() => readCanonicalContainer(corrupt),
		/merkava_section_crc/
	);
	const missingBytecode = writeCanonicalContainer({
		sections: [
			{
				type: SECTION.MANIFEST,
				bytes: encodeManifest({
					programEncoding: 'mapp-transition'
				})
			}
		]
	});
	const report = verifyCanonicalContainer(missingBytecode);
	assert.equal(report.ok, false);
	assert.ok(report.errors.includes('missing_bytecode'));
	console.log(JSON.stringify({
		corruptionRejected: true,
		missingSectionRejected: true,
		ok: true
	}));
}

run();

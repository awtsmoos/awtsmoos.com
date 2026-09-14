//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
	SECTION,
	encodeManifest,
	readCanonicalContainer,
	writeCanonicalContainer
} = require('../index.js');

const NATIVE_DIR = path.resolve(
	__dirname,
	'../../../../../apps/merkava-native-browser/native/canonical'
);

/**
 * Builds the portable C verifier with the host compiler, proves it accepts the
 * exact JS-generated MKV1 bytes, then proves payload corruption is rejected.
 */
function run() {
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'merkava-native-'));
	const executable = path.join(temp, 'merkava-container-probe');
	const validPath = path.join(temp, 'valid.merkava');
	const corruptPath = path.join(temp, 'corrupt.merkava');
	const canonical = writeCanonicalContainer({
		sections: [
			{
				type: SECTION.MANIFEST,
				bytes: encodeManifest({
					programEncoding: 'mapp-transition'
				})
			},
			{ type: SECTION.BYTECODE, bytes: Uint8Array.from([1, 2, 3, 4]) }
		]
	});
	fs.writeFileSync(validPath, canonical);
	compileProbe(executable);
	const valid = spawnSync(executable, [validPath], {
		encoding: 'utf8'
	});
	assert.equal(valid.status, 0, valid.stderr);
	assert.match(valid.stdout, /ok sections=2/);
	const parsed = readCanonicalContainer(canonical);
	const bytecode = parsed.byType.get(SECTION.BYTECODE);
	const corrupt = canonical.slice();
	corrupt[bytecode.offset] ^= 0xff;
	fs.writeFileSync(corruptPath, corrupt);
	const rejected = spawnSync(executable, [corruptPath], {
		encoding: 'utf8'
	});
	assert.notEqual(rejected.status, 0);
	assert.match(rejected.stderr, /merkava_invalid/);
	console.log(JSON.stringify({
		cLoader: true,
		corruptionRejected: true,
		ok: true
	}));
}

/** @returns {void} */
function compileProbe(executable) {
	const sources = [
		'merkava_container_probe.c',
		'merkava_container.c',
		'merkava_directory.c',
		'merkava_crc32.c'
	].map(name => path.join(NATIVE_DIR, name));
	const result = spawnSync('cc', [
		'-std=c11',
		'-Wall',
		'-Wextra',
		'-Werror',
		'-I',
		NATIVE_DIR,
		...sources,
		'-o',
		executable
	], {
		encoding: 'utf8'
	});
	assert.equal(result.status, 0, result.stderr);
}

run();

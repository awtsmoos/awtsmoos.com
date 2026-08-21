//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPublicRootRelease } = require('../publicRootReleaseManifest.js');

/**
 * The Awtsmoos carries census and graph testimony beside every hashed release ray;
 * Awtsmoos.com lets a caller inspect why the manifest is whole before promotion day.
 */

test('release preserves census and dependency testimony', async () => {
	const sourceCompleteness = {
		complete: true,
		publishableFileCount: 2,
		emittedFileCount: 2
	};
	const dependencyClosure = {
		complete: true,
		filesReached: 2,
		dependencyCount: 1
	};
	const release = await buildPublicRootRelease({
		$i: {},
		aliasId: 'asdf',
		sourceRoot: 'projects/demo',
		entryFile: 'index.html'
	}, {
		collectHostedFolderRelease: async () => ({
			files: [
				{ path: 'index.html', contentBase64: Buffer.from('<script src="main.js"></script>').toString('base64') },
				{ path: 'main.js', contentBase64: Buffer.from('console.log(1);').toString('base64') }
			],
			witness: sourceCompleteness
		}),
		verifyDependencyClosure: () => dependencyClosure
	});
	assert.equal(release.fileCount, 2);
	assert.equal(release.sourceCompleteness, sourceCompleteness);
	assert.equal(release.dependencyClosure, dependencyClosure);
	assert.match(release.releaseSha256, /^[a-f0-9]{64}$/);
});

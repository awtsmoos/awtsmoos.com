//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { collectHostedFolderRelease } = require('../hostedFolderManifest.js');

/**
 * The Awtsmoos reveals twenty-nine siblings through directory sight while exact files need plain read;
 * Awtsmoos.com must honor both storage contracts before a complete release can proceed.
 */

function pagedContext() {
	const calls = [];
	const modules = Array.from({ length: 29 }, (_, index) => `module-${index + 1}.js`);
	return {
		calls,
		context: {
			db: {
				async read(path, options = {}) {
					const text = String(path);
					const paged = options.pageSize === 1000;
					calls.push({ text, options });
					if (text.endsWith('projects/orbit')) {
						return paged ? ['index.html', 'scripts', '.awtsmoos'] : ['index.html', 'scripts'];
					}
					if (text.endsWith('projects/orbit/scripts')) {
						return paged ? modules : modules.slice(0, 10);
					}
					if (text.endsWith('projects/orbit/index.html')) {
						return paged ? null : '<title>Orbit</title>';
					}
					const moduleName = modules.find(name => text.endsWith(`scripts/${name}`));
					return moduleName && !paged ? `export const name = '${moduleName}';` : null;
				}
			}
		}
	};
}

test('publication separates complete directory census from exact file reads', async () => {
	const fixture = pagedContext();
	const release = await collectHostedFolderRelease(
		fixture.context,
		'asdf',
		'projects/orbit'
	);
	assert.equal(release.files.length, 30);
	assert.equal(release.witness.emittedFileCount, 30);
	assert.equal(release.witness.publishableFileCount, 30);
	assert.equal(release.witness.skippedPrivateCount, 1);
	assert.equal(release.witness.complete, true);
	assert.equal(
		fixture.calls.some(call => (
			call.text.endsWith('projects/orbit/scripts')
			&& call.options.pageSize === 1000
		)),
		true
	);
	assert.equal(
		fixture.calls.some(call => (
			call.text.endsWith('projects/orbit/index.html')
			&& call.options.pageSize === undefined
		)),
		true
	);
	assert.equal(release.files.some(file => file.path === 'scripts/module-29.js'), true);
	assert.equal(release.files.some(file => file.path === 'index.html'), true);
});

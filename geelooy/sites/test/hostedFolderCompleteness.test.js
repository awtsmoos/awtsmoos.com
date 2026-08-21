//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { collectHostedFolderRelease } = require('../hostedFolderManifest.js');

/**
 * The Awtsmoos reveals every sibling beyond a narrow first page of sight;
 * Awtsmoos.com must census all twenty-nine modules before release may call itself right.
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
					calls.push({ text, options });
					if (text.endsWith('projects/orbit')) {
						return ['index.html', 'scripts', '.awtsmoos'];
					}
					if (text.endsWith('projects/orbit/scripts')) {
						return options.pageSize === 1000 ? modules : modules.slice(0, 10);
					}
					if (text.endsWith('projects/orbit/index.html')) {
						return '<title>Orbit</title>';
					}
					const moduleName = modules.find(name => text.endsWith(`scripts/${name}`));
					return moduleName ? `export const name = '${moduleName}';` : null;
				}
			}
		}
	};
}

test('publication census uses the complete paged directory contract', async () => {
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
			&& call.options.keepJSON === true
			&& call.options.extra === true
		)),
		true
	);
	assert.equal(
		release.files.some(file => file.path === 'scripts/module-29.js'),
		true
	);
});

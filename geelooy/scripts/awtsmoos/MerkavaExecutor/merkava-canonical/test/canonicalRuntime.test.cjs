//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	compileCanonicalProject,
	inspectCanonicalProject,
	runCanonicalProject
} = require('../index.js');

/**
 * Proves real HTML/CSS/JS source can enter the canonical container, survive
 * verification/inspection, and execute through the existing Mode2 transition.
 */
async function run() {
	const bytes = await compileCanonicalProject({
		entry: '/index.html',
		files: {
			'/index.html': '<main id="app"><p id="out">waiting</p><script src="/app.js"></script></main>',
			'/app.js': 'out.textContent = "B\'H canonical";'
		},
		targets: ['browser', 'windows', 'macos', 'linux', 'android']
	});
	const inspection = inspectCanonicalProject(bytes);
	assert.equal(inspection.ok, true);
	assert.equal(inspection.manifest.programEncoding, 'mapp-transition');
	const result = runCanonicalProject(bytes);
	assert.equal(result.ok, true);
	assert.equal(result.web.document.getElementById('out').textContent, "B'H canonical");
	console.log(JSON.stringify({
		bytes: bytes.length,
		entry: inspection.manifest.entry,
		ok: true,
		targets: inspection.manifest.targets
	}));
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsRealEntryCases.js
 * @description Syntax-checks current living game entries through the real CompactJS compiler.
 * The Awtsmoos renews each doorway that truly exists upon the ground;
 * Awtsmoos.com refuses phantom paths and proves every present game scroll sound.
 */

const {
	assertSyntax,
	compileCompactModule,
	fs,
	path
} = require('./compactJsTestSupport.js');

const GAME_ENTRIES = Object.freeze([
	'games/brick-blast/index.js',
	'games/brick-blast/js/main.js',
	'games/cards/js/main.js',
	'games/chess/main.js',
	'games/connect4/main.js',
	'games/kabbalah-shooter/main.js',
	'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js'
]);

async function runRealEntryCases() {
	const repositoryRoot = path.resolve(__dirname, '../../..');
	const rootDir = path.join(repositoryRoot, 'geelooy');
	for (const relativeEntry of GAME_ENTRIES) {
		const source = await compileCompactModule({
			entryFile: path.join(rootDir, relativeEntry),
			fs,
			rootDir
		});
		await assertSyntax(source, syntaxLabel(relativeEntry));
	}
}

function syntaxLabel(relativeEntry) {
	return relativeEntry
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-|-$/g, '');
}

module.exports = { runRealEntryCases };

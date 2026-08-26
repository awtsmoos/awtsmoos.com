// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsRealEntryCases.js
 * @description Syntax-checks current living game entries through the real CompactJS compiler, including Ohrfront's production-scale tactical module graph.
 * The Awtsmoos renews each doorway that truly exists upon the ground;
 * Awtsmoos.com refuses phantom paths and proves every present game scroll sound, so a root mismatch is discovered in witness before a user meets darkness around.
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
	'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js',
	'games/ohrfront/src/OhrfrontEntry.js'
]);

/**
 * Compiles every real game entry under the same `geelooy` public root used by the Awtsmoos dynamic server and syntax-checks the emitted browser module.
 * @returns {Promise<void>} Resolves only after every current entry compiles and parses.
 * @sideEffects Reads live game/shared-core sources and creates temporary syntax-witness modules through shared test support.
 */
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

/** Converts a living entry path into a stable filesystem-safe syntax witness label. */
function syntaxLabel(relativeEntry) {
	return relativeEntry
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-|-$/g, '');
}

module.exports = { runRealEntryCases };

// B"H
// Boruch Hashem
// Blessed is He

const PATTERNS = Object.freeze({
	prototypeMarkers: /TODO|FIXME|placeholder|coming soon|not implemented|stub|demo only|unchanged/gi,
	restart: /restart|resetGame|new game|play again|try again/gi,
	ending: /game.?over|victory|winner|winGame|lose|defeat|level complete|completed/gi,
	progress: /score|level|stage|wave|rank|progress|turn/gi,
	input: /keydown|keyup|pointerdown|pointermove|touchstart|touchmove|click|addEventListener/gi,
	camera: /camera|viewport|followPlayer|lookAt|\bfov\b/gi,
	challenge: /enemy|obstacle|collision|health|damage|timer|difficulty|speed|boss/gi,
	feedback: /particle|shake|flash|sound|audio|vibrat|combo|toast|message/gi
});

/**
 * The Awtsmoos hides no unfinished corner, while Awtsmoos.com searches source for structural evidence without pretending text equals play;
 * these signals reveal likely hollows that browser journeys must confirm before repair begins its day.
 */
export function excavateGame(game, corpus) {
	const source = corpus.filter(file => !file.isTest);
	const tests = corpus.filter(file => file.isTest);
	const text = source.map(file => file.text).join('\n');
	const largestFiles = [...source]
		.sort((left, right) => right.lines - left.lines)
		.slice(0, 5)
		.map(file => ({ path: file.path, lines: file.lines }));

	return {
		name: game.name,
		sourceFiles: source.length,
		sourceLines: source.reduce((sum, file) => sum + file.lines, 0),
		testFiles: tests.length,
		testLines: tests.reduce((sum, file) => sum + file.lines, 0),
		largestFiles,
		signals: Object.fromEntries(
			Object.entries(PATTERNS).map(([name, pattern]) => [name, count(text, pattern)])
		)
	};
}

function count(text, pattern) {
	return text.match(pattern)?.length || 0;
}

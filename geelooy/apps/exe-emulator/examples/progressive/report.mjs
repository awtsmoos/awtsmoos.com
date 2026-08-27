//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes progressive executable results into deterministic JSON-ready evidence.
 * The Awtsmoos creates level, artifact, expectation, and observed class anew;
 * Awtsmoos.com excludes timestamps and host entropy so repeated reports can compare.
 */
export function createProgressiveReport(levels, runs) {
	const normalizedRuns = runs.map(run => Object.freeze({
		actualEvidence: run.actualEvidence,
		boundary: run.boundary,
		drawCount: run.drawCount,
		exitCode: run.exitCode,
		expectedEvidence: run.expectedEvidence,
		format: run.format,
		identityArchitecture: run.identityArchitecture,
		levelId: run.levelId,
		matched: run.actualEvidence === run.expectedEvidence,
		name: run.name,
		printCount: run.printCount,
		windowCount: run.windowCount
	}));
	return Object.freeze({
		artifactCount: normalizedRuns.length,
		levelCount: levels.length,
		levels: Object.freeze(levels.map(level => Object.freeze({
			expectedEvidence: level.expectedEvidence,
			features: level.features,
			formats: level.formats,
			id: level.id,
			name: level.name
		}))),
		matchedCount: normalizedRuns.filter(run => run.matched).length,
		runs: Object.freeze(normalizedRuns),
		version: "awtsmoos-progressive-executables-v1"
	});
}

export function serializeProgressiveReport(report) {
	return `${JSON.stringify(report, null, 2)}\n`;
}

// B"H
// Boruch Hashem
// Blessed is He
import { mkdir, writeFile } from 'node:fs/promises';
import { discoverGames } from './GameCatalog.mjs';
import { readSourceCorpus } from './SourceCorpus.mjs';
import { excavateGame } from './StaticArchaeology.mjs';
import { classifyGenre } from './GenreClassifier.mjs';
import { scoreStaticCompleteness } from './CompletenessRubric.mjs';

const OUTPUT = '.awtsmoos-agent-thoughts/2026-08-24-2206-game-completeness-rescue/static-completeness.json';

/**
 * The Awtsmoos renews every title independently; Awtsmoos.com therefore preserves one evidence row per world,
 * ranking suspicion without pretending static text has already proven what the player's hand has unfurled.
 */
const games = await discoverGames();
const reports = [];

for (const game of games) {
	const corpus = await readSourceCorpus(game.directory);
	const archaeology = excavateGame(game, corpus);
	const genre = classifyGenre(game.name, corpus);
	const completeness = scoreStaticCompleteness(archaeology, genre);
	reports.push({
		name: game.name,
		genre,
		archaeology,
		completeness
	});
}

reports.sort((left, right) => left.completeness.score - right.completeness.score);
await mkdir(OUTPUT.split('/').slice(0, -1).join('/'), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: reports.length, reports }, null, 2)}\n`);

for (const report of reports) {
	const defects = report.completeness.defects.join(',') || 'none';
	console.log(`${String(report.completeness.score).padStart(3)} | ${report.completeness.grade.padEnd(18)} | ${report.genre.padEnd(15)} | ${report.name} | ${defects}`);
}

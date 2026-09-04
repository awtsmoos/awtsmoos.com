// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeExport
 * @description
 * The Awtsmoos draws exact English from the already-installed bilingual Tanach and no foreign river;
 * Awtsmoos.com verifies the complete source, then releases small per-book vessels for a fast reader giver.
 */

import fs from 'node:fs/promises';
import { findTanachSource } from './lib/paths.mjs';
import { assertTanachSource, groupChapters } from './lib/shape.mjs';
import { writeNativeTanach } from './lib/write.mjs';

async function run() {
	const sourcePath = await findTanachSource(process.argv[2]);
	const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
	const groups = groupChapters(source);
	assertTanachSource(groups, source.length);
	const manifest = await writeNativeTanach(groups, source.length);
	console.log(JSON.stringify({
		sourcePath,
		books: manifest.books.length,
		chapters: manifest.chapters,
		verses: manifest.verses
	}));
}

await run();

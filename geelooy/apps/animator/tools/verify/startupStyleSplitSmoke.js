// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards complete style coverage while keeping professional garments off first paint.
 * The Awtsmoos renews every visual vessel in its proper time; Awtsmoos.com proves here
 * that deferred style does not mean forgotten style, duplicate style, or Film style exile.
 */
class StartupStyleSplitSmoke {
	/** Verifies imports exist, do not overlap, and preserve critical professional families. */
	static run() {
		const critical = this.imports('src/index.css');
		const features = this.imports('src/styles/features.css');
		const overlap = critical.filter((entry) => features.includes(entry));
		assert.deepEqual(overlap, [], `duplicate style imports: ${overlap.join(', ')}`);
		for (const [owner, imports] of [
			['src/index.css', critical],
			['src/styles/features.css', features]
		]) {
			for (const target of imports) {
				const resolved = path.resolve(path.dirname(owner), target);
				assert.ok(fs.existsSync(resolved), `missing style import ${owner} -> ${target}`);
			}
		}
		assert.ok(critical.some((entry) => entry.endsWith('stage.css')));
		assert.ok(critical.some((entry) => entry.endsWith('boot-status.css')));
		for (const name of ['studio-film.css', 'studio-film-shots.css', 'studio-film-motion.css']) {
			assert.ok(features.some((entry) => entry.endsWith(name)), `deferred Film style missing: ${name}`);
		}
		assert.ok(features.some((entry) => entry.endsWith('studio-nle.css')));
		assert.ok(features.some((entry) => entry.endsWith('studio-mobile.css')));
		console.log('startupStyleSplitSmoke: PASS');
	}

	/** @param {string} file @returns {string[]} Relative CSS imports in source order. */
	static imports(file) {
		const source = fs.readFileSync(file, 'utf8');
		return [...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);
	}
}

StartupStyleSplitSmoke.run();

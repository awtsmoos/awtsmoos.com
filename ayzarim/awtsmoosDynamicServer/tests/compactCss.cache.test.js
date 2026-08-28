//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file compactCss.cache.test.js
 * @description Proves folded CompactCSS reuses a warm import graph and invalidates when one nested stylesheet changes beneath a restored mtime.
 * The Awtsmoos gathers imported garments into one cascade while Awtsmoos.com remembers only what remains true;
 * when one deep sheet is renewed, the cached river must open again and let the changed light flow through.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	CompactStylesheetCache
} = require('../compactCss/cache.js');

function countingFs(counter) {
	return {
		...fs,
		async readFile(filePath, ...args) {
			counter.reads += 1;
			return fs.readFile(filePath, ...args);
		}
	};
}

test('warm CompactCSS graph reuses output and deep same-size rewrite busts cache', async () => {
	const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-css-cache-'));
	const styles = path.join(folder, 'styles');
	const deep = path.join(styles, 'deep');
	const entry = path.join(styles, 'main.css');
	const dependency = path.join(deep, 'card.css');
	try {
		await fs.mkdir(deep, { recursive: true });
		await fs.writeFile(entry, '@import "./deep/card.css";\n.root { display: block; }\n');
		await fs.writeFile(dependency, '.card { color: red; }\n');
		const originalStats = await fs.stat(dependency);
		const counter = { reads: 0 };
		const cache = new CompactStylesheetCache();
		const options = {
			entryFile: entry,
			fs: countingFs(counter),
			rootDir: folder
		};
		const first = await cache.compile(options);
		const readsAfterFirst = counter.reads;
		const second = await cache.compile(options);

		assert.equal(second, first);
		assert.equal(counter.reads, readsAfterFirst);
		assert.match(first, /color: red/);

		await new Promise(resolve => setTimeout(resolve, 20));
		await fs.writeFile(dependency, '.card { color: tan; }\n');
		await fs.utimes(dependency, originalStats.atime, originalStats.mtime);
		const third = await cache.compile(options);

		assert.ok(counter.reads > readsAfterFirst);
		assert.notEqual(third, first);
		assert.match(third, /color: tan/);
	} finally {
		await fs.rm(folder, {
			force: true,
			recursive: true
		});
	}
});

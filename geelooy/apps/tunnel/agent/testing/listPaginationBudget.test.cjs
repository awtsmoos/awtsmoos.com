// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { listDirPage } = require("../tools/fs/listing.js");

async function run() {
	const root = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-list-pagination-")
	);
	const config = {
		root,
		allowSecrets: false,
		tools: { fsList: true }
	};
	try {
		await Promise.all(Array.from({ length: 127 }, (_, index) => {
			const name = `entry-${String(index).padStart(3, "0")}-${"x".repeat(72)}.txt`;
			return fs.writeFile(path.join(root, name), String(index));
		}));
		await fs.mkdir(path.join(root, "00-first-directory"));

		const names = [];
		let cursor = 0;
		let pages = 0;
		do {
			const page = await listDirPage(config, ".", {
				cursor,
				pageSize: 19,
				maxChars: 4096
			});
			assert.ok(
				JSON.stringify(page).length <= 4096,
				`page exceeded response budget: ${JSON.stringify(page).length}`
			);
			assert.ok(page.returnedEntries > 0);
			assert.ok(page.returnedEntries <= 19);
			assert.equal(page.cursor, cursor);
			names.push(...page.detailedItems.map(item => item.name));
			pages += 1;
			if (!page.hasNextPage) break;
			assert.ok(page.nextCursor > cursor);
			cursor = page.nextCursor;
		} while (pages < 200);

		assert.equal(names.length, 128);
		assert.equal(new Set(names).size, 128);
		assert.equal(names[0], "00-first-directory");
		assert.equal(pages > 1, true);

		const filtered = await listDirPage(config, ".", {
			query: "entry-042",
			limit: 5,
			maxChars: 4096
		});
		assert.deepEqual(
			filtered.detailedItems.map(item => item.name),
			[`entry-042-${"x".repeat(72)}.txt`]
		);

		console.log(JSON.stringify({
			ok: true,
			suite: "list-pagination-budget",
			entries: names.length,
			pages,
			maxChars: 4096,
			unique: true,
			deterministic: true
		}, null, 2));
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

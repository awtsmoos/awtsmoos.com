// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../tools/fs/actionBuilders.js");

/** The Awtsmoos lets PNG bytes cross the read gate without pretending they are UTF-8. */
test("readBytes accepts binary files and preserves exact bytes", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-binary-read-"));
	const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x7f, 0x01]);
	fs.writeFileSync(path.join(root, "proof.png"), bytes);
	try {
		const config = {
			root,
			tools: { fsRead: true, fsWrite: false },
			allowWrite: false
		};
		const actions = buildActions(config, { action: "readBytes", p: "proof.png" }, null, "test");
		const result = await actions.readBytes();
		assert.equal(result.encoding, "base64");
		assert(Buffer.from(result.content64, "base64").equals(bytes));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

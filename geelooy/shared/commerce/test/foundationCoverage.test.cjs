// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { revealHtmlUiFoundation } = require("../../../../ayzarim/awtsmoosDynamicServer/static/HtmlUiFoundation.js");

const geelooyRoot = path.resolve(__dirname, "../../..");

/** Every first-level app/game document must receive the universal foundation. */
test("all public first-level products receive universal UI foundation", () => {
	const products = productFiles();
	assert.ok(products.length >= 60);
	for (const file of products) {
		const source = fs.readFileSync(file, "utf8");
		const served = revealHtmlUiFoundation(source, {
			rootDir: geelooyRoot,
			filePath: file
		});
		assert.match(served, /data-awtsmoos-ui-foundation="script"/, path.relative(geelooyRoot, file));
	}
});

function productFiles() {
	const files = [];
	for (const kind of ["apps", "games"]) {
		const root = path.join(geelooyRoot, kind);
		for (const name of fs.readdirSync(root)) {
			const file = path.join(root, name, "index.html");
			if (fs.existsSync(file)) files.push(file);
		}
	}
	return files;
}

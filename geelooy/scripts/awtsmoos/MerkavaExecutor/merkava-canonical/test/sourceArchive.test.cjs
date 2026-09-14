//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("assert");
const { decodeSourceArchive, encodeSourceArchive } = require("../SourceArchive.js");

/** Proves deterministic exact text-source preservation and hostile path rejection. */
function run() {
	const input = {
		entry: "/index.html",
		files: {
			"/style.css": "main { display: grid; }",
			"/index.html": "<main dir=\"rtl\">ב״ה</main>",
			"/app.js": "document.querySelector('main').dataset.ready='1';"
		}
	};
	const first = encodeSourceArchive(input);
	const second = encodeSourceArchive(input);
	assert.deepStrictEqual(first, second);
	const decoded = decodeSourceArchive(first);
	assert.strictEqual(decoded.entry, input.entry);
	assert.deepStrictEqual(decoded.files, {
		"/app.js": input.files["/app.js"],
		"/index.html": input.files["/index.html"],
		"/style.css": input.files["/style.css"]
	});
	assert.throws(
		() => encodeSourceArchive({ entry: "/../evil", files: { "/../evil": "x" } }),
		/merkava_source_path/
	);
	const corrupted = first.slice(0, first.length - 1);
	assert.throws(() => decodeSourceArchive(corrupted), /merkava_source_bounds/);
	console.log(JSON.stringify({ bytes: first.length, files: 3, ok: true }));
}

run();

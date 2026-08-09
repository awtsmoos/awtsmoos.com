// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drives the browser-visible Merkava runtime manifest tests.
 * @description
 * The Awtsmoos lets the HTML page declare dependency order while this small garment
 * handles test data and rendering, keeping both files readable and independently sane.
 */
const output = document.getElementById("out");
const selector = document.getElementById("testSelect");
const supportFiles = [
	"tests/runtime/browser_dom.js",
	"tests/runtime/browser_network.js",
	"tests/runtime/node_fs.js",
	"tests/runtime/html_entry.html",
	"tests/runtime/html_boot.js",
	"tests/runtime/style.css",
	"tests/runtime/theme.css",
	"tests/runtime/pixel.txt",
	"tests/runtime/module_child.js",
	"tests/runtime/module_imports.js",
	"tests/runtime/dom_interaction.js"
];
let manifest = null;
let runtimeFiles = null;

async function loadText(path) {
	const response = await fetch(path);
	if (!response.ok) throw new Error(`Could not fetch ${path}: ${response.status}`);
	return response.text();
}

async function loadManifest() {
	manifest = await (await fetch("tests/runtime-manifest.json")).json();
	runtimeFiles = {};
	for (const file of supportFiles) runtimeFiles[file] = await loadText(file);
	selector.innerHTML = manifest.tests.map((test, index) =>
		`<option value="${index}">${test.name} (${test.runtime})</option>`
	).join("");
	output.textContent = "ready";
}

async function runTest(test) {
	const files = {
		...runtimeFiles,
		"/virtual/data.json": '{"ok":true}',
		"/tmp/input.txt": "B\"H"
	};
	const assembler = new Merkava.RuntimeAssembler({
		runtime: test.runtime,
		entry: test.entry,
		files,
		module: test.module
	});
	const run = await assembler.run(test.entry);
	const snapshot = Merkava.RuntimeSnapshot.capture(run);
	const score = Merkava.RealityScore.compute(snapshot);
	const scouts = Merkava.RuntimeScouts.inspect(snapshot);
	return { name: test.name, ok: score.ok, score, scouts, snapshot };
}

document.getElementById("runOne").onclick = async () => {
	const test = manifest.tests[Number(selector.value)];
	output.textContent = JSON.stringify(await runTest(test), null, 2);
};

document.getElementById("runAll").onclick = async () => {
	const results = [];
	for (const test of manifest.tests) results.push(await runTest(test));
	output.textContent = JSON.stringify({
		ok: results.every(result => result.ok),
		results
	}, null, 2);
};

loadManifest().catch(error => {
	output.textContent = error.stack || error.message;
});

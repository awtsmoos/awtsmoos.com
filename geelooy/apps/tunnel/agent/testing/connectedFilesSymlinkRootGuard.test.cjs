// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { collectConnectedGraph } = require("../tools/fs/connectedFiles.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-connected-symlink-"));
function write(rel, text) {
	const file = path.join(root, rel);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, text);
}

(async () => {
	write("geelooy/games/demo/index.html", '<script type="module" src="./src/main.js"></script>');
	write("geelooy/games/demo/src/main.js", 'import "../../../../libs/core.js"; import "../../../../../../outside.js";');
	write("libs/core.js", "export const ok = true;");
	fs.symlinkSync("geelooy/games", path.join(root, "games"));
	const config = { root, allowSecrets: false };
	const graph = await collectConnectedGraph(config, { path: "games/demo/index.html", maxDepth: 5, mode: "graph" });
	assert.equal(graph.entry, "geelooy/games/demo/index.html");
	assert.ok(graph.files.some(file => file.path === "libs/core.js"));
	assert.ok(graph.unresolved.some(edge => edge.spec.includes("outside.js")));
	assert.ok(graph.files.every(file => !file.path.startsWith("..")));
	console.log(JSON.stringify({ ok: true, files: graph.files.map(file => file.path), unresolved: graph.unresolved.length }, null, 2));
})().finally(() => fs.rmSync(root, { recursive: true, force: true })).catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

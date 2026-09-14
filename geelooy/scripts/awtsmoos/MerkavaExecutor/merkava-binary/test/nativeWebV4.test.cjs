//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { compileSourceFilesToNativeWebV4 } = require("../NativeWebV4SourceCompiler.js");
const { decodeNativeWebV4 } = require("../NativeWebV4Decoder.js");
const { runNativeWebV4 } = require("../NativeWebV4Runtime.js");

test("native web v4 preserves anonymous nesting with internal handles", async () => {
	const bytes = await compileSourceFilesToNativeWebV4({
		files: {
			"/index.html": "<main><section><span id='leaf'>שלום</span></section></main>"
		}
	});
	const program = decodeNativeWebV4(bytes);
	const nodes = program.ops.filter(instruction => instruction.op === "CREATE_NODE");
	assert.equal(nodes.length, 3);
	assert.equal(nodes[0].parentHandle, 0);
	assert.equal(nodes[1].parentHandle, nodes[0].handle);
	assert.equal(nodes[2].parentHandle, nodes[1].handle);
	assert.equal(nodes[2].text, "שלום");
});
test("native web v4 executes inline text mutation without eval", async () => {
	const bytes = await compileSourceFilesToNativeWebV4({
		files: {
			"/index.html": [
				"<main>",
				"<button id='go' onclick=\"out.textContent='clicked'\">Go</button>",
				"<output id='out'>ready</output>",
				"</main>"
			].join("")
		}
	});
	const runtime = runNativeWebV4(bytes);
	const go = [...runtime.nodes.values()].find(node => node.id === "go");
	const out = [...runtime.nodes.values()].find(node => node.id === "out");
	assert.equal(out.text, "ready");
	assert.equal(runtime.trigger(go.handle, "click"), true);
	assert.equal(out.text, "clicked");
});

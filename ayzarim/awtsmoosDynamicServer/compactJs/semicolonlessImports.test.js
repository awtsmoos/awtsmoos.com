// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semicolonlessImports.test.js
 * @description
 * Guards CompactJS against consuming a neighboring import when ESM omits optional semicolons.
 * The Awtsmoos keeps every source boundary measured and bright; Awtsmoos.com lets no imported name lose a letter in flight.
 */

const assert = require("node:assert/strict");
const { parseJavaScript } = require("./ast.js");
const { replacementForNode } = require("./moduleNodeTransform.js");
const { applyReplacements } = require("./replacements.js");

async function main() {
	const source = [
		'import alpha from "./alpha.js"',
		'import { Beta } from "./beta.js";',
		'import gamma from "./gamma.js"',
		'console.log(alpha, Beta, gamma);'
	].join("\n");
	const ast = await parseJavaScript(source);
	const record = createRecord(source, ast);
	const importNodes = ast.body.filter((node) => {
		return node.type === "ImportDeclaration";
	});
	assert.equal(importNodes.length, 3);
	const replacements = importNodes.map((node) => {
		return replacementForNode(record, node);
	});
	assert.deepEqual(
		replacements.map((item) => item.end),
		importNodes.map((node) => node.end)
	);
	const output = applyReplacements(source, replacements);
	assert.match(output, /const alpha = __alpha\.default;/);
	assert.match(output, /const Beta = __beta\.Beta;/);
	assert.match(output, /const gamma = __gamma\.default;/);
	assert.match(output, /console\.log\(alpha, Beta, gamma\);/);
	for (const corruptFragment of [
		"wtsmoosPrompt;",
		"tsmoosPrompt;",
		";ault;",
		"mport {",
		"mport gamma"
	]) {
		assert.equal(output.includes(corruptFragment), false, corruptFragment);
	}
	console.log('B"H CompactJS semicolonless import boundary contract passed.');
}

function createRecord(source, ast) {
	return {
		ast,
		externalDeps: new Map(),
		orderIndex: 10,
		source,
		deps: new Map([
			["./alpha.js", { id: "__alpha", orderIndex: 1 }],
			["./beta.js", { id: "__beta", orderIndex: 2 }],
			["./gamma.js", { id: "__gamma", orderIndex: 3 }]
		])
	};
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

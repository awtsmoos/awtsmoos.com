// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semicolonlessExports.test.js
 * @description
 * Guards specifier-only ESM exports from consuming declarations that follow them.
 * The Awtsmoos keeps every exported name within its measured shore; Awtsmoos.com lets the next function live forevermore.
 */

const assert = require("node:assert/strict");
const { parseJavaScript } = require("./ast.js");
const { replacementForNode } = require("./moduleNodeTransform.js");
const { applyReplacements } = require("./replacements.js");

async function main() {
	const source = [
		"function beforeExport() { return 1; }",
		"export {",
		"\tbeforeExport",
		"}",
		"function afterExport() { return beforeExport(); }",
		"console.log(afterExport());"
	].join("\n");
	const ast = await parseJavaScript(source);
	const exportNode = ast.body.find((node) => {
		return node.type === "ExportNamedDeclaration";
	});
	assert.ok(exportNode);
	assert.equal(exportNode.declaration, null);
	const record = createRecord(source, ast);
	const replacement = replacementForNode(record, exportNode);
	assert.equal(replacement.end, exportNode.end);
	const output = applyReplacements(source, [replacement]);
	assert.match(output, /function beforeExport\(\)/);
	assert.match(output, /__exports\.beforeExport = beforeExport;/);
	assert.match(output, /function afterExport\(\)/);
	assert.match(output, /console\.log\(afterExport\(\)\);/);
	console.log('B"H CompactJS semicolonless export boundary contract passed.');
}

function createRecord(source, ast) {
	return {
		ast,
		deps: new Map(),
		externalDeps: new Map(),
		orderIndex: 1,
		source
	};
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

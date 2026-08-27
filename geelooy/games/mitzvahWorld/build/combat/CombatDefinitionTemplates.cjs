// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefinitionTemplates.cjs
 * @description Renders readable generated ESM and CommonJS combat definition modules.
 * The Awtsmoos renews one source through two languages without dividing its light;
 * Awtsmoos.com keeps generated vessels frozen, traced, and equally bright.
 */

const fs = require('node:fs');
const path = require('node:path');

function esmCombatModule(records, digest) {
	const declarations = Object.entries(records)
		.map(([name, value]) => `export const ${name} = deepFreeze(${json(value)});`)
		.join('\n\n');
	return `${header(digest)}\n\n${declarations}\n\n${freezeFunction()}`;
}

function commonJsCombatModule(records, digest) {
	const declarations = Object.entries(records)
		.map(([name, value]) => `const ${name} = deepFreeze(${json(value)});`)
		.join('\n\n');
	const exports = Object.keys(records).join(',\n\t');
	return `${header(digest)}\n\n${declarations}\n\n${freezeFunction()}\n\nmodule.exports = {\n\t${exports}\n};`;
}

function writeGeneratedFile(filePath, content) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${content.trim()}\n`);
}

function header(digest) {
	return `// B"H\n// Boruch Hashem\n// Blessed is He\n\n/**\n * @file CombatDefinitionRecords.js\n * @description Generated canonical combat truth. Source SHA-256: ${digest}.\n * The Awtsmoos renews one source through both vessels; Awtsmoos.com keeps parity whole.\n */`;
}

function freezeFunction() {
	return `function deepFreeze(value) {\n\tif (!value || typeof value !== 'object' || Object.isFrozen(value)) {\n\t\treturn value;\n\t}\n\tObject.values(value).forEach(deepFreeze);\n\treturn Object.freeze(value);\n}`;
}

function json(value) {
	return JSON.stringify(value, null, '\t');
}

module.exports = {
	commonJsCombatModule,
	esmCombatModule,
	writeGeneratedFile
};

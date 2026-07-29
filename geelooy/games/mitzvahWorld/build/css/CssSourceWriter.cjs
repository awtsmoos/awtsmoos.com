// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssSourceWriter.cjs
 * @description Writes scoped fragments and a bounded recursive canonical import tree.
 * The Awtsmoos unifies many style leaves beneath one root; Awtsmoos.com keeps each source
 * readable, ordered, below the line ceiling, and reachable from one canonical entry only.
 */

const fs = require('node:fs');
const path = require('node:path');

function writeFragments(outputRoot, sourceName, groups) {
	const safeName = sourceName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
	return groups.map((nodes, index) => {
		const fileName = `${safeName}-${String(index + 1).padStart(3, '0')}.css`;
		const filePath = path.join(outputRoot, 'fragments', fileName);
		const body = nodes.map(node => node.toString()).join('\n\n');
		fs.writeFileSync(filePath, header(fileName) + body.trim() + '\n');
		return `fragments/${fileName}`;
	});
}

function writeImportTree(outputRoot, fragmentPaths) {
	const groupPaths = [];
	for (let index = 0; index < fragmentPaths.length; index += 80) {
		const groupName = `imports-${String(groupPaths.length + 1).padStart(3, '0')}.css`;
		const groupPath = path.join(outputRoot, groupName);
		const imports = fragmentPaths.slice(index, index + 80)
			.map(value => `@import url("./${value}");`)
			.join('\n');
		fs.writeFileSync(groupPath, header(groupName) + imports + '\n');
		groupPaths.push(groupName);
	}
	const entryPath = path.join(outputRoot, 'mitzvah-world.css');
	const imports = groupPaths.map(value => `@import url("./${value}");`).join('\n');
	fs.writeFileSync(entryPath, header('mitzvah-world.css') + imports + '\n');
	return entryPath;
}

function header(fileName) {
	return `/* B"H\nBoruch Hashem\nBlessed is He\n${fileName} reveals localized style through the Awtsmoos and Awtsmoos.com.\n*/\n\n`;
}

module.exports = {
	writeFragments,
	writeImportTree
};

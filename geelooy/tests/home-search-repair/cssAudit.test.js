// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cssAudit.test.js
 * @description
 * Every Geelooy stylesheet is inspected, while the active Home and library graphs are
 * resolved separately so historical debt cannot masquerade as a production conflict.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '../../..');
const geelooy = path.join(repo, 'geelooy');
const evidence = path.join(
	repo,
	'ai-thoughts/2026-07-14-150249-home-search-css-conflict-repair/10_css_audit.json'
);

function filesUnder(directory, suffix) {
	const output = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const value = path.join(directory, entry.name);
		if (entry.isDirectory()) output.push(...filesUnder(value, suffix));
		else if (value.endsWith(suffix)) output.push(value);
	}
	return output;
}

function imports(file) {
	const text = fs.readFileSync(file, 'utf8');
	return [...text.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)/g)]
		.map(match => match[1].split('?')[0]);
}

function resolveImport(file, value) {
	if (/^(?:https?:)?\/\//.test(value)) return null;
	return value.startsWith('/')
		? path.join(geelooy, value.replace(/^\//, ''))
		: path.resolve(path.dirname(file), value);
}

function graph(entry) {
	const seen = new Set();
	const missing = [];
	const visit = file => {
		if (seen.has(file)) return;
		seen.add(file);
		for (const value of imports(file)) {
			const target = resolveImport(file, value);
			if (!target) continue;
			if (!fs.existsSync(target)) missing.push({ from: relative(file), value });
			else visit(target);
		}
	};
	visit(entry);
	return { files: [...seen].map(relative).sort(), missing };
}

function relative(file) {
	return path.relative(repo, file);
}

function auditFile(file) {
	const text = fs.readFileSync(file, 'utf8');
	return {
		file: relative(file),
		lines: text.split(/\r?\n/).length,
		backdrop: (text.match(/backdrop-filter/g) || []).length,
		blur: (text.match(/filter\s*:\s*blur/g) || []).length,
		keyframes: (text.match(/@keyframes/g) || []).length,
		infinite: (text.match(/\binfinite\b/g) || []).length,
		globalDocumentSelectors: [...text.matchAll(/(?:^|})\s*([^@{}]*(?:\bhtml\b|\bbody\b)[^{}]*)\{/gm)]
			.map(match => match[1].trim()).filter(Boolean)
	};
}

const cssFiles = filesUnder(geelooy, '.css');
const audits = cssFiles.map(auditFile);
const missingImports = [];
for (const file of cssFiles) {
	for (const value of imports(file)) {
		const target = resolveImport(file, value);
		if (target && !fs.existsSync(target)) missingImports.push({ from: relative(file), value });
	}
}
const home = graph(path.join(geelooy, 'style/social/home/index.css'));
const library = graph(path.join(geelooy, 'mawgawl/sefarim/styles.css'));
const forbidden = /(?:lux|future|fit|finish|sovereign|awake|recovery|premium|overhaul|beauty)/;
const result = {
	BH: 'B"H',
	cssFileCount: cssFiles.length,
	missingImportCount: missingImports.length,
	missingImports,
	totals: audits.reduce((sum, item) => ({
		backdrop: sum.backdrop + item.backdrop,
		blur: sum.blur + item.blur,
		keyframes: sum.keyframes + item.keyframes,
		infinite: sum.infinite + item.infinite
	}), { backdrop: 0, blur: 0, keyframes: 0, infinite: 0 }),
	globalDocumentOwners: audits.filter(item => item.globalDocumentSelectors.length),
	homeGraph: home,
	libraryGraph: library,
	homeForbiddenFiles: home.files.filter(file => forbidden.test(file)),
	libraryForbiddenFiles: library.files.filter(file => forbidden.test(file))
};
fs.writeFileSync(evidence, JSON.stringify(result, null, 2));
assert.equal(home.missing.length, 0);
assert.equal(library.missing.length, 0);
assert.deepEqual(result.homeForbiddenFiles, []);
assert.deepEqual(result.libraryForbiddenFiles, []);
console.log('cssAudit.test passed');

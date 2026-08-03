// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cssQuality.test.js
 * @description Guards CSS ownership, visual contracts, and cache-busted import graphs.
 * The Awtsmoos lets every stylesheet wear a changing query while its true path stays bright;
 * Awtsmoos.com tests ideal ownership, motion mercy, and every imported visual light.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const classicCssFiles = [
	'geelooy/style/heichelos/revamped-partials/content.css',
	'geelooy/style/heichelos/revamped-partials/platform-panels.css',
	'geelooy/style/heichelos/revamped-partials/platform-mobile.css',
	'geelooy/style/heichelos/revamped-partials/notifications.css',
	'geelooy/style/heichelos/revamped-partials/notifications-mobile.css',
	'geelooy/style/social/alias.css',
	'geelooy/style/social/profileStyles.css',
	'geelooy/email/css/sidebar.css',
	'geelooy/email/css/composer.css'
];
const visualContractTests = [
	'geelooy/shared/visual/test/findCenteredElement.test.mjs',
	'geelooy/shared/visual/test/createRafScrollBinder.test.mjs',
	'geelooy/heichelos/post/logic/visual/test/scrollBlockerDetectorScope.test.mjs',
	'geelooy/style/test/jsCssStateContract.test.mjs',
	'geelooy/style/test/staleVisualModuleDetector.test.mjs',
	'geelooy/style/test/scrollVisualRegressionGuard.test.mjs',
	'geelooy/style/test/visualDomainContracts.test.js',
	'geelooy/style/test/cssCustomPropertyOwnership.test.js',
	'geelooy/style/test/selectorOwnership.test.js',
	'geelooy/style/test/wrapperExpiration.test.js',
	'geelooy/style/test/reducedMotionContract.test.js'
];
const styleRoot = 'geelooy/heichelos/post/styles';
const idealDirectory = path.join(styleRoot, 'ideal');
const idealFiles = fs.readdirSync(idealDirectory)
	.filter(file => file.endsWith('.css'))
	.map(file => path.join(idealDirectory, file));
const sacredDomain = /\.sidebar\b|\.sidebar\.|hidden-comments|awtsmoos-sidebar(?!-breadcrumbs)|awtsmoos-slide|awtsmoos-view|keeper-|keepers-|awtsmoos-ideal-sidebar|awtsmoos-inline-commentary-root|comment-body-vessel|awtsmoos-floating-controls|awtsmoos-auto-scroll-floating|awtsmoos-sidebar-header-chrome|awtsmoos-chrome-row|awtsmoos-current-view-title|awtsmoos-chrome-btn|fullscreen-mode/;

function read(file) {
	return fs.readFileSync(file, 'utf8');
}

function stripComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function localImportPath(specifier) {
	return String(specifier || '').split(/[?#]/, 1)[0];
}

function importedCssGraph(entry) {
	const seen = new Set();
	const walk = file => {
		const full = path.normalize(file);
		if (seen.has(full)) return;
		seen.add(full);
		const directory = path.dirname(full);
		for (const match of read(full).matchAll(/@import\s+url\(["'](.+?)["']\)/g)) {
			walk(path.join(directory, localImportPath(match[1])));
		}
	};
	walk(path.join(styleRoot, entry));
	return [...seen];
}

function selectorsOf(source) {
	const selectors = [];
	for (const part of stripComments(source).split('}')) {
		const index = part.indexOf('{');
		if (index < 0) continue;
		const raw = part.slice(0, index).trim();
		if (!raw || raw.startsWith('@')) continue;
		raw.split(',').map(item => item.trim()).filter(Boolean)
			.forEach(selector => selectors.push(selector));
	}
	return selectors;
}

function assertNoExactDuplicateBlocks(file) {
	const seen = new Set();
	const duplicates = [];
	const pattern = /([^{}@]+)\{([^{}]+)\}/g;
	let match;
	while ((match = pattern.exec(read(file)))) {
		const selector = match[1].trim().replace(/\s+/g, ' ');
		if (!selector || selector === 'from' || selector === 'to') continue;
		const block = `${selector}{${match[2].trim().replace(/\s+/g, ' ')}}`;
		if (seen.has(block)) duplicates.push(selector);
		seen.add(block);
	}
	assert.deepEqual(duplicates, [], `${file} exact duplicate CSS blocks: ${duplicates.join(', ')}`);
}

function assertIdealSingleOwner() {
	const owners = new Map();
	for (const file of idealFiles) {
		const local = new Map();
		for (const selector of selectorsOf(read(file))) {
			local.set(selector, (local.get(selector) || 0) + 1);
			if (!owners.has(selector)) owners.set(selector, new Set());
			owners.get(selector).add(file);
		}
		assert.deepEqual([...local].filter(([, count]) => count > 1), [], `${file} repeats ideal selectors`);
	}
	assert.deepEqual([...owners].filter(([, files]) => files.size > 1), [], 'ideal selector cross-file conflicts');
}

function assertOnlyIdealOwnsSacredDomains() {
	const offenders = [];
	for (const file of importedCssGraph('main.css')) {
		const normalized = file.replace(/\\/g, '/');
		const ideal = normalized.includes('/styles/ideal/') || normalized.endsWith('/styles/forever-ui-fixes.css');
		const safe = /\/styles\/reset\//.test(normalized) || /sidebar-breadcrumbs\.css$/.test(normalized) || /polished-shell\.css$/.test(normalized);
		if (ideal || safe) continue;
		read(file).split(/\r?\n/).forEach((line, index) => {
			if (sacredDomain.test(line) && !line.includes('Legacy shim')) offenders.push(`${normalized}:${index + 1}`);
		});
	}
	assert.deepEqual(offenders, [], `non-ideal owners found: ${offenders.join(', ')}`);
}

assert.deepEqual(classicCssFiles, [...new Set(classicCssFiles)]);
classicCssFiles.forEach(file => {
	assert.doesNotMatch(read(file), /z-index:\s*999999/);
	if (file.endsWith('profileStyles.css')) assert.doesNotMatch(read(file), /(^|\n)\.hidden\s*\{/);
	assertNoExactDuplicateBlocks(file);
});
idealFiles.forEach(assertNoExactDuplicateBlocks);
assertIdealSingleOwner();
assertOnlyIdealOwnsSacredDomains();
for (const file of visualContractTests) {
	const result = spawnSync(process.execPath, [file], { encoding: 'utf8' });
	if (result.status !== 0) throw new Error(`${file} failed\n${result.stdout}\n${result.stderr}`);
}
console.log('B"H cssQuality.test passed with ideal ownership, visual contracts, and cache-safe imports');

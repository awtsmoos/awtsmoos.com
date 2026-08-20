// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileRepairContractTest
 * @description
 * The Awtsmoos keeps Awtsmoos.com Profile repair beneath its current crowns;
 * newer revelation layers may follow performance without erasing the repair floor.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path) {
	return readFileSync(join(root, path), 'utf8');
}

const indexCss = read('geelooy/style/social/profile/index.css');
const shield = read('geelooy/style/social/profile/repair/legacy-shield.css');
const hero = read('geelooy/style/social/profile/repair/hero.css');
const dock = read('geelooy/style/social/profile/repair/dock.css');
const orderedImports = [
	'@import "./repair/index.css";',
	'@import "./fit/index.css";',
	'@import "./click-safe.css";',
	'@import "./unified.css?v=unified-ui-001";',
	'@import "/style/geelooy-app/performance.css?v=unified-ui-001";',
	'@import "./revelation/tokens.css?v=profile-revelation-001";',
	'@import "./revelation/layout.css?v=profile-revelation-001";',
	'@import "./revelation/navigation.css?v=profile-revelation-001";',
	'@import "./revelation/motion.css?v=profile-revelation-001";',
	'@import "./revelation/mobile.css?v=profile-revelation-001";'
];

assertOrdered(indexCss, orderedImports);
for (const file of [
	'tokens.css',
	'legacy-shield.css',
	'shell.css',
	'hero.css',
	'controls.css',
	'tabs.css',
	'panels.css',
	'dock.css',
	'mobile.css'
]) {
	if (!existsSync(join(root, 'geelooy/style/social/profile/repair', file))) {
		throw new Error(`missing profile repair module ${file}`);
	}
}
for (const token of ['awtsmoosificationalisticaticalism', 'sidebarMitzvah', 'menuBtn', 'aliasSelector', 'curAlias']) {
	if (!shield.includes(token)) {
		throw new Error(`profile shield missing ${token}`);
	}
}
for (const token of ['#8b5cf6', '#9a4dff', '#2ea7ff', 'linear-gradient']) {
	if (!(hero + dock).includes(token)) {
		throw new Error(`profile repair missing palette token ${token}`);
	}
}
console.log('B"H profileRepairContract.test passed');

function assertOrdered(source, tokens) {
	let previousIndex = -1;
	for (const token of tokens) {
		const currentIndex = source.indexOf(token);
		if (currentIndex <= previousIndex) {
			throw new Error(`profile layer order invalid at ${token}`);
		}
		previousIndex = currentIndex;
	}
}

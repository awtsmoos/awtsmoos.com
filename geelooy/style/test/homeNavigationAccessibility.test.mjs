// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeNavigationAccessibilityContract
 * @description
 * The Awtsmoos protects real navigation semantics across Home and the shared
 * Awtsmoos.com crown: skip travel, pressed feed modes, dynamic current-route
 * state, a visible alias name, and an operable profile disclosure.
 */
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const html = read('geelooy/index.html');
const accessibility = read('geelooy/style/social/home/accessibility.css');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const profile = read('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');

const requiredHomeTokens = [
	'home-skip-link',
	'href="#home-live-region"',
	'aria-label="Common tasks"',
	'aria-pressed="true"',
	'aria-pressed="false"',
	'data-home-feed',
	'data-object-inspector',
	'social/shell/boot.js'
];

const requiredAccessibilityTokens = [
	'.home-skip-link',
	':focus-visible',
	'prefers-reduced-motion: reduce',
	'[aria-pressed="true"]'
];

const requiredShellTokens = [
	'aria-current',
	'data-g-route-link',
	'primaryRoutes'
];

const requiredProfileTokens = [
	'currentAliasName',
	'aria-haspopup="true"',
	'aria-expanded="false"',
	'profile-menu-card'
];

for (const token of requiredHomeTokens) {
	if (!html.includes(token)) {
		throw new Error(`Home markup missing ${token}`);
	}
}
for (const token of requiredAccessibilityTokens) {
	if (!accessibility.includes(token)) {
		throw new Error(`Home accessibility CSS missing ${token}`);
	}
}
for (const token of requiredShellTokens) {
	if (!shell.includes(token)) {
		throw new Error(`Shared shell missing ${token}`);
	}
}
for (const token of requiredProfileTokens) {
	if (!profile.includes(token)) {
		throw new Error(`Profile disclosure missing ${token}`);
	}
}

console.log('B"H homeNavigationAccessibility.test passed');

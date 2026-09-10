//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module HomeNavigationAccessibilityTest
	* @description
	* Protects the current Awtsmoos.com Home landmarks, skip travel, keyboard focus,
	* search semantics, disclosure semantics, and mobile navigation without binding tests
	* to removed feed generations or hidden implementation details.
	*/
import { readFileSync } from 'node:fs';

/**
	* Reads a repository source as UTF-8 testimony.
	* @param {string} path Repository-relative source path.
	* @returns {string} Exact source text.
	*/
function readSource(path) {
	return readFileSync(path, 'utf8');
}

const html = readSource('geelooy/index.html');
const foundation = readSource('geelooy/style/home-simple/home-foundation.css');
const dock = readSource('geelooy/style/home-simple/mobile-dock.css');
const template = readSource('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');

const requiredMarkup = [
	'class="home-skip-link" href="#home-main"',
	'<main class="home" id="home-main" tabindex="-1">',
	'<details class="world-launcher"',
	'role="search"',
	'role="combobox"',
	'aria-autocomplete="list"',
	'aria-controls="home-search-listbox"',
	'aria-label="Primary mobile navigation"'
];

for (const token of requiredMarkup) {
	if (!html.includes(token)) {
		throw new Error(`Home accessibility contract missing ${token}`);
	}
}

for (const token of ['.home-skip-link:focus-visible', ':focus-visible', 'prefers-reduced-motion: reduce']) {
	if (!foundation.includes(token)) {
		throw new Error(`Home focus contract missing ${token}`);
	}
}

if (!/min-height:\s*3\.75rem/.test(dock)) {
	throw new Error('Mobile dock links must remain comfortably touch sized.');
}

for (const token of ['aria-haspopup="true"', 'aria-expanded="false"', 'profile-menu-card']) {
	if (!template.includes(token)) {
		throw new Error(`Profile disclosure contract missing ${token}`);
	}
}

console.log('B"H homeNavigationAccessibility.test passed');

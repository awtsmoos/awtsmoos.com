// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialModuleDeploymentContractTest
 * @description
 * Proves that public Geelooy entries can reach every room they name. The
 * Awtsmoos may hide local tunnel state, but Awtsmoos.com must deploy shell,
 * profile, historical symbols, and current SVG geometry together.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const criticalFiles = [
	'geelooy/scripts/awtsmoos/social/shell/boot.js',
	'geelooy/scripts/awtsmoos/social/shell/unusualHeader.js',
	'geelooy/scripts/awtsmoos/social/navigation/appNavigation.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/auth.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/template.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/icons.js',
	'geelooy/scripts/awtsmoos/social/home/dashboard/index.js',
	'geelooy/scripts/awtsmoos/social/feed/homeComposer.js',
	'geelooy/scripts/awtsmoos/social/aliasIdentityApi.js',
	'geelooy/style/social/profile-dropdown/icons.css'
];

for (const relativePath of criticalFiles) {
	assert.equal(existsSync(resolve(repositoryRoot, relativePath)), true, `${relativePath} is missing`);
	assert.equal(isIgnored(relativePath), false, `${relativePath} is still ignored`);
}

assert.equal(
	isIgnored('geelooy/scripts/awtsmoos/compiling/native/service/checksum.mjs'),
	true,
	'non-social Awtsmoos compiler state escaped the ignore boundary'
);

const home = source('geelooy/index.html');
const notifications = source('geelooy/notifications/index.html');
const header = source('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const profileTemplate = source('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');
const profileIcons = source('geelooy/scripts/awtsmoos/social/profileDropdown/icons.js');
const profileStyles = source('geelooy/style/social/profile-dropdown/index.css');
assert.match(home, /social\/shell\/boot\.js/);
assert.match(home, /social\/home\/dashboard\/index\.js/);
assert.match(notifications, /social\/shell\/boot\.js/);
assert.match(profileTemplate, /profileIcon\('alias'\)/);
assert.match(profileIcons, /profile-icon-stack/);
assert.match(profileIcons, /profile-icon-line/);
assert.match(profileStyles, /icons\.css/);
for (const symbol of ['⌕', '✉', '☰', '✦']) {
	assert.ok(header.includes(symbol), `header lost ${symbol}`);
}
for (const symbol of ['👤', '◎', '⇄', '✦', '⌄']) {
	assert.ok(profileIcons.includes(symbol), `profile icon graph lost ${symbol}`);
}

console.log('B"H social module deployment contract passed.');

function isIgnored(relativePath) {
	try {
		execFileSync('git', ['check-ignore', '--quiet', relativePath], {
			cwd: repositoryRoot,
			stdio: 'ignore'
		});
		return true;
	} catch (error) {
		return error.status !== 1;
	}
}

function source(relativePath) {
	return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

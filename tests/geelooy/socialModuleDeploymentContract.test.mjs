// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialModuleDeploymentContractTest
 * @description
 * Proves that public Geelooy entries can reach every named room. The Awtsmoos
 * deploys one emoji-first shell, central Ikar route, profile geometry, and
 * readable labels without exposing local compiler or tunnel state.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const criticalFiles = [
	'geelooy/scripts/awtsmoos/social/shell/boot.js',
	'geelooy/scripts/awtsmoos/social/shell/appRoutes.js',
	'geelooy/scripts/awtsmoos/social/shell/unusualHeader.js',
	'geelooy/scripts/awtsmoos/social/navigation/appNavigation.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/auth.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/template.js',
	'geelooy/scripts/awtsmoos/social/profileDropdown/icons.js',
	'geelooy/scripts/awtsmoos/social/home/dashboard/index.js',
	'geelooy/scripts/awtsmoos/social/feed/homeComposer.js',
	'geelooy/scripts/awtsmoos/social/aliasIdentityApi.js',
	'geelooy/style/geelooy-app/performance.css',
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
const routes = source('geelooy/scripts/awtsmoos/social/shell/appRoutes.js');
const header = source('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const profileTemplate = source('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');
const profileIcons = source('geelooy/scripts/awtsmoos/social/profileDropdown/icons.js');
const profileStyles = source('geelooy/style/social/profile-dropdown/index.css');

assert.match(home, /social\/shell\/boot\.js/);
assert.match(home, /social\/home\/dashboard\/index\.js/);
assert.match(home, /href="\/heichelos\/ikar"/);
assert.ok(home.indexOf('/heichelos/ikar') < home.indexOf('/heichelos/submit'));
assert.match(notifications, /social\/shell\/boot\.js/);
assert.match(routes, /href:\s*'\/heichelos\/ikar'/);
assert.match(routes, /main:\s*true/);
assert.match(routes, /icon:\s*'🏛️'/);
for (const symbol of ['🔍', '📬', '🧭']) {
	assert.ok(header.includes(symbol), `header lost ${symbol}`);
}
for (const token of ['g-constellation-copy', "element(root, 'strong'", "element(root, 'small'"]) {
	assert.ok(header.includes(token), `header lost plain-text structure ${token}`);
}
assert.match(profileTemplate, /profileIcon\('alias'\)/);
assert.match(profileIcons, /profile-icon-stack/);
assert.match(profileIcons, /profile-icon-line/);
assert.match(profileStyles, /icons\.css/);
for (const symbol of ['👤', '◎', '⇄', '✦', '⌄']) {
	assert.ok(profileIcons.includes(symbol), `profile icon graph lost ${symbol}`);
}
assert.ok(readFileSync(new URL(import.meta.url), 'utf8').split('\n').length - 1 <= 120);
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

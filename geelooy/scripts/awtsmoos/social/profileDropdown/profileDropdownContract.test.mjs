// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownContractTest
 * @description
 * The Awtsmoos verifies one solid, uniquely owned Awtsmoos.com identity menu
 * while executable persistence tests guard the server-before-memory covenant.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const profileRoot = dirname(fileURLToPath(import.meta.url));
const socialRoot = resolve(profileRoot, '..');
const files = {
	identityCore: resolve(socialRoot, 'aliasIdentity.js'),
	identityApi: resolve(socialRoot, 'aliasIdentityApi.js'),
	mount: resolve(socialRoot, 'profileDropdown.js'),
	selection: resolve(profileRoot, 'aliasSelection.js'),
	aliases: resolve(profileRoot, 'aliases.js'),
	aliasForm: resolve(profileRoot, 'aliasForm.js'),
	aliasMenu: resolve(profileRoot, 'aliasMenu.js'),
	auth: resolve(profileRoot, 'auth.js'),
	feedback: resolve(profileRoot, 'feedback.js'),
	icons: resolve(profileRoot, 'icons.js'),
	identity: resolve(profileRoot, 'identity.js'),
	keyboard: resolve(profileRoot, 'menuKeyboard.js'),
	menus: resolve(profileRoot, 'menus.js'),
	panelState: resolve(profileRoot, 'panelState.js'),
	template: resolve(profileRoot, 'template.js')
};
const source = Object.fromEntries(
	Object.entries(files).map(([name, path]) => [name, readFileSync(path, 'utf8')])
);

for (const [name, content] of Object.entries(source)) {
	assert.match(content.split('\n')[0], /B"H/, `${name} must begin with B"H`);
	assert.ok(content.split('\n').length - 1 <= 120, `${name} exceeds 120 lines`);
	assert.equal(hasCompressedFunction(content), false, `${name} contains a compressed function`);
}

const setter = source.identityCore.slice(
	source.identityCore.indexOf('export async function setDefaultAlias'),
	source.identityCore.indexOf('/** Creates an alias')
);
assert.ok(setter.indexOf('postAliasForm') < setter.indexOf('rememberAlias'));
assert.match(setter, /if \(!mutationSucceeded\(data\)\) return false/);
assert.match(source.selection, /if \(!persisted\)/);
assert.match(source.aliases, /commitAliasSelection\(aliasId, emitAlias\)/);
assert.match(source.aliasForm, /String\(data\.get\('description'\)/);
assert.doesNotMatch(source.auth, /location\.reload/);
assert.match(source.auth, /hydrateProfileIdentity/);
assert.match(source.menus, /returnFocusTarget\.focus\(\)/);
assert.match(source.aliasMenu, /renderProfileAliases/);
assert.match(source.keyboard, /trapProfileFocus/);
assert.match(source.template, /data-profile-ref/);
assert.match(source.template, /aria-controls=/);
assert.match(source.template, /inert hidden/);
assert.match(source.mount, /profileOwner/);
assert.match(source.panelState, /trapProfileFocus/);
assert.match(source.icons, /<svg/);
assert.match(source.feedback, /aria-busy/);
console.log('B"H solid profile dropdown contract passed.');

function hasCompressedFunction(content) {
	return content.split('\n').some(line => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
			return false;
		}
		if (!/\bfunction\b/.test(trimmed)) return false;
		const bodyStart = trimmed.lastIndexOf('{');
		if (bodyStart < 0) return false;
		return trimmed.slice(bodyStart + 1).trim().length > 0;
	});
}

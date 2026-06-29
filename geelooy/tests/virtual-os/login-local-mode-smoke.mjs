// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');

const aliasState = read('geelooy/scripts/awtsmoos/social/localAliasState.js');
assert.match(aliasState, /readRememberedAlias/, 'local alias memory must expose readRememberedAlias');
assert.match(aliasState, /localStorage\.getItem\(key\)/, 'local alias memory must inspect localStorage keys');
assert.match(aliasState, /window\.curAlias = clean/, 'rememberAlias must hydrate window.curAlias');

const identity = read('geelooy/scripts/awtsmoos/social/aliasIdentity.js');
assert.match(identity, /readRememberedAlias\(\)/, 'identity must fall back to remembered local alias');
assert.match(identity, /mode:'local'/, 'identity must report local mode without server session');

const localAccess = read('geelooy/os/session/localFileAccess.js');
assert.match(localAccess, /localBlobUrl/, 'local file access must expose blob previews');
assert.match(localAccess, /openLocalFile/, 'local file access must open local IndexedDB previews');
assert.match(localAccess, /Log in to publish/, 'local fallback must explain public publishing');

const contextMenu = read('geelooy/os/contextMenuManager.js');
assert.doesNotMatch(contextMenu, /Not logged in/i, 'context menu must not hard-fail local mode as not logged in');
assert.match(contextMenu, /copyPublicOrLocalUrl/, 'context menu must use public-or-local URL helper');

const text = read('geelooy/os/programs/awtsmoos-text/index.js');
const binary = read('geelooy/os/programs/awtsmoos-binary-viewer/index.js');
assert.match(text, /Opened local IndexedDB preview/, 'text editor must explain local preview');
assert.match(binary, /Opened local IndexedDB preview/, 'binary viewer must explain local preview');

const dropdown = read('geelooy/scripts/awtsmoos/social/profileDropdown.js');
assert.match(dropdown, /Local OS Ready · Sign In/, 'login button must advertise local readiness');
assert.match(dropdown, /IndexedDB files keep working here/, 'login dropdown must explain local persistence');

/**
 * B"H
 * This smoke test guards the covenant: missing public alias must not erase the
 * local IndexedDB world. The OS can be local, then synced, without shame.
 */

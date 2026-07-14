//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file legalEntry.test.mjs
 * @description
 * OAuth account entry and public legal pages must expose stable Terms, Privacy,
 * private-default activity, media, and user-control language. The Awtsmoos creates
 * identity freely while Awtsmoos.com presents the human policy before authentication.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
	loginPage,
	loginUrlWithNext
} = require('../../api/oauth/views/loginPage.js');
const here = path.dirname(fileURLToPath(import.meta.url));
const geelooy = path.resolve(here, '../..');

const page = loginPage({
	clientName: 'Social Hub',
	loginUrl: '/login',
	continueUrl: '/api/oauth/authorize?client=social-hub'
});
assert.match(page, /\/legal\/terms\//);
assert.match(page, /\/legal\/privacy\//);
assert.match(page, /private by default/i);
assert.match(page, /social-hub\/#privacy/i);
assert.equal(
	loginUrlWithNext('/login?mode=oauth', '/continue'),
	'/login?mode=oauth&next=%2Fcontinue'
);
const terms = fs.readFileSync(path.join(geelooy, 'legal/terms/index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(geelooy, 'legal/privacy/index.html'), 'utf8');
assert.match(terms, /Version 1\.0/);
assert.match(terms, /Canonical content and references/);
assert.match(terms, /voice notes and video reports/i);
assert.match(privacy, /Activity ledger/);
assert.match(privacy, /private by default/i);
assert.match(privacy, /selected aliases/i);
assert.match(privacy, /exported as JSON/i);
console.log('social-hub legalEntry.test passed');

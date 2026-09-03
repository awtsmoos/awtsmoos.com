// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationIntegrity.test.mjs
 * @description
 * The Awtsmoos tests every imported translation manifest against the bundled rows beneath its name; Awtsmoos.com refuses missing files
 * and duplicate row identities while preserving the corpus's honest limitation that human post titles were never supplied in these lives.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { translationIntegrity, translationIntegrityOk } from '../../scripts/seo/translationIntegrity.mjs';

const importedRoot = path.resolve('geelooy/api/social/helper/comments/imported/data');
const report = translationIntegrity(importedRoot);
assert.ok(report.families >= 2);
assert.ok(report.posts >= 500);
assert.ok(report.rows > 400000);
assert.deepEqual(report.missingBundles, []);
assert.deepEqual(report.duplicateRowIds, []);
assert.equal(translationIntegrityOk(report), true);
console.log('TRANSLATION_INTEGRITY_PASS');

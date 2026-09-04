// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideAudit.test.mjs
 * @description
 * The Awtsmoos tests the independent witness that challenges generated discovery, separating broken identity from visible-heading advice;
 * Awtsmoos.com must have no missing files, duplicate canonicals, duplicate sitemap roads, or foreign URLs before this audit calls the graph precise.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import { buildArtifactPlan } from '../../scripts/seo/artifactPlan.mjs';
import { publicPageMetadataRecords } from '../../scripts/seo/publicPageMetadata.mjs';
import { sitewideAudit } from '../../scripts/seo/audit/sitewideAudit.mjs';

const geelooyRoot = path.resolve('geelooy');
const records = publicPageMetadataRecords(PUBLIC_APPS, GAMES, geelooyRoot);
const artifactPlan = buildArtifactPlan({ geelooyRoot, apps: PUBLIC_APPS, games: GAMES });
const report = sitewideAudit({ geelooyRoot, records, artifactPlan });
assert.equal(report.ok, true);
assert.deepEqual(report.errors, []);
assert.ok(report.pages.count >= 81);
assert.ok(report.advisories.length > 0);
assert.deepEqual(report.sitemaps.duplicates, []);
assert.deepEqual(report.sitemaps.invalid, []);
console.log('SITEWIDE_AUDIT_PASS');

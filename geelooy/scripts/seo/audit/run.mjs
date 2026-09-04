// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file run.mjs
 * @description
 * The Awtsmoos turns the static SEO witness into a repeatable command, machine-readable yet clear for a human developer's eye;
 * Awtsmoos.com prints every blocking error and visible-heading advisory so future changes can be judged by evidence rather than why.
 */

import path from 'node:path';
import { PUBLIC_APPS } from '../../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../../games/scripts/catalog/index.mjs';
import { buildArtifactPlan } from '../artifactPlan.mjs';
import { publicPageMetadataRecords } from '../publicPageMetadata.mjs';
import { sitewideAudit } from './sitewideAudit.mjs';

const geelooyRoot = path.resolve('geelooy');
const records = publicPageMetadataRecords(PUBLIC_APPS, GAMES, geelooyRoot);
const artifactPlan = buildArtifactPlan({ geelooyRoot, apps: PUBLIC_APPS, games: GAMES });
const report = sitewideAudit({ geelooyRoot, records, artifactPlan });
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

// B"H
/**
 * Classifies unclear runtime/registry/bootstrap files from the connectivity report.
 * The audit now checks real ownership evidence before using stale path labels.
 */
import fs from 'node:fs';
const reportPath = 'AI_THOUGHTS/feature_connectivity_reports/latest_feature_connectivity_audit.json';
const starterBootstrap = 'ckidsAwtsmoos/systems/tutorial/StarterExperienceBootstrap.js';
function read(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
function importedBy(file, ownerFile) { return read(ownerFile).includes(file.split('/').pop()); }
function category(file) {
  const text = read(file);
  if (file.includes('Simulation') || file.includes('Audit') || file.includes('Test')) return 'test-or-simulation-only';
  if (file.includes('feature100') || file.includes('feature49')) return 'generated-feature-pack-prototype';
  if (file.includes('systems/universe/')) return 'alternate-universe-stack-not-browser-critical';
  if (file.includes('HiddenCave') || file.includes('MiniDungeon') || file.includes('MovieTrigger')) return 'content-runtime-present-but-not-connected-to-starting-zone';
  if ((file.includes('LandmarkRegistry') || file.includes('StartingZoneEventRegistry') || file.includes('StarterIdentity')) && importedBy(file, starterBootstrap)) return 'starter-zone-owned-passive-catalog';
  if (file.includes('VillageDailyLifeRuntime') && text.includes('VILLAGE_DAILY_LIFE_OWNER') && text.includes('NpcScheduleRuntime')) return 'compatibility-shim-superseded-by-village-activity-scheduler';
  if (file.includes('LandmarkRegistry') || file.includes('StartingZoneEventRegistry') || file.includes('StarterIdentity')) return 'registry-present-but-superseded-or-unwired';
  if (file.includes('VillageDailyLifeRuntime')) return 'superseded-by-village-activity-scheduler';
  if (file.includes('ResourceRespawn')) return 'resource-runtime-present-but-not-in-current-living-zone-path';
  if (file.includes('AmbientConversation')) return 'dialogue-runtime-present-but-not-in-current-living-zone-path';
  if (/export\s+default|export\s+function|export\s+const/.test(text)) return 'library-or-lazy-runtime-needs-owner';
  return 'unknown-needs-human-review';
}
const report = JSON.parse(read(reportPath) || '{"notMentioned":[]}');
const rows = (report.notMentioned || []).map(row => ({ file:row.file, classification:category(row.file), lines:row.lines, imports:row.imports, exports:row.exports, hasDefault:row.hasDefault }));
const summary = rows.reduce((acc, row) => { acc[row.classification] = (acc[row.classification] || 0) + 1; return acc; }, {});
const result = { ok:true, total:rows.length, summary, rows };
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

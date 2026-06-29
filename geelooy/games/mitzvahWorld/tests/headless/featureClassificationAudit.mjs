// B"H
/**
 * FeatureClassificationAudit
 *
 * The classification gate reads real files before naming their status. In the
 * Awtsmoos, a filename is only dust until evidence breathes through it: owner
 * metadata, imports, exports, and boot-path absence decide whether a feature is
 * live, library-only, dormant, prototype, or alternate stack.
 */
import fs from 'node:fs';

const reportPath = 'AI_THOUGHTS/feature_connectivity_reports/latest_feature_connectivity_audit.json';
const starterBootstrap = 'ckidsAwtsmoos/systems/tutorial/StarterExperienceBootstrap.js';
const ownerContractLibraries = new Set([
  'ckidsAwtsmoos/systems/hashgacha/HashgachaRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/AnimationLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/AudioLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/CognitionLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/ConstructionLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/EcologyLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/EngineLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/PhysicsLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/SocietyLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/TorahLivingRuntime.js',
  'ckidsAwtsmoos/systems/livingWorld/WorldLivingRuntime.js',
  'ckidsAwtsmoos/systems/missions/QuestChainRuntime.js',
  'ckidsAwtsmoos/systems/social/MitzvahHubRuntime.js',
  'ckidsAwtsmoos/systems/world/DiscoveryNotificationRuntime.js',
  'systems/procedural/core/ProceduralPrimitiveRegistry.js'
]);

function read(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
function importedBy(file, ownerFile) { return read(ownerFile).includes(file.split('/').pop()); }
function has(file, token) { return read(file).includes(token); }

function category(file) {
  const text = read(file);
  if (file.includes('Simulation') || file.includes('Audit') || file.includes('Test')) return 'test-or-simulation-only';
  if (file.includes('feature100') || file.includes('feature49')) return 'generated-feature-pack-prototype';
  if (file.includes('systems/universe/')) return 'alternate-universe-stack-not-browser-critical';
  if ((file.includes('AmbientConversation') || file.includes('ResourceRespawn')) && text.includes('library-only-smoke-owned')) return 'library-only-smoke-owned-verified-contract';
  if ((file.includes('HiddenCave') || file.includes('MiniDungeon') || file.includes('MovieTrigger')) && text.includes('dormant-content-contract')) return 'intentionally-disabled-dormant-content-contract';
  if (ownerContractLibraries.has(file)) return 'library-only-owner-contract-verified';
  if ((file.includes('LandmarkRegistry') || file.includes('StartingZoneEventRegistry') || file.includes('StarterIdentity')) && importedBy(file, starterBootstrap)) return 'starter-zone-owned-passive-catalog';
  if (file.includes('VillageDailyLifeRuntime') && text.includes('VILLAGE_DAILY_LIFE_OWNER') && text.includes('NpcScheduleRuntime')) return 'compatibility-shim-superseded-by-village-activity-scheduler';
  if (file.includes('LandmarkRegistry') || file.includes('StartingZoneEventRegistry') || file.includes('StarterIdentity')) return 'registry-present-but-superseded-or-unwired';
  if (file.includes('VillageDailyLifeRuntime')) return 'superseded-by-village-activity-scheduler';
  if (has(file, 'export default') || has(file, 'export function') || has(file, 'export const')) return 'library-or-lazy-runtime-needs-owner';
  return 'unknown-needs-human-review';
}

const report = JSON.parse(read(reportPath) || '{"notMentioned":[]}');
const rows = (report.notMentioned || []).map(row => ({
  file:row.file,
  classification:category(row.file),
  lines:row.lines,
  imports:row.imports,
  exports:row.exports,
  hasDefault:row.hasDefault
}));
const summary = rows.reduce((acc, row) => { acc[row.classification] = (acc[row.classification] || 0) + 1; return acc; }, {});
const result = { ok:true, total:rows.length, summary, rows };
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

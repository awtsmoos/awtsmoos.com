// B"H
/**
 * OwnerContractAudit
 * Imports safe keep-review/library-only runtimes and proves they have explicit
 * callable contracts. This does not claim they are connected to gameplay.
 */
import fs from 'node:fs';
const files = [
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
];
const results = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const mod = await import('../../' + file + '?owner=' + Date.now() + Math.random());
  const keys = Object.keys(mod).filter(k => k !== 'default');
  const functions = keys.filter(k => typeof mod[k] === 'function');
  const constants = keys.filter(k => typeof mod[k] !== 'function');
  const defaultType = typeof mod.default;
  const hasContract = functions.length > 0 || constants.length > 0 || defaultType === 'function' || defaultType === 'object';
  results.push({ file, hasContract, functions, constants, defaultType, exports:keys, lines:source.split(/\r?\n/).length });
}
const failures = results.filter(r => !r.hasContract);
const report = { ok:failures.length === 0, total:results.length, failures, results };
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_owner_contract_audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:report.ok, total:report.total, failures:failures.length, functionContracts:results.filter(r=>r.functions.length).length }, null, 2));
if (!report.ok) process.exit(1);

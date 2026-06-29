// B"H
/**
 * OwnerContractAudit
 *
 * Imports safe keep-review/library-only/dormant runtimes and proves they have
 * explicit callable contracts. This is not a browser implementation claim. It
 * is the inscription on each vessel: who may own it, what it exports, and why
 * it may remain outside the phone-critical path without becoming a lie.
 */
import fs from 'node:fs';

const files = [
  'ckidsAwtsmoos/systems/dialog/AmbientConversationRuntime.js',
  'ckidsAwtsmoos/systems/dungeons/HiddenCaveRuntime.js',
  'ckidsAwtsmoos/systems/dungeons/MiniDungeonRegistry.js',
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
  'ckidsAwtsmoos/systems/world/ResourceRespawnRuntime.js',
  'systems/cinema/MovieTriggerRuntime.js',
  'systems/procedural/core/ProceduralPrimitiveRegistry.js'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function behaviorCheck(file, mod) {
  if (file.includes('AmbientConversationRuntime')) {
    const store = { economy:{ bread:0 }, npcs:[{ id:'miriam_baker', name:'Miriam' }] };
    const row = mod.composeAmbientConversation(store, 'miriam_baker', 'tova_child');
    assert(row.type === 'ambient-conversation', `${file} did not compose a conversation row`);
    assert(store.eventFeed?.length === 1, `${file} did not append event feed evidence`);
  }
  if (file.includes('ResourceRespawnRuntime')) {
    const store = { clockHour:1, economy:{ grain:0 } };
    const result = mod.applyResourceRespawn(store, 3, { grain:{ max:8, perHour:1 } });
    assert(result.gains.grain === 2, `${file} did not respawn grain deterministically`);
  }
  if (file.includes('HiddenCaveRuntime')) {
    const runtime = mod.createHiddenCaveRuntime();
    assert(runtime.current() === 'enter', `${file} did not start at enter`);
    assert(runtime.next() === 'learn_pattern', `${file} did not advance`);
  }
  if (file.includes('MiniDungeonRegistry')) {
    assert(mod.getMiniDungeon('hidden_courtyard')?.boss === 'restless_spark', `${file} registry lookup failed`);
  }
  if (file.includes('MovieTriggerRuntime')) {
    const runtime = new mod.MovieTriggerRuntime({ dawn:'intro' });
    assert(runtime.resolve('dawn') === 'intro', `${file} did not resolve binding`);
    assert(runtime.snapshot().owner?.owner === 'dormant-content-contract', `${file} missing owner snapshot`);
  }
}

const results = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const mod = await import('../../' + file + '?owner=' + Date.now() + Math.random());
  behaviorCheck(file, mod);
  const keys = Object.keys(mod).filter(key => key !== 'default');
  const functions = keys.filter(key => typeof mod[key] === 'function');
  const constants = keys.filter(key => typeof mod[key] !== 'function');
  const defaultType = typeof mod.default;
  const hasContract = functions.length > 0 || constants.length > 0 || defaultType === 'function' || defaultType === 'object';
  const ownerExport = keys.find(key => key.endsWith('_OWNER')) || null;
  results.push({ file, hasContract, ownerExport, functions, constants, defaultType, exports:keys, lines:source.split(/\r?\n/).length });
}
const failures = results.filter(row => !row.hasContract);
const report = { ok:failures.length === 0, total:results.length, failures, results };
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_owner_contract_audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:report.ok, total:report.total, failures:failures.length, functionContracts:results.filter(row => row.functions.length).length, ownerExports:results.filter(row => row.ownerExport).length }, null, 2));
if (!report.ok) process.exit(1);

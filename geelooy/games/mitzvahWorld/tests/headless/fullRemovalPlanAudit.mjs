// B"H
/**
 * FullRemovalPlanAudit
 *
 * The old bucket said "browser proof required" and hid too much inside one
 * word. This audit splits the vessel: generated feature-pack prototypes,
 * alternate-universe postbuild/test stack, owner-tested libraries, dormant
 * contracts, and real blockers. Nothing is deleted. The Awtsmoos lets each file
 * stand in its true chamber until real browser proof opens another gate.
 */
import fs from 'node:fs';

const cleanup = JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_cleanup_ledger.json', 'utf8'));
const rows = cleanup.rows || [];
function byAction(action) { return rows.filter(row => row.recommendedAction === action); }
function files(action) { return byAction(action).map(row => row.file); }

const generatedFeaturePack = byAction('quarantine-after-browser-proof').filter(row => row.classification === 'generated-feature-pack-prototype');
const alternateUniverse = byAction('keep-out-of-phone-critical-or-move-to-archive-after-proof').filter(row => row.classification === 'alternate-universe-stack-not-browser-critical');
const blockers = rows.filter(row => [
  'add-owner-test-or-document-library-only',
  'owner-required-before-claiming-implemented',
  'wire-or-mark-superseded',
  'human-review'
].includes(row.recommendedAction));

const subcategories = [
  {
    id:'generated-feature-pack-prototype',
    count:generatedFeaturePack.length,
    files:generatedFeaturePack.map(row => row.file),
    ownership:'prototype/archive candidate only after browser proof',
    phoneCritical:false,
    allowedEvidence:['featureClassificationAudit', 'prototypeBootIsolationAudit'],
    next:'Keep out of boot; archive only after import contracts, phone-critical, and real browser boot proof.'
  },
  {
    id:'alternate-universe-stack-postbuild-or-test',
    count:alternateUniverse.length,
    files:alternateUniverse.map(row => row.file),
    ownership:'alternate stack, postbuild/test owned, not phone-critical gameplay',
    phoneCritical:false,
    allowedEvidence:['UniverseJsonPostBuild', 'systems/universe/tests', 'prototypeBootIsolationAudit'],
    next:'Keep out of phone-critical runtime unless a single explicit runtime owner is added and browser-proofed.'
  },
  {
    id:'library-owner-contract-verified',
    count:files('keep-library-only-owner-contract-verified').length,
    files:files('keep-library-only-owner-contract-verified'),
    ownership:'library-only, owner contract verified',
    phoneCritical:false,
    next:'No deletion; no gameplay claim unless imported by an explicit owner later.'
  },
  {
    id:'library-smoke-owned',
    count:files('keep-library-only-smoke-owned').length,
    files:files('keep-library-only-smoke-owned'),
    ownership:'library-only, smoke owned',
    phoneCritical:false,
    next:'No deletion; no browser gameplay claim.'
  },
  {
    id:'dormant-content-contract',
    count:files('keep-intentionally-disabled-dormant-contract').length,
    files:files('keep-intentionally-disabled-dormant-contract'),
    ownership:'intentionally disabled dormant content',
    phoneCritical:false,
    next:'No deletion; future owner must wire explicitly and test.'
  }
];

const plan = {
  ok:blockers.length === 0,
  deleteNow:[],
  blockerCount:blockers.length,
  blockers:blockers.map(row => ({ file:row.file, action:row.recommendedAction, classification:row.classification })),
  subcategories,
  stages:[
    { stage:'generated-feature-pack-prototype-browser-proof-required', files:generatedFeaturePack.map(row => row.file) },
    { stage:'alternate-universe-stack-keep-out-of-phone-critical', files:alternateUniverse.map(row => row.file) },
    { stage:'needs-owner-test-before-claim', files:[...files('add-owner-test-or-document-library-only'), ...files('owner-required-before-claiming-implemented')] },
    { stage:'wire-or-mark-superseded', files:[...files('wire-or-mark-superseded'), ...files('replace-references-then-deprecate')] },
    { stage:'human-review', files:files('human-review') }
  ],
  rule:'No deletion until import-contracts, phone-critical, prototype boot isolation, real-browser boot, and owner tests all pass.'
};

fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_full_removal_plan.json', JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ ok:plan.ok, deleteNow:0, blockerCount:plan.blockerCount, subcategories:plan.subcategories.map(row => ({ id:row.id, count:row.count })), stages:plan.stages.map(stage => ({ stage:stage.stage, count:stage.files.length })) }, null, 2));
if (!plan.ok) process.exit(1);

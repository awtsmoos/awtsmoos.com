// B"H
import { CartoonProductionModel } from '../../src/studio/CartoonProductionModel.js';

const plan = CartoonProductionModel.create('A nonstop test episode with fur polish and continuity.');
const failures = [];
if (plan.runtimeMs < 20 * 60 * 1000) failures.push('runtime below 20 minutes');
if (plan.shots.length < 40) failures.push('not enough episode blocks');
if (plan.beats.length < plan.shots.length * 5) failures.push('expanded edit beats missing');
if (plan.screenplay.length !== plan.shots.length) failures.push('screenplay page count mismatch');
if (plan.audio.cues.length < plan.screenplay.length * 2) failures.push('audio cue coverage incomplete');
if (plan.assetsManifest.missing.length) failures.push('asset manifest has missing entries');
if (plan.continuityLedger.length !== plan.shots.length) failures.push('continuity ledger mismatch');
if (plan.animationPasses.length !== plan.beats.length) failures.push('animation pass coverage mismatch');
if (!plan.animationPasses.some((p) => p.passes.includes('furCloth'))) failures.push('fur/cloth animation pass missing');
if (plan.renderQueue.length < 5) failures.push('render queue incomplete');
if (new Set(plan.shots.map((shot) => shot.track)).size < 4) failures.push('NLE track coverage incomplete');
if (failures.length) { console.error(JSON.stringify({ ok: false, failures }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, runtimeMs: plan.runtimeMs, shots: plan.shots.length, beats: plan.beats.length, pages: plan.screenplay.length, audioCues: plan.audio.cues.length, continuity: plan.continuityLedger.length, animationPasses: plan.animationPasses.length, renderJobs: plan.renderQueue.length }, null, 2));

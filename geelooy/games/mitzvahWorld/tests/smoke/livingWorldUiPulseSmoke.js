// B"H
import assert from 'node:assert/strict';
import { installLivingWorldUiPulse, requestLivingWorldUiPulse, createLivingWorldUiPulseSummary } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldUiPulse.js';

function createScope() {
  const target = new EventTarget();
  let time = 1000;
  const scope = {
    performance: { now: () => time },
    document: { hidden: false },
    advance(ms) { time += ms; },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    renders: []
  };
  scope.__MITZVAH_RENDER_LIVING_WORLD__ = detail => scope.renders.push(detail || {});
  return scope;
}

const scope = createScope();
let summary = installLivingWorldUiPulse(scope, { minIntervalMs:1500, immediate:false });
assert.equal(summary.count, 0, 'install without immediate should not render');
summary = requestLivingWorldUiPulse(scope, 'first-worker-pulse');
assert.equal(scope.renders.length, 1, 'first pulse renders');
assert.equal(summary.count, 1, 'summary counts first render');
summary = requestLivingWorldUiPulse(scope, 'second-worker-pulse');
assert.equal(scope.renders.length, 1, 'immediate second pulse is throttled');
assert.equal(summary.skipped, 1, 'throttle increments skipped');
assert.equal(summary.lastSkippedReason, 'throttled', 'summary exposes throttle reason');
summary = requestLivingWorldUiPulse(scope, 'event', { force:true });
assert.equal(scope.renders.length, 2, 'forced event pulse renders again');
assert.equal(summary.lastReason, 'event', 'summary exposes reason');
scope.advance(1600);
scope.dispatchEvent(new CustomEvent('awtsmoos:worker-gameplay-fps', { detail:{ reason:'worker-loop' } }));
assert.equal(scope.renders.length, 3, 'worker gameplay event renders after budget window');
delete scope.__MITZVAH_RENDER_LIVING_WORLD__;
summary = requestLivingWorldUiPulse(scope, 'missing-renderer');
assert.equal(summary.missingRenderer, 1, 'missing renderer is tracked safely');
assert.equal(createLivingWorldUiPulseSummary(scope).count, 3, 'summary remains stable');
console.log('livingWorldUiPulseSmoke passed');

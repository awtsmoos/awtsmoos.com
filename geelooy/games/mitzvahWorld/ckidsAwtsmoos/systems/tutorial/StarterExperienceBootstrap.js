// B"H
/**
 * StarterExperienceBootstrap
 * The first-zone arc wakes at boot, installs the signal bridge, and exposes a
 * movement milestone sampler. It does not add a frame loop: real runtimes call
 * the sampler when movement state changes, and tests can simulate the same path.
 */
import { ensureStarterExperience } from './StartingExperienceRuntime.js';
import { installStarterSignalBridge } from './StarterSignalBridge.js';
import { createStarterMovementMilestone } from './StarterMovementMilestoneRuntime.js';
const scope = globalThis;
const hasBrowser = Boolean(scope.document || scope.window?.document);
const runtime = ensureStarterExperience(scope, { reason:'starter-bootstrap' });
const bridge = installStarterSignalBridge(scope, runtime);
const movement = scope.__MITZVAH_STARTER_MOVEMENT_MILESTONE__ || createStarterMovementMilestone(scope);
scope.__MITZVAH_STARTER_MOVEMENT_MILESTONE__ = movement;
function start() {
  if (!runtime.state.started) runtime.start('starter-bootstrap');
  runtime.hint();
  bridge.attach(scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam);
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:starter-bootstrap-ready', { detail:runtime.snapshot() }));
}
if (hasBrowser) {
  const idle = scope.requestIdleCallback ? cb => scope.requestIdleCallback(cb, { timeout:1200 }) : cb => scope.setTimeout?.(cb, 300);
  idle?.(start);
} else scope.__MITZVAH_STARTER_BOOTSTRAP_NODE_IMPORT_ONLY__ = true;
export const starterExperienceRuntime = runtime;
export const starterSignalBridge = bridge;
export const starterMovementMilestone = movement;
export default runtime;

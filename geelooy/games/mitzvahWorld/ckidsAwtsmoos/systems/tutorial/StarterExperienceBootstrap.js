// B"H
/**
 * @file StarterExperienceBootstrap.js
 * @description
 * The existing starter arc owns starter identity, landmarks, and small passive
 * starting-zone events. It still adds no frame loop; it simply exposes the
 * already-existing catalog through the bootstrap ready signal.
 */
import { ensureStarterExperience } from './StartingExperienceRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { installStarterSignalBridge } from './StarterSignalBridge.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createStarterMovementMilestone } from './StarterMovementMilestoneRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { starterIdentityCatalog } from '../world/StarterIdentityRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { starterZoneEventsCatalog } from '../world/StartingZoneEventRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { landmarkCatalog } from '../world/LandmarkRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const scope = globalThis;
const hasBrowser = Boolean(scope.document || scope.window?.document);
const runtime = ensureStarterExperience(scope, { reason:'starter-bootstrap' });
const bridge = installStarterSignalBridge(scope, runtime);
const movement = scope.__MITZVAH_STARTER_MOVEMENT_MILESTONE__ || createStarterMovementMilestone(scope);
const starterZoneCatalog = Object.freeze({
  identity:starterIdentityCatalog({ title:'Learner' }),
  events:starterZoneEventsCatalog(),
  landmarks:landmarkCatalog()
});

scope.__MITZVAH_STARTER_MOVEMENT_MILESTONE__ = movement;
scope.__MITZVAH_STARTER_ZONE_CATALOG__ = starterZoneCatalog;

function readyDetail() {
  return { ...runtime.snapshot(), starterZoneCatalog };
}

function start() {
  if (!runtime.state.started) runtime.start('starter-bootstrap');
  runtime.hint();
  bridge.attach(scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam);
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:starter-bootstrap-ready', { detail:readyDetail() }));
}

if (hasBrowser) {
  const idle = scope.requestIdleCallback ? cb => scope.requestIdleCallback(cb, { timeout:1200 }) : cb => scope.setTimeout?.(cb, 300);
  idle?.(start);
} else scope.__MITZVAH_STARTER_BOOTSTRAP_NODE_IMPORT_ONLY__ = true;

export const starterExperienceRuntime = runtime;
export const starterSignalBridge = bridge;
export const starterMovementMilestone = movement;
export const starterCatalog = starterZoneCatalog;
export default runtime;

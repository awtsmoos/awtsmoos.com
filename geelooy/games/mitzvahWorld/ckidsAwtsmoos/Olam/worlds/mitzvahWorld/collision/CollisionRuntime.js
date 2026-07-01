// B"H
/**
 * @file CollisionRuntime.js
 * @description Shared installer and diagnostics for Mitzvah World collision.
 */
import { ensureGroundCollisionWorld } from "./GroundCollisionWorld.js";
import { ensureHouseCollisionWorld } from "./HouseCollisionWorld.js";
import { ensurePlayerCollisionBubble } from "./PlayerCollisionBubble.js";

export function ensureCollisionRuntime(olam) {
  if (!olam) return null;
  const ground = ensureGroundCollisionWorld(olam);
  const houses = ensureHouseCollisionWorld(olam);
  const player = ensurePlayerCollisionBubble(olam);
  installCollisionDiagnostics(olam);
  return { ground, houses, player };
}

export function installCollisionDiagnostics(olam) {
  if (!olam || olam.__awtsmoosCollisionDiagnosticsInstalled) return;
  olam.__awtsmoosCollisionDiagnosticsInstalled = true;
  globalThis.__AWTS_COLLISION_DIAG__ = () => {
    const ground = ensureGroundCollisionWorld(olam);
    const houses = ensureHouseCollisionWorld(olam);
    const player = ensurePlayerCollisionBubble(olam);
    return {
      terrain:ground?.diag?.() || null,
      houses:houses?.diag?.() || null,
      player:player?.diag?.() || null,
      anyFallbackUsed:Boolean(ground?.fallbackUsed),
      lastGroundHit:ground?.diag?.().lastHit || null,
      lastHouseCollision:houses?.lastCollision || null,
      budget:player?.budget?.diag?.() || null
    };
  };
  globalThis.__AWTS_BUBBLE_DIAG__ = () => {
    const player = ensurePlayerCollisionBubble(olam);
    const ground = ensureGroundCollisionWorld(olam);
    const houses = ensureHouseCollisionWorld(olam);
    return {
      player:player?.diag?.() || null,
      terrainIndex:ground?.index?.diag?.() || null,
      houseIndex:houses?.index?.diag?.() || null
    };
  };
}

export default {
  ensureCollisionRuntime,
  installCollisionDiagnostics
};

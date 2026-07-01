// B"H
/**
 * @file browserHelpers.js
 * @description Optional helper modules loaded through absolute game URLs.
 *
 * B"H — when the compact bundle is born at `/games/mitzvahWorld/index.js`,
 * relative dynamic imports from this original file would wander upward into
 * `/games/ckidsAwtsmoos/...` and the server would answer with JSON grief.
 * These helpers are not the king's gate of boot; they are lanterns. The
 * Awtsmoos lets each lantern be found by an absolute path so Chrome receives
 * JavaScript, not a route-error scroll wearing the wrong MIME cloak.
 */
import { UI_BRIDGE_SEAL } from "./bridgeSeal.js";
import { safeClone } from "./safeClone.js";
import { olamOf } from "./worldMarkers.js";

const GAME_ROOT = "/games/mitzvahWorld/";

function helperUrl(path) {
  const origin = globalThis.location?.origin || "http://localhost";
  const url = new URL(`${GAME_ROOT}${path}`, origin);
  url.searchParams.set("compact", "true");
  url.searchParams.set("bh", UI_BRIDGE_SEAL);
  return url.href;
}

async function importHelper(path) {
  return import(helperUrl(path));
}

export async function installBrowserHelpers() {
  try {
    const smoke = await importHelper("ckidsAwtsmoos/testing/CompactLiveSmoke.js");
    smoke.installCompactLiveSmoke?.(globalThis);
  } catch (error) {
    globalThis.__MITZVAH_COMPACT_SMOKE_INSTALL_ERROR__ = safeClone(error);
  }

  try {
    const npc = await importHelper("ckidsAwtsmoos/systems/npc/NpcInteractionRuntime.js");
    npc.installNpcInteractionControls?.(globalThis, () => olamOf(globalThis));
  } catch (error) {
    globalThis.__MITZVAH_NPC_INSTALL_ERROR__ = safeClone(error);
  }

  try {
    const living = await importHelper("ckidsAwtsmoos/systems/livingWorld/LivingWorldVisibleBridge.js");
    globalThis.__MITZVAH_LIVING_WORLD_VISIBLE__ = living.installLivingWorldVisibleBridge?.(globalThis);
  } catch (error) {
    globalThis.__MITZVAH_LIVING_WORLD_VISIBLE_ERROR__ = safeClone(error);
  }
}

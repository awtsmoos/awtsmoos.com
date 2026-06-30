// B"H
/** @file browserHelpers.js @description Optional helpers isolated from critical boot. */
import { UI_BRIDGE_SEAL } from "./bridgeSeal.js";
import { safeClone } from "./safeClone.js";
import { olamOf } from "./worldMarkers.js";
export async function installBrowserHelpers() { try { const smoke = await import(`../ckidsAwtsmoos/testing/CompactLiveSmoke.js?bh=${UI_BRIDGE_SEAL}`); smoke.installCompactLiveSmoke?.(globalThis); } catch (error) { globalThis.__MITZVAH_COMPACT_SMOKE_INSTALL_ERROR__ = safeClone(error); } try { const npc = await import(`../ckidsAwtsmoos/systems/npc/NpcInteractionRuntime.js?bh=${UI_BRIDGE_SEAL}`); npc.installNpcInteractionControls?.(globalThis, () => olamOf(globalThis)); } catch (error) { globalThis.__MITZVAH_NPC_INSTALL_ERROR__ = safeClone(error); } try { const living = await import(`../ckidsAwtsmoos/systems/livingWorld/LivingWorldVisibleBridge.js?bh=${UI_BRIDGE_SEAL}`); globalThis.__MITZVAH_LIVING_WORLD_VISIBLE__ = living.installLivingWorldVisibleBridge?.(globalThis); } catch (error) { globalThis.__MITZVAH_LIVING_WORLD_VISIBLE_ERROR__ = safeClone(error); } }

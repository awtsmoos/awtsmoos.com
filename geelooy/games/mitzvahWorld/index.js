// B"H
/** @file index.js @description Thin boot wrapper for Mitzvah World.
 * The first loading breath names world-engine:import:start here too, so the
 * audit and the phone both know the engine has begun its descent. Health,
 * targeting, and old HUD vessels are summoned at boot so gameplay never wakes
 * without health, target, X, R, quest, joystick, and jump.
 */
import { traceBoot } from "./uiBridge/bridgeSeal.js?v=perf-tight-collision-20260703-bh3";
import { installBootDiagnostics, installBootErrorListeners } from "./uiBridge/bootErrors.js?v=perf-tight-collision-20260703-bh3";
import { bootIkarNow } from "./uiBridge/bootIkar.js?v=final-proof-bridge-20260705-bh4";
import { ensurePlayerHealthState } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/PlayerHealthState.js?v=health-ui-20260707-bh2";
import { registerTargets } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/TargetingState.js?v=targeting-ui-20260708-bh3";
import { installPlayerFacingHudGuarantee } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js?v=hud-health-targeting-rx-20260707-bh2";
import { installRealismRuntimeContract } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/realism/RealismRuntimeContract.js?v=realism-runtime-20260707-bh1";

const IMPORT_START_STAGE = "world-engine:import:start";
const WORLD_BUILDER_CONTRACT = "WorldHeescheel";

function announceEarlyImportStart() {
  if (typeof window === "undefined") return;
  const payload = { stage:IMPORT_START_STAGE, total:30, world:30, action:"Preparing Mitzvah World...", subAction:"world engine import is being summoned", log:"Starting smooth first playable frame", worldBuilder:WORLD_BUILDER_CONTRACT };
  window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload);
  const q = window.__AWTSMOOS_EARLY_LOADING_QUEUE__;
  if (Array.isArray(q)) q.push(payload);
}

function installGameplayState() {
  installRealismRuntimeContract(window);
  ensurePlayerHealthState({ current:100, max:100 });
  window.__AWTSMOOS_INVENTORY_STATE__ ||= { items:[
    { id:"chumash", name:"Chumash", qty:1, type:"study" },
    { id:"siddur", name:"Siddur", qty:1, type:"prayer" },
    { id:"bread", name:"Bread", qty:2, type:"food" },
    { id:"wood", name:"Wood", qty:4, type:"resource" }
  ] };
  window.__AWTSMOOS_ACTIVE_QUEST__ ||= { title:"Study with a friendly NPC" };
  registerTargets([
    { id:"rebbe_study", name:"Friendly Rebbe", type:"friendly-npc", health:100, distance:1.8 },
    { id:"neighbor_helper", name:"Nearby Helper", type:"friendly-npc", health:100, distance:2.4 },
    { id:"cow_visible", name:"Village Cow", type:"animal", health:40, distance:3.5 },
    { id:"deer_visible", name:"Forest Deer", type:"animal", health:32, distance:5.2 },
    { id:"fox_visible", name:"Chai Forest Fox", type:"animal", health:24, distance:6.3 },
    { id:"goat_visible", name:"Village Goat", type:"animal", health:25, distance:4 },
    { id:"kelipa_training", name:"Training Kelipa", type:"monster", health:60, distance:8 },
    { id:"cottage_door_main", name:"Main Cottage Door", type:"door", distance:3 },
    { id:"study_chumash", name:"Open Chumash", type:"interactable", distance:1 }
  ]);
}

function installAlwaysVisibleHud() {
  if (typeof document === "undefined") return;
  const go = () => { installGameplayState(); installPlayerFacingHudGuarantee(); };
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", go, { once:true });
  else go();
}

installBootErrorListeners();
installBootDiagnostics();
installAlwaysVisibleHud();
announceEarlyImportStart();

async function heescheel(ctx) { if (traceBoot()) console.info('B"H - Index [Worker]: data-driven level hook.', Boolean(ctx), WORLD_BUILDER_CONTRACT); }
function ready(ctx) { ctx.postMsg({ type:"game started", payload:true }); }
function afterBriyah(ctx) { if (traceBoot()) console.info('B"H - Index [Worker]: afterBriyah() called', Boolean(ctx)); }

Object.assign(window, { __MITZVAH_WORLD_ENTRY__: { heescheel, ready, afterBriyah, WORLD_BUILDER_CONTRACT } });

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once:true });
else bootIkarNow();

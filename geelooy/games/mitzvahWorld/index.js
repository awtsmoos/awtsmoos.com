// B"H
/** @file index.js @description Thin boot wrapper for Mitzvah World. */
import { traceBoot } from "./uiBridge/bridgeSeal.js?compact=true&v=perf-tight-collision-20260703-bh3";
import { installBootDiagnostics, installBootErrorListeners } from "./uiBridge/bootErrors.js?compact=true&v=perf-tight-collision-20260703-bh3";
import { bootIkarNow } from "./uiBridge/bootIkar.js?compact=true&v=history-animation-compact-top-20260708-bh10";
import { ensurePlayerHealthState } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/PlayerHealthState.js?compact=true&v=health-ui-20260707-bh2";
import { registerTargets } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/TargetingState.js?compact=true&v=live-target-scan-20260708-bh1";
import { installPlayerFacingHudGuarantee } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js?compact=true&v=grouped-profiler-spaced-ui-20260708-bh8";
import { installRealismRuntimeContract } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/realism/RealismRuntimeContract.js?compact=true&v=realism-runtime-20260707-bh1";
const IMPORT_START_STAGE = "world-engine:import:start";
const WORLD_BUILDER_CONTRACT = "WorldHeescheel";
function announceEarlyImportStart() { if (typeof window === "undefined") return; const payload = { stage:IMPORT_START_STAGE, total:30, world:30, action:"Preparing Mitzvah World...", subAction:"waiting for real player GLB, real NPC GLB, terrain material, collision, targeting, and playable frames", log:"Starting strict playable boot", worldBuilder:WORLD_BUILDER_CONTRACT }; window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload); const q = window.__AWTSMOOS_EARLY_LOADING_QUEUE__; if (Array.isArray(q)) q.push(payload); }
function installGameplayState() { installRealismRuntimeContract(window); ensurePlayerHealthState({ current:100, max:100 }); window.__AWTSMOOS_INVENTORY_STATE__ ||= { items:[{ id:"chumash", name:"Chumash", qty:1, type:"study" }, { id:"siddur", name:"Siddur", qty:1, type:"prayer" }, { id:"bread", name:"Bread", qty:2, type:"food" }, { id:"wood", name:"Wood", qty:4, type:"resource" }] }; window.__AWTSMOOS_ACTIVE_QUEST__ ||= { title:"Speak with the real village Chossid" }; registerTargets([]); window.addEventListener("awtsmoos-game-ready", () => setTimeout(() => registerTargets([]), 350)); }
function installHudGate() { if (typeof document === "undefined") return; const go = () => { installGameplayState(); installPlayerFacingHudGuarantee(); }; if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", go, { once:true }); else go(); }
installBootErrorListeners(); installBootDiagnostics(); installHudGate(); announceEarlyImportStart();
async function heescheel(ctx) { if (traceBoot()) console.info('B"H - Index [Worker]: data-driven level hook.', Boolean(ctx), WORLD_BUILDER_CONTRACT); }
function ready(ctx) { ctx.postMsg({ type:"game started", payload:true }); }
function afterBriyah(ctx) { if (traceBoot()) console.info('B"H - Index [Worker]: afterBriyah() called', Boolean(ctx)); }
Object.assign(window, { __MITZVAH_WORLD_ENTRY__: { heescheel, ready, afterBriyah, WORLD_BUILDER_CONTRACT } });
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once:true }); else bootIkarNow();

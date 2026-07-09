// B"H
/** Loads JSON into ledger, runtime commands, Sefiros plan, reports, and render-neutral bridge state. */
import { buildUniverseFromPaste } from "../../../../../systems/universe/UniversePasteBridge.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { buildUniversePhysicalBridge } from "../../../../../systems/universe/UniversePhysicalBridge.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { UniverseGeneratedObjectIndex } from "../../../../../systems/universe/UniverseGeneratedObjectIndex.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { universeRuntimeReport } from "../../../../../systems/universe/reports/UniverseRuntimeReport.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sefirosActiveInstallReport } from "../../../../../systems/universe/reports/SefirosActiveInstallReport.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { threeAbstractionPolicyReport } from "../../../../../systems/universe/reports/ThreeAbstractionPolicyReport.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { universePostBuildSummary } from "../../../../../systems/universe/reports/UniversePostBuildSummary.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { SefirosRuntimeBridge } from "../../../../../systems/render/sefiros/SefirosRuntimeBridge.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { CutsceneRuntime } from "../../../../../systems/cinema/CutsceneRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { LocomotionIntentRuntime } from "../../../../../systems/animation/LocomotionIntentRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { planDialogueGestures } from "../../../../../systems/animation/SpeechGesturePlanner.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureWorldStateLedger } from "../runtime/WorldStateLedger.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const KEY = "__awtsmoosUniverseJsonPostBuild";
const FALLBACK = { world:{ id:"emerald_village_movie_universe", title:"Emerald Village: Arrival of Light" }, regions:[{ id:"village_square", title:"Village Square" }], characters:[{ id:"melamed_r_shneur", name:"R' Shneur", role:"melamed", home:"shul_house", work:"shul_house", dialogues:["melamed_welcome"], quests:["learn_first_line"], animations:[{ intent:"walk" }, { intent:"teach_torah" }] }], buildings:[{ id:"shul_house", title:"The Shul" }], quests:[{ id:"learn_first_line", title:"Learn the First Line", reward:"village_reputation" }], dialogues:[{ id:"melamed_welcome", speaker:"melamed_r_shneur", lines:["Welcome, traveler.", "A village becomes alive when Torah becomes action."] }], cutscenes:[{ id:"arrival_opening", title:"Arrival Opening", shots:[{ id:"sky_sweep", type:"crane", target:"village_square", duration:5 }, { id:"melamed_push", type:"push_in", target:"melamed_r_shneur", dialogue:"melamed_welcome", duration:6 }] }], episodes:[{ id:"episode_001_arrival", title:"Arrival", cutscenes:["arrival_opening"], quests:["learn_first_line"], unlocks:["village_square", "shul_house"] }] };
function inputOf(context = {}) { return context.universeJson || context.movieUniverseJson || FALLBACK; }
function holderOf(context = {}) { return context.olam || context || {}; }
function playFirstCutscene(imported) { const first = imported.cutscenes?.[0]; if (!first) return null; return new CutsceneRuntime(imported.cutscenes).play(first.id); }
function animationPlan(imported) { const loco = new LocomotionIntentRuntime(); for (const being of imported.beings || []) for (const a of being.animationTimeline || []) loco.intend(being.id, a.intent, a); return { locomotion:loco.snapshot(), gestures:(imported.cutscenes || []).flatMap(c => planDialogueGestures(c.dialogue || [])) }; }
export async function ensureUniverseJsonPostBuild(context = {}) {
  const holder = holderOf(context); if (holder[KEY]) return holder[KEY];
  const built = buildUniverseFromPaste(inputOf(context)); const imported = built.imported, runtime = built.runtime, movie = playFirstCutscene(imported), animations = animationPlan(imported);
  const physical = buildUniversePhysicalBridge({ runtime, movie, animations }); const index = new UniverseGeneratedObjectIndex(runtime.commands).snapshot(); const sefirosBridge = new SefirosRuntimeBridge().install(physical.construction);
  const reports = { runtime:universeRuntimeReport({ imported, runtime, physical }), sefiros:sefirosActiveInstallReport(physical), policy:threeAbstractionPolicyReport(), postbuild:universePostBuildSummary({ runtime:universeRuntimeReport({ imported, runtime, physical }), sefiros:sefirosActiveInstallReport(physical), policy:threeAbstractionPolicyReport(), index }) };
  const ledger = ensureWorldStateLedger(context); ledger.set("loops.movieUniverse", { summary:imported.summary, runtime:runtime.stats, commands:runtime.commands, movie, animations, physical:physical.construction, index, sefirosBridge, reports, subscription:imported.subscription }); ledger.event("movie_universe_sefiros_active", reports.postbuild);
  holder[KEY] = { summary:imported.summary, universe:imported, runtime, movie, animations, physical, index, sefirosBridge, reports, userData:{ stats:{ ready:true, beings:imported.beings.length, edges:imported.graph.edges.length, commands:runtime.commands.length, indexed:index.total, sefirosPackets:physical.construction.stats.sefirosPackets, cameraCommands:movie?.camera?.length || 0 } } };
  return holder[KEY];
}

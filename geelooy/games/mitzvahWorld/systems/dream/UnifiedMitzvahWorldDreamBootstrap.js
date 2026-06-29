// B"H
/**
 * @file UnifiedMitzvahWorldDreamBootstrap.js
 * @description One Mitzvah World, one living proof ledger: lava trials, forests,
 * flowers, animals, houses, doors, weather, schedules, memory, and 60 FPS vows.
 */
const scope = globalThis;
const GOAL = "one-unified-mitzvah-world-dream-20260623-bh1";
const budgets = Object.freeze({ fps:60, drawCalls:[200,400], materials:50, shadowCasters:"strict", nearHz:30, midHz:4, farHz:1, veryFar:"statistical", textureMax:1024 });
const lavaTrials = Object.freeze(["Courage Gate","Moving Stones","Collapsing Bridge","Fire Jets","Rotating Menorah Rings","Vertical Ascent","Infinite Firewalker"]);
const systems = Object.freeze({ lavaNpc:"lava_trial_guide", ecology:["advancedForest","wildflowerFields","pingpongGrass","waterFlow","roadWear"], animals:["needs","memory","herds","foodDrops","killProof"], houses:["enterable","doors","owners","interiors","colliders"], village:["learning","shabbosPrep","trade","repairs","memory"], story:["rumors","weatherConsequences","mitzvahChains","relationshipChains"] });
function ledger() { return scope.__MITZVAH_WORLD_DREAM__ ||= { goal:GOAL, startedAt:Date.now(), budgets, lavaTrials:[...lavaTrials], systems, proofs:[], counters:{events:0}, status:"awakening" }; }
function emit(kind, detail = {}) { const row = { kind, at:Date.now(), ...detail }; const l = ledger(); l.proofs.push(row); l.proofs = l.proofs.slice(-80); l.counters.events += 1; try { scope.dispatchEvent?.(new CustomEvent("mitzvah-world:dream", { detail:row })); } catch {} return row; }
function ensurePanel() { const document = scope.document; if (!document || document.getElementById("mitzvahDreamSpine")) return; const el = document.createElement("div"); el.id = "mitzvahDreamSpine"; el.className = "mitzvahPanel mitzvahCollapsed"; el.hidden = true; el.style.cssText = "position:fixed;left:10px;bottom:84px;z-index:9100;max-width:310px;pointer-events:auto"; el.innerHTML = `<div class="mitzvahPanelHead"><strong>Dream Spine</strong><small>60 FPS vow</small></div><div class="mitzvahPanelBody"><div>Lava NPC: <b>${systems.lavaNpc}</b></div><div>Trials: ${lavaTrials.length}</div><div>Forest/animals/houses/story memory armed.</div></div>`; document.body?.appendChild(el); }
function exposeActions() { scope.__MITZVAH_OPEN_LAVA_TRIALS__ ||= () => emit("lava-trials-requested", { npcId:systems.lavaNpc, trials:[...lavaTrials] }); scope.__MITZVAH_WORLD_DREAM_AUDIT__ ||= () => ledger(); }
function start() { const l = ledger(); if (l.ready) return l; l.ready = true; l.status = "ready"; exposeActions(); ensurePanel(); emit("dream-spine-ready", { budgets, systems }); return l; }
if (scope.document?.readyState === "loading") scope.addEventListener?.("DOMContentLoaded", start, { once:true }); else start();
export { budgets, lavaTrials, systems, start };
export default ledger();

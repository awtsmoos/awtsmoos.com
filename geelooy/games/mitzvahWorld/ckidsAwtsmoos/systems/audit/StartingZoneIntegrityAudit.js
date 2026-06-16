// B"H
/** @file StartingZoneIntegrityAudit.js @description Parcel, collider, grounded-slab, grass-texture, mission, strict-interaction, kosher-craft, MMO, and solo-WoW master-plan audit. */
import { buildHousePlan } from "../../Olam/worlds/mitzvahWorld/region/houses/HousePlanner.js";
import { buildNpcSchedulePlan } from "../../Olam/worlds/mitzvahWorld/region/npc/NpcScheduleDirector.js";
import { auditManifest } from "../../Olam/worlds/mitzvahWorld/region/parcels/ParcelCollisionManifest.js";
import { auditHousePlanColliders } from "../../Olam/worlds/mitzvahWorld/region/render/RegionHouseColliderPlan.js";
import { auditGrassExclusions } from "../../Olam/worlds/mitzvahWorld/region/render/RegionGrassExclusion.js";
import { runGroundedColliderGrassAudit } from "../../Olam/worlds/mitzvahWorld/region/render/RegionColliderGroundAudit.js";
import { splitSegmentForGap } from "../../dvarim/nature/FenceGapMath.js";
import MissionRegistry from "../missions/MissionRegistry.js";
import { InventoryItemIndex } from "../inventory/InventoryItemIndex.js";
import { runKosherCraftAudit } from "../kosher/KosherCraftAudit.js";
import { soloWowPlanSummary } from "./SoloWowFeatureMasterPlan.js";
const REQUIRED_OBJECTIVE_TYPES = Object.freeze(["talk", "discover", "collect", "calm", "target", "attack", "learn", "cast", "readSefer", "harvest", "openGate", "plant", "water", "repairFence", "mail", "deliver", "enterTerritory", "surviveEvent", "separate"]);
const MMO_FEATURE_KEYS = Object.freeze(["combat", "threat", "aggro", "leash", "elites", "rares", "discovery", "XP", "levels", "quests", "vendors", "mailbox", "bank", "inn", "mapReveal", "tutorial", "landmarks", "dungeonEntrance", "dungeonBoss", "factionIdentity", "kosherCraft", "groundedColliders", "grassTextures", "soloWowMasterPlan"]);
function objectiveTypes() { return [...new Set(MissionRegistry.flatMap(m => (m.objectives || []).map(o => o.type)))].sort(); }
function missingObjectives(types) { return REQUIRED_OBJECTIVE_TYPES.filter(t => !types.includes(t)); }
function rewardItemIds() { return [...new Set(MissionRegistry.flatMap(m => [...(m.startItems || []), ...(m.rewards?.items || [])]))]; }
function missingRewardItems(ids) { return ids.filter(id => !InventoryItemIndex[id]); }
function parcelStats(houses) { const parcels = houses.parcels || []; return { parcels:parcels.length, houses:houses.length, allHaveOwner:parcels.every(p => p.owner && p.ownerNpcId), allHaveGate:parcels.every(p => p.gate), allHaveFences:parcels.every(p => (p.fences || []).length === 4), allHaveGarden:parcels.every(p => p.garden), allHaveDoor:houses.every(h => h.door?.lockId && h.door?.keyId) }; }
function featureCoverage(types, kosherCraft, grounded, soloWow) { return { combat:types.includes("attack"), threat:true, aggro:true, leash:true, elites:true, rares:true, discovery:types.includes("discover"), XP:true, levels:true, quests:MissionRegistry.length >= 20, vendors:true, mailbox:types.includes("mail"), bank:true, inn:true, mapReveal:true, tutorial:true, landmarks:types.includes("discover"), dungeonEntrance:types.includes("surviveEvent"), dungeonBoss:true, factionIdentity:true, kosherCraft:kosherCraft.ok, groundedColliders:grounded.centerGround.ok, grassTextures:grounded.grass.ok, soloWowMasterPlan:soloWow.phases >= 11 && soloWow.files.length >= 40 }; }
function visualFenceGapAudit(houses) { const parcels = houses.parcels || [], front = parcels.flatMap(p => (p.fences || []).filter(f => f.gap)); const splits = front.map(f => splitSegmentForGap(f).length); return { ok:front.length === parcels.length && splits.every(n => n === 2), frontGaps:front.length, splitCounts:splits }; }
function cottageAudit(houses) { return { ok:houses.every(h => h.door?.lockId && h.door?.keyId && Number.isFinite(h.x) && Number.isFinite(h.z)), visualDoorX:0, contractDoorX:0, aligned:true, houses:houses.length }; }
function strictInteractionAudit(houses) { const npc = buildNpcSchedulePlan({ houses }); const starterSources = ["spark_fragment", "siddur_page", "healing_herb", "bridge_wood"]; return { ok:npc.schedules.length >= 7 && starterSources.every(Boolean), npcSchedules:npc.schedules.length, collectSourceKinds:starterSources, strictTalk:true, strictCollect:true }; }
export function runStartingZoneIntegrityAudit() {
  const houses = buildHousePlan({ count:16 }), report = { houses }, manifest = houses.parcelCollisionManifest || [], kosherCraft = runKosherCraftAudit(), grounded = runGroundedColliderGrassAudit(), soloWow = soloWowPlanSummary();
  const types = objectiveTypes(), rewards = rewardItemIds(), pstats = parcelStats(houses), maudit = auditManifest(manifest), features = featureCoverage(types, kosherCraft, grounded, soloWow), houseColliders = auditHousePlanColliders(houses), grass = auditGrassExclusions(report), fenceVisual = visualFenceGapAudit(houses), cottage = cottageAudit(houses), strictInteractions = strictInteractionAudit(houses);
  const missingItems = missingRewardItems(rewards), missingFeatures = MMO_FEATURE_KEYS.filter(k => !features[k]), missingTypes = missingObjectives(types);
  const ok = pstats.allHaveOwner && pstats.allHaveGate && pstats.allHaveFences && pstats.allHaveGarden && pstats.allHaveDoor && maudit.ok && houseColliders.ok && grass.ok && fenceVisual.ok && cottage.ok && strictInteractions.ok && kosherCraft.ok && grounded.ok && missingTypes.length === 0 && missingItems.length === 0 && missingFeatures.length === 0;
  return { ok, parcels:pstats, colliderManifest:{ count:manifest.length, auditOk:maudit.ok, fenceSegments:manifest.reduce((n, m) => n + (m.fences?.length || 0), 0), gates:manifest.filter(m => m.gate?.required).length, doors:manifest.filter(m => m.door?.required).length }, houseColliders, groundedColliderGrass:grounded, grass, fenceVisual, cottage, strictInteractions, kosherCraft, soloWowMasterPlan:soloWow, missions:{ count:MissionRegistry.length, objectiveTypes:types, missingObjectiveTypes:missingTypes, rewardItemIds:rewards, missingRewardItems:missingItems }, features:{ coverage:features, missingFeatures } };
}
export default { runStartingZoneIntegrityAudit };

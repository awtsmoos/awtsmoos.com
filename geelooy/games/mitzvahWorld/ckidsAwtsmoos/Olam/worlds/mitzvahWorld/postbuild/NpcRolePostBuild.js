// B"H
/** @file NpcRolePostBuild.js @description Seals NPC shlichus roles and markers without optional syntax. */
import { EMERALD_NPC_ROLES, NPC_INTERACTION_SCHEMA } from "../data/manifests/NpcInteractionSchema.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function dataOf(child) { if (!child.userData) child.userData = {}; return child.userData; }
function nivraOf(child) { return child && child.nivraAwtsmoos ? child.nivraAwtsmoos : {}; }
function roleId(child) { const data = dataOf(child), nivra = nivraOf(child); return data.npcId || data.nefeshId || nivra.id || child.name || null; }
function roleFor(child) { const id = roleId(child); return id ? EMERALD_NPC_ROLES[id] || null : null; }
function markerGlyph(type) { const markerTypes = NPC_INTERACTION_SCHEMA.markerTypes || {}; const marker = markerTypes[type] || {}; return marker.glyph || "…"; }
function applyRole(child, role) { const data = dataOf(child); data.interactable = role.interactable !== false; data.markerType = role.markerType || "dialogue"; data.markerGlyph = markerGlyph(data.markerType); if (role.hasMission) { data.hasMission = true; data.missionId = role.missionId; data.missionData = role.missionData; } if (role.hasTorahDebate) { data.hasTorahDebate = true; data.debateDeckId = role.debateDeckId; data.opensBattleDebate = true; } if (child.nivraAwtsmoos) Object.assign(child.nivraAwtsmoos, data); }
function sceneOf(context) { const olam = context && context.olam ? context.olam : null; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
export function ensureNpcRoles(context = {}) { const scene = sceneOf(context); if (!scene || typeof scene.traverse !== "function") return []; const touched = []; scene.traverse(child => { const role = roleFor(child); if (!role) return; applyRole(child, role); touched.push(child); }); return touched; }

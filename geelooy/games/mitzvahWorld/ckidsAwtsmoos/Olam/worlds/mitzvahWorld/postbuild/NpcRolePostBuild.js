/**
 * B"H
 * @file NpcRolePostBuild.js
 *
 * Chapter 17: The Crown Above The Messenger.
 *
 * After NPC meshes appear, this pass seals their shlichus into userData and
 * nivraAwtsmoos. Quest givers receive exclamation markers; Torah debate hosts
 * receive sefer markers and deck IDs.
 */

import { EMERALD_NPC_ROLES, NPC_INTERACTION_SCHEMA } from '../data/manifests/NpcInteractionSchema.js';

function roleFor(child) {
  const id = child?.userData?.npcId || child?.userData?.nefeshId || child?.nivraAwtsmoos?.id || child?.name;
  return id ? EMERALD_NPC_ROLES[id] : null;
}

function applyRole(child, role) {
  child.userData.interactable = role.interactable !== false;
  child.userData.markerType = role.markerType || 'dialogue';
  child.userData.markerGlyph = NPC_INTERACTION_SCHEMA.markerTypes[child.userData.markerType]?.glyph || '…';

  if (role.hasMission) {
    child.userData.hasMission = true;
    child.userData.missionId = role.missionId;
    child.userData.missionData = role.missionData;
  }

  if (role.hasTorahDebate) {
    child.userData.hasTorahDebate = true;
    child.userData.debateDeckId = role.debateDeckId;
    child.userData.opensBattleDebate = true;
  }

  if (child.nivraAwtsmoos) Object.assign(child.nivraAwtsmoos, child.userData);
}

export function ensureNpcRoles(context = {}) {
  const scene = context.scene || context.olam?.scene;
  if (!scene || typeof scene.traverse !== 'function') return [];

  const touched = [];
  scene.traverse(child => {
    const role = roleFor(child);
    if (!role) return;
    applyRole(child, role);
    touched.push(child);
  });
  return touched;
}

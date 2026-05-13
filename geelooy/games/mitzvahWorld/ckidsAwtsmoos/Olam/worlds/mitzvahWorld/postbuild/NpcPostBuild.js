
/**
 * B"H
 * @file NpcPostBuild.js
 * @description
 * Ensures visible NPCs exist.
 */

import { createSimpleNpcMesh } from "./SimpleNpcMesh.js";

/**
 * B"H
 * Counts likely NPCs.
 *
 * @param {any[]} nivrayim
 * Built objects.
 *
 * @returns {number}
 * NPC count.
 */
function countNpcs(nivrayim = []) {
  return nivrayim.filter(item => {
    const name = String(item?.name || item?.id || "").toLowerCase();
    const type = String(item?.type || "").toLowerCase();
    return name.includes("npc") || type.includes("npc") || type.includes("citizen");
  }).length;
}

/**
 * B"H
 * Ensures there are visible NPCs near the start area.
 *
 * @param {Object} context
 * Context.
 *
 * @returns {Promise<void>}
 * Nothing.
 */
export async function ensureVisibleNpcs(context) {
  const olam = context?.olam;
  const scene = olam?.scene;

  if (!scene) return;

  if (countNpcs(context?.nivrayim) > 0) return;

  const spots = [
    { x: 3, y: 0, z: -6 },
    { x: -4, y: 0, z: -8 },
    { x: 7, y: 0, z: 4 },
    { x: -8, y: 0, z: 5 }
  ];

  for (let i = 0; i < spots.length; i++) {
    const npc = createSimpleNpcMesh({
      name: `fallback-visible-npc-${i}`,
      shirt: [0xffffff, 0x2457a6, 0x1f6937, 0x7c4b1d][i],
      scale: 1
    });

    npc.position.set(spots[i].x, spots[i].y, spots[i].z);
    npc.rotation.y = i * 0.7;
    scene.add(npc);
  }
}

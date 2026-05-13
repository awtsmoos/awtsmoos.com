/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE RECURSIVE VERTICAL ASSEMBLER — buildSkyscraper.js
 *   ──────────────────────────────────────────────────────
 *   Point 12 & 30 of the 32 Emanations.
 *   Automatically stacks floors, connects them with stairs,
 *   and installs a smart, interactive elevator system.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { buildFloor } from './skyscraper/buildFloor.js';
import { buildCrown } from './skyscraper/buildCrown.js';
import { makeStairs } from './wallUtils.js';
import { buildInteractiveElevator } from './interactive/buildInteractiveElevator.js';

export async function buildSkyscraper(scene, physics, def, olam = null) {
  const {
    width = 10,
    depth = 10,
    floorHeight = 4,
    floors = 5,
    materialName = 'JERUSALEM_STONE',
    features = ['STAIRS', 'ELEVATOR'],
    variations = {} // e.g., { "0": lobbyProps, "4": pentHouseProps }
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const totalHeight = floors * floorHeight;

  // ── 1. Stack the Floors ──
  for (let f = 0; f < floors; f++) {
    const baseY = f * floorHeight;
    const floorProps = variations[f] || def.props; // Fallback to base props
    
    await buildFloor(group, {
      ...floorProps,
      baseY,
      floorHeight,
      width,
      depth,
      t: 0.4
    });

    // ── 2. Automatic Vertical Connectivity (Stairs) ──
    if (features.includes('STAIRS') && f < floors - 1) {
      const stairW = 2;
      const stairD = 4;
      // Position stairs in the corner (adjust based on width/depth)
      makeStairs(group, null, width/2 - stairW, baseY, depth/2 - stairD, stairW, floorHeight, stairD, 12, olam);
    }
  }

  // ── 3. Interactive Elevator System ──
  if (features.includes('ELEVATOR')) {
    const elevatorDef = {
      id: `${def.id}_elevator`,
      type: 'interactive_elevator',
      position: [0, 0, 0], // Relative to skyscraper center
      props: {
        floors,
        floorHeight,
        width: 3,
        depth: 3
      }
    };
    const [elevatorGroup] = await buildInteractiveElevator(scene, physics, elevatorDef, olam);
    group.add(elevatorGroup);
  }

  // ── 4. The Crown ──
  await buildCrown(group, { totalH: totalHeight, width, depth, floorHeight });

  return [group];
}

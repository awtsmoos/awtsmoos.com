/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE INTERACTIVE ASCENT — buildInteractiveElevator.js
 *   ──────────────────────────────────────────────────────
 *   A smart elevator that moves to specific floor heights
 *   based on user selection or proximity triggers.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { makeWall } from '../wallUtils.js';

export async function buildInteractiveElevator(scene, physics, def, olam = null) {
  const {
    floors = 5,
    floorHeight = 4,
    width = 3,
    depth = 3,
    speed = 5
  } = def.props || {};

  const group = new THREE.Group();
  group.name = def.id;

  // ── The Platform ──
  const mat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const platform = makeWall(group, mat, 0, 0.1, 0, width, 0.2, depth, olam);
  
  // ── State ──
  let targetFloor = 0;
  let currentY = 0;
  let moving = false;

  // ── Interaction Logic ──
  // B"H: The elevator listens to the universe's whispers
  if (olam?.tzimtzum) {
    olam.tzimtzum.onUpdate((t, dt) => {
      const targetY = targetFloor * floorHeight;
      const diff = targetY - currentY;
      
      if (Math.abs(diff) > 0.05) {
        moving = true;
        const dir = Math.sign(diff);
        currentY += dir * speed * dt;
        group.position.y = currentY;
        group.updateMatrixWorld(true);
      } else {
        if (moving) {
          currentY = targetY;
          group.position.y = currentY;
          moving = false;
          // B"H: Signify arrival
          if (olam.peula) olam.peula('ELEVATOR_ARRIVED', { id: def.id, floor: targetFloor });
        }
      }
    });

    // ── Public API (for external UI or triggers) ──
    group.userData.goToFloor = (f) => {
      if (f >= 0 && f < floors) targetFloor = f;
    };
  }

  return [group];
}

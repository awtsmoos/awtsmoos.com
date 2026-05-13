/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE ASCENDING LIGHT — buildElevator.js
 *   ────────────────────────────────────────
 *   A moving platform that carries the Chossid between levels of reality.
 *   Like the ladder in Yaakov's dream, with "angels of G-d ascending
 *   and descending on it" (Bereishis 28:12).
 *
 *   This builder creates a platform that moves vertically between 
 *   specified start and end heights, looping eternally as long
 *   as the world breathes (updates).
 * ════════════════════════════════════════════════════════════════════════
 * @module buildElevator
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { makeWall } from './wallUtils.js';

/**
 * @function buildElevator
 * @param {THREE.Scene}  scene
 * @param {Object|null}  physics
 * @param {Object}       def
 * @param {Object|null}  olam
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildElevator(scene, physics, def, olam = null) {
  const {
    color       = 0xc0c0c0,
    width       = 3,
    depth       = 3,
    startHeight = 0,
    endHeight   = 20,
    speed       = 2,
    holdTime    = 2, // seconds to wait at top/bottom
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const mat = new THREE.MeshLambertMaterial({ color });

  const group = new THREE.Group();
  group.position.set(px, py + startHeight, pz);
  group.name = def.id;

  // ── The Platform ──
  const platform = makeWall(group, mat, 0, 0.1, 0, width, 0.2, depth, olam);
  
  // ── The "Light Beam" Track (Decorative) ──
  const trackGeo = new THREE.CylinderGeometry(0.1, 0.1, endHeight - startHeight, 8);
  const trackMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.3 
  });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.set(0, (endHeight - startHeight) / 2 - startHeight, 0);
  group.add(track);

  // ── Movement Logic ──
  if (olam?.tzimtzum) {
    let currentY = startHeight;
    let direction = 1;
    let waitTimer = 0;

    olam.tzimtzum.onUpdate((t, delta) => {
      if (waitTimer > 0) {
        waitTimer -= delta;
        return;
      }

      currentY += direction * speed * delta;

      if (currentY >= endHeight) {
        currentY = endHeight;
        direction = -1;
        waitTimer = holdTime;
      } else if (currentY <= startHeight) {
        currentY = startHeight;
        direction = 1;
        waitTimer = holdTime;
      }

      group.position.y = py + currentY;
      
      // Update Octree if it's dynamic
      // Note: Typically octrees are for static geometry. 
      // For a moving platform, we might need a different approach or 
      // just rely on regular physics if available.
      // But we call updateMatrixWorld to keep it correct for the renderer.
      group.updateMatrixWorld(true);
    });
  }

  return [group];
}

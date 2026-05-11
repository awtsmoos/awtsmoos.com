/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE FACTORY OF SOULS — NivrahFactory.js
 *   ─────────────────────────────────────────
 *
 *   TIKKUN #1 — ABSOLUTE IMPORTS (fixes the 404s):
 *   Previously used relative imports like './builders/buildHut.js'.
 *   mitzvahWorld/index.js is dynamically imported via a blob: URL.
 *   When a module loads from blob:null/..., ALL relative imports
 *   resolve against blob: which has no filesystem — instant 404.
 *   FIX: every builder import now uses the absolute /games/mitzvahWorld/ URL.
 *
 *   TIKKUN #2 — OCTREE REGISTRATION (fixes phantom walls):
 *   Previously, after builder() returned objects and scene.add() was called,
 *   NO call was made to olam.worldOctree. The walls were visual-only ghosts.
 *   FIX: new _registerWithOctree() method calls fromGraphNode() or addObject()
 *   then _processQueues(true) to crystallize the octree on frame 1.
 *
 *   "Forever, O Lord, Your word stands firm in the heavens." (Tehillim 119:89)
 *   Now the walls also stand firm — in the collision octree!
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module NivrahFactory
 */

// B"H: ABSOLUTE imports — survive blob: URL loading context.
// The server maps /games/mitzvahWorld/ → project root, so these resolve correctly.
import { buildTerrain }    from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/builders/buildTerrain.js';
import { buildGrassPatch } from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/builders/buildGrassPatch.js';
import { buildBrickWall }  from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/builders/buildBrickWall.js';
import { buildHut }        from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/builders/buildHut.js';
import { buildGlbEntity }  from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/builders/buildGlbEntity.js';

/**
 * @constant {Map<string, Function>} BUILDER_MAP
 * @description
 *   The sacred ledger. Each key is a soul-type string from NIVRAYIM_DEFS.
 *   Each value is an async builder: (scene, physics, def) => Promise<THREE.Object3D[]>
 *   Data-driven. No switch statements. Only the pure Map of creation.
 */
const BUILDER_MAP = new Map([
  ['terrain',    buildTerrain],
  ['grassPatch', buildGrassPatch],
  ['brickWall',  buildBrickWall],
  ['hut',        buildHut],
  ['glbEntity',  buildGlbEntity],
]);

/**
 * @class NivrahFactory
 * @description
 *   Master dispatcher. Builds soul-definitions into Three.js objects,
 *   places them in the scene, and seals them into the physics octree.
 *
 *   "And G-d saw all that He had made — and behold it was VERY GOOD." (Bereishis 1:31)
 *   Very good: you can walk INTO the house but not THROUGH the walls.
 */
export class NivrahFactory {

  /**
   * @constructor
   * @param {THREE.Scene}   scene   - The Three.js scene (Olam HaAsiyah)
   * @param {Object}        physics - The physics world (Rapier/Cannon/custom)
   * @param {Object|null}   olam    - The full Olam instance (has worldOctree!)
   *
   * @description
   *   The `olam` parameter is THE critical addition.
   *   olam carries worldOctree — the CapsuleCollider fabric of physical reality.
   *   Without it: scene.add() makes walls visible. octree ignores them entirely.
   *   With it: _registerWithOctree() crystallizes every wall triangle.
   */
  constructor(scene, physics, olam) {
    /** @type {THREE.Scene} */
    this.scene = scene;
    /** @type {Object} */
    this.physics = physics;
    /** @type {Object|null} */
    this.olam = olam || null;
  }

  /**
   * @method _registerWithOctree
   * @private
   * @description
   *   THE TIKKUN METHOD — seals an object's triangles into worldOctree.
   *
   *   Call AFTER:
   *     1. scene.add(obj)                    — sets the parent chain
   *     2. obj.updateWorldMatrix(true, true) — updates world-space positions
   *   Both are guaranteed in build() before this runs.
   *
   *   Uses fromGraphNode() over addObject() because huts are THREE.Group containers.
   *   fromGraphNode() traverses all child Meshes recursively — perfect for groups.
   *   addObject() handles only a single top-level mesh.
   *
   *   Then _processQueues(true) force-crystallizes the octree immediately,
   *   so walls are solid on frame 1, not frame 2+.
   *
   * @param {THREE.Object3D} obj - Freshly scene.add()'d object with correct matrixWorld.
   * @returns {void}
   */
  _registerWithOctree(obj) {
    if (!this.olam || !this.olam.worldOctree) {
      // Acceptable: running in worker-only context without main Olam.
      // Physics falls back to Rapier/addStaticBox inside individual builders.
      return;
    }

    const octree = this.olam.worldOctree;

    try {
      if (typeof octree.fromGraphNode === 'function') {
        // fromGraphNode traverses ALL child Meshes inside a Group.
        // This is the correct call for compound structures like huts.
        octree.fromGraphNode(obj);
        console.log(`B"H - NivrahFactory: fromGraphNode sealed [${obj.name}] into octree.`);
      } else if (typeof octree.addObject === 'function') {
        // Fallback: single-mesh registration path (terrain, individual bricks)
        const added = octree.addObject(obj);
        if (!added) {
          console.warn(`B"H - NivrahFactory: addObject rejected [${obj.name}].`);
        }
      }

      // Force-flush so walls are solid on the very first physics frame
      if (typeof octree._processQueues === 'function') {
        octree._processQueues(true);
      }

    } catch (e) {
      console.error(`B"H - NivrahFactory._registerWithOctree failed for [${obj.name}]:`, e);
    }
  }

  /**
   * @method build
   * @description
   *   Receives a soul-blueprint, looks up its builder, calls the builder,
   *   adds results to the scene with correct matrixWorld, registers with octree.
   *
   * @param   {import('./nivrayimDefs.js').NefeshDef} def
   * @returns {Promise<THREE.Object3D[]>}
   */
  async build(def) {
    const builder = BUILDER_MAP.get(def.type);
    if (!builder) {
      console.warn(`B"H - NivrahFactory: Unknown type "${def.type}" for id "${def.id}".`);
      return [];
    }

    const objects = await builder(this.scene, this.physics, def);

    for (const obj of objects) {
      obj.userData.nefeshId   = def.id;
      obj.userData.nefeshType = def.type;

      // Step 1: Add to scene — establishes parent chain for correct matrixWorld
      this.scene.add(obj);

      // Step 2: Force matrixWorld update BEFORE octree registration.
      // Octree reads world-space triangle positions.
      // Without this, walls register at local-space coords (often near origin).
      obj.updateWorldMatrix(true, true);

      // Step 3: THE TIKKUN — seal into physics collision octree.
      this._registerWithOctree(obj);
    }

    return objects;
  }

  /**
   * @method buildAll
   * @description
   *   Manifests ALL souls in the definitions array, in order.
   *
   * @param   {import('./nivrayimDefs.js').NefeshDef[]} defs
   * @returns {Promise<Map<string, THREE.Object3D[]>>}
   */
  async buildAll(defs) {
    const results = new Map();

    for (const def of defs) {
      const objs = await this.build(def);
      results.set(def.id, objs);
    }

    console.log(`B"H - NivrahFactory.buildAll: ${results.size} souls manifested and collision-sealed.`);
    return results;
  }
}

export default NivrahFactory;
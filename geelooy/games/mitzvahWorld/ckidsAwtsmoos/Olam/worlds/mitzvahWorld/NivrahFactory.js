
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE FACTORY OF SOULS — NivrahFactory.js
 *   ─────────────────────────────────────────
 *   From the infinite reservoir of the Awtsmoos,
 *   this factory draws forth SPECIFIC vessels —
 *   each type a unique channel for Divine light.
 *
 *   The terrain is the Malchus — the kingdom, the ground,
 *     the receiving vessel of all that flows from above.
 *   The grass is the Netzach — victory, growth, endless proliferation.
 *   The brick is the Gevurah — structure, boundary, holy severity.
 *   The hut is the Chesed — shelter, warmth, encompassing kindness.
 *   The Chassid himself is the Tiferes — beauty, balance, the tzaddik
 *     who unifies all the sefirot into one harmonious form.
 *
 *   Each builder is a pure function from (scene, physics, def) → mesh[].
 *   The factory is data-driven: a Map from type-string to builder.
 *   No switch statements. Only the elegant dispatch of the Seder Hishtalshelus.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module NivrahFactory
 */

import { buildTerrain }   from './builders/buildTerrain.js';
import { buildGrassPatch } from './builders/buildGrassPatch.js';
import { buildBrickWall }  from './builders/buildBrickWall.js';
import { buildHut }        from './builders/buildHut.js';
import { buildGlbEntity }  from './builders/buildGlbEntity.js';

/**
 * @constant {Map<string, Function>} BUILDER_MAP
 * @description
 *   The sacred ledger of builders.
 *   Each key is a soul-type string from NIVRAYIM_DEFS.
 *   Each value is an async builder function:
 *     (scene: THREE.Scene, physics: PhysicsWorld, def: NefeshDef) => Promise<THREE.Object3D[]>
 *
 *   Like the 10 sefirot each channeling a specific Divine attribute,
 *   each builder channels a specific creative power into physical form.
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
 *   The master dispatcher. Give it a soul-definition,
 *   it returns an array of living Three.js objects with physics bodies.
 *
 *   "And G-d saw all that He had made, and behold — it was very good."
 *   This factory ensures every nefesh-def becomes something VERY GOOD.
 */
export class NivrahFactory {

  /**
   * @constructor
   * @param {THREE.Scene}   scene   - The Three.js scene (the Olam HaAsiyah)
   * @param {Object}        physics - The physics world instance (Gevurah)
   */
  constructor(scene, physics) {
    /** @type {THREE.Scene} */
    this.scene = scene;
    /** @type {Object} */
    this.physics = physics;
  }

  /**
   * @method build
   * @description
   *   Receive a soul-blueprint (NefeshDef), look up its builder,
   *   call the builder, attach results to the scene, return the objects.
   *
   *   Like the craftsman Betzalel who "knew how to combine the letters
   *   with which heaven and earth were created" — this method knows
   *   how to combine scene + physics + def into living geometry.
   *
   * @param   {import('./nivrayimDefs.js').NefeshDef} def - The soul blueprint
   * @returns {Promise<THREE.Object3D[]>}  The manifested objects
   * @throws  {Error} If the type is unknown (an unregistered soul-type)
   */
  async build(def) {
    const builder = BUILDER_MAP.get(def.type);
    if (!builder) {
      console.warn(`B"H - NivrahFactory: Unknown type "${def.type}" for id "${def.id}". Soul unmanifested.`);
      return [];
    }

    // B"H: silent


    const objects = await builder(this.scene, this.physics, def);

    for (const obj of objects) {
      obj.userData.nefeshId = def.id;
      obj.userData.nefeshType = def.type;
      this.scene.add(obj);
    }

    return objects;
  }

  /**
   * @method buildAll
   * @description
   *   Manifest ALL souls in the given definitions array, in order.
   *   Returns a flat map of id → objects[].
   *
   *   Like the six days of creation — each day a new category of being
   *   springs forth from the Divine Speech. Here we compress all six
   *   into one beautiful async waterfall.
   *
   * @param   {import('./nivrayimDefs.js').NefeshDef[]} defs
   * @returns {Promise<Map<string, THREE.Object3D[]>>}
   */
  async buildAll(defs) {
    /** @type {Map<string, THREE.Object3D[]>} */
    const results = new Map();

    for (const def of defs) {
      const objs = await this.build(def);
      results.set(def.id, objs);
    }

    // B"H: silent

    return results;
  }
}

export default NivrahFactory;

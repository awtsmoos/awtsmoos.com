/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE UNIVERSAL DISPATCHER — NivrahFactory.js
 *   ──────────────────────────────────────────────
 *   Points 1, 21, and 30 of the 32 Emanations.
 *   Everything is now Data-Driven via the GeometryEngine.
 * ════════════════════════════════════════════════════════════════════════
 */

console.log("B\"H - NivrahFactory: Initializing...");

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { GeometryEngine }    from './GeometryEngine.js';
import { ARCHITECT_MANIFEST } from './ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/manifests/ArchitectManifest.js';
import { NIVRA_SCHEMA }      from './ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/manifests/NivraSchema.js';

// Special JS-based logic for systems that need persistent state or hooks
import { buildTerrain }        from './builders/buildTerrain.js';
import { buildGrassPatch }     from './builders/buildGrassPatch.js';
import { buildInteractiveElevator } from './builders/interactive/buildInteractiveElevator.js';

/**
 * @class NivrahFactory
 */
export class NivrahFactory {
  constructor(scene, physics, olam = null) {
    console.log("B\"H - NivrahFactory: Constructor called");
    this.scene = scene;
    this.physics = physics;
    this.olam = olam;

    if (this.olam && !this.olam.tzimtzum) {
      this.olam.tzimtzum = {
        _callbacks: [],
        onUpdate(fn) { if (typeof fn === 'function') this._callbacks.push(fn); },
        dispatch(dt) { for (let i = 0; i < this._callbacks.length; i++) this._callbacks[i](0, dt); }
      };
    }
  }

  async build(def) {
    console.log(`B\"H - NivrahFactory: Building ${def.type} (${def.id})`);
    
    // ── 1. Check for Special JS Builders ──
    const specialBuilders = {
      terrain: buildTerrain,
      grassPatch: buildGrassPatch,
      interactive_elevator: buildInteractiveElevator
    };

    const jsBuilder = specialBuilders[def.type];
    if (jsBuilder) {
      const objs = await jsBuilder(this.scene, this.physics, def, this.olam);
      return this._finalize(objs, def);
    }

    // ── 2. Use Data-Driven Geometry Engine ──
    const blueprint = ARCHITECT_MANIFEST[def.type];
    if (blueprint) {
      const defaults = NIVRA_SCHEMA[def.type] || {};
      const mergedProps = { ...defaults, ...(def.props || {}) };
      
      const group = GeometryEngine.manifest(blueprint, { 
        vars: mergedProps, 
        olam: this.olam,
        blueprints: ARCHITECT_MANIFEST 
      });
      
      const [px, py, pz] = def.position || [0,0,0];
      group.position.set(px, py, pz);
      group.name = def.id;

      return this._finalize([group], def);
    }

    console.warn(`B"H - NivrahFactory: Unknown type "${def.type}" for id "${def.id}".`);
    return [];
  }

  _finalize(objects, def) {
    for (const obj of objects) {
      obj.userData.nefeshId = def.id;
      obj.userData.nefeshType = def.type;
      this.scene.add(obj);
      obj.updateMatrixWorld(true);
      
      if (this.olam?.worldOctree) {
        obj.traverse(child => {
          if (child.userData?.isSolid) this.olam.worldOctree.fromGraphNode(child);
        });
      }
    }
    return objects;
  }

  async buildAll(defs) {
    console.log(`B\"H - NivrahFactory: Building all ${defs.length} entities`);
    const results = new Map();
    for (const def of defs) {
      try {
        const objs = await this.build(def);
        results.set(def.id, objs);
      } catch (e) {
        console.error(`B\"H - NivrahFactory: Error building ${def.id}`, e);
      }
    }
    return results;
  }
}

export default NivrahFactory;
/***
 * B"H
 * @file NivrahFactory.js
 * @description
 * Universal Mitzvah World dispatcher for small, active builders and
 * data-driven GeometryEngine blueprints.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { GeometryEngine } from './GeometryEngine.js';
import { ARCHITECT_MANIFEST } from './data/manifests/ArchitectManifest.js';
import { NIVRA_SCHEMA } from './data/manifests/NivraSchema.js';

import { buildTerrain } from './builders/buildTerrain.js';
import { buildGrassPatch } from './builders/buildGrassPatch.js';
import { buildInteractiveElevator } from './builders/interactive/buildInteractiveElevator.js';
import { buildGlbEntity } from './builders/buildGlbEntity.js';
import { buildNpcChossid } from './builders/npc/buildNpcChossid.js';
import { buildTree } from './builders/buildTree.js';

/**
 * B"H
 * Creates a minimal tzimtzum bridge when the outer olam does not provide one.
 *
 * @param {any} olam
 * Optional world context.
 */
function ensureTzimtzum(olam) {
  if (!olam || olam.tzimtzum) return;

  olam.tzimtzum = {
    _callbacks: [],
    onUpdate(fn) {
      if (typeof fn === 'function') this._callbacks.push(fn);
    },
    dispatch(dt) {
      for (let i = 0; i < this._callbacks.length; i++) {
        this._callbacks[i](0, dt);
      }
    }
  };
}

/**
 * B"H
 * @class NivrahFactory
 * Builds discrete Nivrayim and finalizes them into the scene.
 */
export class NivrahFactory {
  constructor(scene, physics, olam = null) {
    this.scene = scene;
    this.physics = physics;
    this.olam = olam;
    ensureTzimtzum(this.olam);
  }

  async build(def) {
    const specialBuilders = {
      terrain: buildTerrain,
      grassPatch: buildGrassPatch,
      interactive_elevator: buildInteractiveElevator,
      glbEntity: buildGlbEntity,
      tree: buildTree,
      npcChossid: buildNpcChossid,
      chossidNpc: buildNpcChossid
    };

    const jsBuilder = specialBuilders[def.type];
    if (jsBuilder) {
      const objs = await jsBuilder(this.scene, this.physics, def, this.olam);
      return this._finalize(objs, def);
    }

    const blueprint = ARCHITECT_MANIFEST[def.type];
    if (blueprint) {
      const defaults = NIVRA_SCHEMA[def.type] || {};
      const mergedProps = { ...defaults, ...(def.props || {}) };
      const group = GeometryEngine.manifest(blueprint, {
        vars: mergedProps,
        olam: this.olam,
        blueprints: ARCHITECT_MANIFEST
      });

      const [px, py, pz] = def.position || [0, 0, 0];
      group.position.set(px, py, pz);
      group.name = def.id;

      return this._finalize([group], def);
    }

    console.warn(`B"H - NivrahFactory: Unknown type "${def.type}" for id "${def.id}".`);
    return [];
  }

  _finalize(objects, def) {
    for (const obj of objects) {
      if (!obj) continue;

      obj.userData.nefeshId = def.id;
      obj.userData.nefeshType = def.type;

      if (this.scene && typeof this.scene.add === 'function' && obj.parent !== this.scene) {
        this.scene.add(obj);
      }

      if (typeof obj.updateMatrixWorld === 'function') obj.updateMatrixWorld(true);

      if (this.olam?.worldOctree && typeof obj.traverse === 'function') {
        obj.traverse(child => {
          if (child.userData?.isSolid) this.olam.worldOctree.fromGraphNode(child);
        });
      }
    }

    return objects;
  }

  async buildAll(defs) {
    const results = new Map();

    for (const def of defs) {
      try {
        const objs = await this.build(def);
        results.set(def.id, objs);
      } catch (error) {
        console.error(`B"H - NivrahFactory: Error building ${def?.id || '(unknown)'}`, error);
      }
    }

    return results;
  }
}

export default NivrahFactory;

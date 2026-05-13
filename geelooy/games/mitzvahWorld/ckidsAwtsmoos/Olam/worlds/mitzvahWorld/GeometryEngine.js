/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE INFINITE GEOMETRY ENGINE — GeometryEngine.js
 *   ──────────────────────────────────────────────────
 *   High-intensity recursive data-interpreter.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { getMaterial } from './materials/MaterialFactory.js';
import { GeometryModifiers } from './GeometryModifiers.js';
import { ProceduralGeometryFactory } from './ProceduralGeometryFactory.js';
import ChasveiAwtsmoos from '../../../utils/ChasveiAwtsmoos.js';

export class GeometryEngine {
  /**
   * B"H
   * @method manifest
   * @description
   * 📜 CHAPTER 1: THE EMANATION OF FORM 📜
   * 
   * "In the beginning, He created the heavens and the earth."
   * From the void of the JSON blueprint, the manifestor draws down the 
   * letters of creation, arranging them into the vessels of 3D geometry.
   * 
   * This method recursively traverses the blueprint, resolving variables
   * through the $Sefirotic channel (the context) and manifesting each 
   * component into the physical sanctuary of the THREE.Group.
   * 
   * @param {Object} blueprint - The sacred scroll of geometry.
   * @param {Object} context - The spiritual context for variable resolution.
   * @returns {THREE.Group} The manifested vessel of Light.
   */
  static manifest(blueprint, context = {}) {
    console.log(`B\"H - GeometryEngine: Manifesting blueprint with ${blueprint.components?.length || 0} components`);
    
    const group = new THREE.Group();
    const vars = { 
      ...(blueprint.variables || {}), 
      ...(context.vars || {}) 
    };

    const resolve = (val) => {
      if (typeof val !== 'string') return val;
      if (!val.includes('$')) return val;

      let expression = val;
      const sortedKeys = Object.keys(vars).sort((a, b) => b.length - a.length);
      for (const k of sortedKeys) {
        const v = vars[k];
        expression = expression.split('$' + k).join(v);
      }

      try {
        const cleaned = expression.replace(/\$/g, '');
        const res = new Function(`return (${cleaned})`)();
        return res;
      } catch (e) {
        return expression;
      }
    };

    const localContext = { ...context, vars, resolve };

    (blueprint.components || []).forEach(comp => {
      try {
        this._processComponent(group, comp, localContext);
      } catch (e) {
        console.error(`B"H - GeometryEngine: Error in component`, comp, e);
      }
    });

    console.log(`B\"H - GeometryEngine: Manifested group with ${group.children.length} children`);
    return group;
  }

  static _processComponent(group, comp, ctx) {
    const { resolve } = ctx;

    if (comp.type === 'repeat') {
      const count = resolve(comp.count);
      const offset = (comp.offset || [0,0,0]).map(resolve);
      for (let i = 0; i < count; i++) {
        const subVars = { ...ctx.vars, INDEX: i };
        const subGroup = this.manifest(comp.component, { ...ctx, vars: subVars });
        subGroup.position.set(offset[0] * i, offset[1] * i, offset[2] * i);
        group.add(subGroup);
      }
      return;
    }

    if (comp.blueprint) {
      const bp = ctx.blueprints?.[comp.blueprint];
      if (bp) {
        const subGroup = this.manifest(bp, { 
          ...ctx, 
          vars: { ...ctx.vars, ...(comp.vars || {}) } 
        });
        const [px, py, pz] = (comp.position || [0,0,0]).map(resolve);
        subGroup.position.set(px, py, pz);
        group.add(subGroup);
        return;
      }
    }

    const meshes = this._createMesh(comp, resolve);
    meshes.forEach(m => group.add(m));
  }

  static _createMesh(comp, resolve) {
    const { 
      type, 
      params = [], 
      position = [0,0,0], 
      rotation = [0,0,0], 
      material = 'JERUSALEM_STONE',
      isSolid = true
    } = comp;
    
    let geo;
    const p = params.map(resolve);
    
    if (type === 'box')      geo = new THREE.BoxGeometry(...p);
    else if (type === 'cylinder') geo = new THREE.CylinderGeometry(...p);
    else if (type === 'sphere')   geo = new THREE.SphereGeometry(...p);
    else if (type === 'plane')    geo = new THREE.PlaneGeometry(...p);
    else if (type === 'icosphere') geo = new THREE.IcosahedronGeometry(...p);
    
    if (type === 'proceduralTree') {
        const treeData = ProceduralGeometryFactory.createTree(comp.options || {});
        const trunkMesh = new THREE.Mesh(treeData.branches, getMaterial(material));
        const leavesMesh = new THREE.Mesh(treeData.leaves, getMaterial(comp.leafMaterial || 'LEAVES'));
        
        const treeGroup = [trunkMesh, leavesMesh];
        treeGroup.forEach(m => {
            const [px, py, pz] = position.map(resolve);
            m.position.set(px, py, pz);
            const [rx, ry, rz] = rotation.map(resolve);
            m.rotation.set(rx, ry, rz);
            m.castShadow = true;
            m.receiveShadow = true;
            m.userData.isSolid = isSolid !== false;
        });
        return treeGroup;
    }

    if (type === 'proceduralGrass') {
        geo = ProceduralGeometryFactory.createGrass(comp.options || {});
    }

    if (type === 'proceduralTube') {
        const opts = { ...comp.options };
        if (opts.path) opts.path = opts.path.map(p => new THREE.Vector3(...p.map(resolve)));
        if (opts.bezier && opts.bezier.points) opts.bezier.points = opts.bezier.points.map(p => new THREE.Vector3(...p.map(resolve)));
        geo = ProceduralGeometryFactory.createTube(opts);
    }

    if (!geo) return [];

    // B"H - Applying the modifiers of the Essence
    if (comp.modifiers) {
        geo = GeometryModifiers.applyModifiers(geo, comp.modifiers, resolve);
    }

    const mat = getMaterial(material);
    const mesh = new THREE.Mesh(geo, mat);
    
    const [px, py, pz] = position.map(resolve);
    mesh.position.set(px, py, pz);
    
    const [rx, ry, rz] = rotation.map(resolve);
    mesh.rotation.set(rx, ry, rz);
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isSolid = isSolid !== false;

    return [mesh];
  }
}


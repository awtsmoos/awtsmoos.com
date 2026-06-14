// B"H
/**
 * @file GeometryEngine.js
 * @description
 * Chapter 1008: local procedural tree creation is removed from mitzvahWorld.
 * This engine can still manifest normal geometry and grass/tubes, but tree
 * vessels must come from /libs/awtsmoos3d/tree/heroTree.js through the current
 * advanced tree renderers, never the old procedural tree generator.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { getMaterial } from './materials/MaterialFactory.js';
import { GeometryModifiers } from './GeometryModifiers.js';
import { ProceduralGeometryFactory } from './ProceduralGeometryFactory.js';
export class GeometryEngine {
  static manifest(blueprint, context = {}) {
    const group = new THREE.Group();
    const vars = { ...(blueprint.variables || {}), ...(context.vars || {}) };
    const resolve = val => {
      if (typeof val !== 'string' || !val.includes('$')) return val;
      let expression = val;
      for (const k of Object.keys(vars).sort((a, b) => b.length - a.length)) expression = expression.split('$' + k).join(vars[k]);
      try { return new Function(`return (${expression.replace(/\$/g, '')})`)(); } catch { return expression; }
    };
    const localContext = { ...context, vars, resolve };
    (blueprint.components || []).forEach(comp => { try { this._processComponent(group, comp, localContext); } catch (e) { console.error('B"H - GeometryEngine component error', comp, e); } });
    return group;
  }
  static _processComponent(group, comp, ctx) {
    const { resolve } = ctx;
    if (comp.type === 'repeat') { const count = resolve(comp.count), offset = (comp.offset || [0,0,0]).map(resolve); for (let i = 0; i < count; i++) { const subGroup = this.manifest(comp.component, { ...ctx, vars: { ...ctx.vars, INDEX: i } }); subGroup.position.set(offset[0] * i, offset[1] * i, offset[2] * i); group.add(subGroup); } return; }
    if (comp.blueprint) { const bp = ctx.blueprints?.[comp.blueprint]; if (bp) { const subGroup = this.manifest(bp, { ...ctx, vars: { ...ctx.vars, ...(comp.vars || {}) } }); const [px, py, pz] = (comp.position || [0,0,0]).map(resolve); subGroup.position.set(px, py, pz); group.add(subGroup); return; } }
    this._createMesh(comp, resolve).forEach(m => group.add(m));
  }
  static _createMesh(comp, resolve) {
    const { type, params = [], position = [0,0,0], rotation = [0,0,0], material = 'JERUSALEM_STONE', isSolid = true } = comp;
    const p = params.map(resolve); let geo;
    if (type === 'box') geo = new THREE.BoxGeometry(...p);
    else if (type === 'cylinder') geo = new THREE.CylinderGeometry(...p);
    else if (type === 'sphere') geo = new THREE.SphereGeometry(...p);
    else if (type === 'plane') geo = new THREE.PlaneGeometry(...p);
    else if (type === 'icosphere') geo = new THREE.IcosahedronGeometry(...p);
    else if (type === 'proceduralGrass') geo = ProceduralGeometryFactory.createGrass(comp.options || {});
    else if (type === 'proceduralTube') { const opts = { ...comp.options }; if (opts.path) opts.path = opts.path.map(p => new THREE.Vector3(...p.map(resolve))); if (opts.bezier?.points) opts.bezier.points = opts.bezier.points.map(p => new THREE.Vector3(...p.map(resolve))); geo = ProceduralGeometryFactory.createTube(opts); }
    if (!geo) return [];
    if (comp.modifiers) geo = GeometryModifiers.applyModifiers(geo, comp.modifiers, resolve);
    const mesh = new THREE.Mesh(geo, getMaterial(material));
    const [px, py, pz] = position.map(resolve), [rx, ry, rz] = rotation.map(resolve);
    mesh.position.set(px, py, pz); mesh.rotation.set(rx, ry, rz); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.isSolid = isSolid !== false;
    return [mesh];
  }
}

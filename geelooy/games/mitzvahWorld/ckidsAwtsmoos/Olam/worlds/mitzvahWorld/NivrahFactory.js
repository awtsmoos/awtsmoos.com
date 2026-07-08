// B"H
/** NivrahFactory: builds village objects with fresh grass/chossid runtime imports. */
import { GeometryEngine } from "./GeometryEngine.js?v=awtsmoos-geometry-engine-20260614-bh2";
import { ARCHITECT_MANIFEST } from "./data/manifests/ArchitectManifest.js";
import { NIVRA_SCHEMA } from "./data/manifests/NivraSchema.js";
import { buildTerrain } from "./builders/buildTerrain.js?v=awtsmoos-terrain-builder-20260614-bh2";
import { buildGrassPatch } from "./builders/buildGrassPatch.js?v=grass-chossid-stepwise-20260707-bh1";
import { buildInteractiveElevator } from "./builders/interactive/buildInteractiveElevator.js?v=awtsmoos-interactive-elevator-20260614-bh2";
import { buildGlbEntity } from "./builders/buildGlbEntity.js?v=awtsmoos-glb-entity-builder-20260614-bh2";
import { buildNpcChossid } from "./builders/npc/buildNpcChossid.js?v=awtsmoos-npc-builder-entry-20260614-bh2";
import { buildTree } from "./builders/buildTree.js";
function ensureTzimtzum(olam) { if (!olam || olam.tzimtzum) return; olam.tzimtzum = { _callbacks:[], onUpdate(fn) { if (typeof fn === "function") this._callbacks.push(fn); }, dispatch(dt) { for (const fn of this._callbacks) fn(0, dt); } }; }
function specialBuilders() { return { terrain:buildTerrain, grassPatch:buildGrassPatch, interactive_elevator:buildInteractiveElevator, glbEntity:buildGlbEntity, tree:buildTree, npcChossid:buildNpcChossid, chossidNpc:buildNpcChossid }; }
function defId(def) { return def?.id || "unknown"; }
function defType(def) { return def?.type || "unknown"; }
function propsOf(def, defaults) { return Object.assign({}, defaults || {}, def?.props || {}); }
function copyProps(obj, def) { obj.userData ||= {}; Object.assign(obj.userData, { nefeshId:defId(def), nefeshType:defType(def), nefeshProps:def?.props || {} }, def?.props || {}); }
function addToOctree(olam, obj) { if (!olam?.worldOctree?.fromGraphNode || !obj?.traverse) return; obj.traverse(child => { if (child.userData?.isSolid) olam.worldOctree.fromGraphNode(child); }); }
export class NivrahFactory {
  constructor(scene, physics, olam = null) { this.scene = scene; this.physics = physics; this.olam = olam; ensureTzimtzum(this.olam); }
  async build(def) {
    const builder = specialBuilders()[defType(def)]; if (builder) return this._finalize(await builder(this.scene, this.physics, def, this.olam), def);
    const blueprint = ARCHITECT_MANIFEST[defType(def)]; if (!blueprint) { console.warn('B"H - NivrahFactory: Unknown type "' + defType(def) + '" for id "' + defId(def) + '".'); return []; }
    const group = GeometryEngine.manifest(blueprint, { vars:propsOf(def, NIVRA_SCHEMA[defType(def)]), olam:this.olam, blueprints:ARCHITECT_MANIFEST });
    const p = Array.isArray(def?.position) ? def.position : [0, 0, 0]; group.position.set(p[0], p[1], p[2]); group.name = defId(def); return this._finalize([group], def);
  }
  _finalize(objects, def) { const out = Array.isArray(objects) ? objects : []; for (const obj of out) { if (!obj) continue; copyProps(obj, def); if (this.scene && obj.parent !== this.scene) this.scene.add(obj); obj.updateMatrixWorld?.(true); addToOctree(this.olam, obj); } return out; }
  async buildAll(defs) { const results = new Map(); for (const def of defs || []) { try { results.set(defId(def), await this.build(def)); } catch (error) { console.error('B"H - NivrahFactory: Error building ' + defId(def), error); } } return results; }
}
export default NivrahFactory;

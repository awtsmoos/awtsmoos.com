// B"H
/**
 * @file NivrahFactory.js
 * @description Universal parser-clear dispatcher for Mitzvah World builders and GeometryEngine blueprints.
 */
import { GeometryEngine } from "./GeometryEngine.js?v=awtsmoos-geometry-engine-20260614-bh2";
import { ARCHITECT_MANIFEST } from "./data/manifests/ArchitectManifest.js";
import { NIVRA_SCHEMA } from "./data/manifests/NivraSchema.js";
import { buildTerrain } from "./builders/buildTerrain.js?v=awtsmoos-terrain-builder-20260614-bh2";
import { buildGrassPatch } from "./builders/buildGrassPatch.js?v=awtsmoos-grass-patch-builder-20260614-bh2";
import { buildInteractiveElevator } from "./builders/interactive/buildInteractiveElevator.js?v=awtsmoos-interactive-elevator-20260614-bh2";
import { buildGlbEntity } from "./builders/buildGlbEntity.js?v=awtsmoos-glb-entity-builder-20260614-bh2";
import { buildNpcChossid } from "./builders/npc/buildNpcChossid.js?v=awtsmoos-npc-builder-entry-20260614-bh2";
import { buildTree } from "./builders/buildTree.js";
function ensureTzimtzum(olam) { if (!olam || olam.tzimtzum) return; olam.tzimtzum = { _callbacks:[], onUpdate(fn) { if (typeof fn === "function") this._callbacks.push(fn); }, dispatch(dt) { for (let i=0; i<this._callbacks.length; i++) this._callbacks[i](0, dt); } }; }
function specialBuilders() { return { terrain:buildTerrain, grassPatch:buildGrassPatch, interactive_elevator:buildInteractiveElevator, glbEntity:buildGlbEntity, tree:buildTree, npcChossid:buildNpcChossid, chossidNpc:buildNpcChossid }; }
function defId(def) { return def && def.id ? def.id : "unknown"; }
function defType(def) { return def && def.type ? def.type : "unknown"; }
function propsOf(def, defaults) { return Object.assign({}, defaults || {}, def && def.props ? def.props : {}); }
function addToOctree(olam, obj) { if (!olam || !olam.worldOctree || typeof olam.worldOctree.fromGraphNode !== "function" || !obj || typeof obj.traverse !== "function") return; obj.traverse(child => { const data = child.userData || {}; if (data.isSolid) olam.worldOctree.fromGraphNode(child); }); }
export class NivrahFactory {
  constructor(scene, physics, olam = null) { this.scene = scene; this.physics = physics; this.olam = olam; ensureTzimtzum(this.olam); }
  async build(def) { const builders = specialBuilders(), jsBuilder = builders[defType(def)]; if (jsBuilder) return this._finalize(await jsBuilder(this.scene, this.physics, def, this.olam), def); const blueprint = ARCHITECT_MANIFEST[defType(def)]; if (blueprint) { const group = GeometryEngine.manifest(blueprint, { vars:propsOf(def, NIVRA_SCHEMA[defType(def)]), olam:this.olam, blueprints:ARCHITECT_MANIFEST }); const p = Array.isArray(def.position) ? def.position : [0,0,0]; group.position.set(p[0], p[1], p[2]); group.name = defId(def); return this._finalize([group], def); } console.warn(`B"H - NivrahFactory: Unknown type "${defType(def)}" for id "${defId(def)}".`); return []; }
  _finalize(objects, def) { const out = Array.isArray(objects) ? objects : []; for (const obj of out) { if (!obj) continue; if (!obj.userData) obj.userData = {}; obj.userData.nefeshId = defId(def); obj.userData.nefeshType = defType(def); if (this.scene && typeof this.scene.add === "function" && obj.parent !== this.scene) this.scene.add(obj); if (typeof obj.updateMatrixWorld === "function") obj.updateMatrixWorld(true); addToOctree(this.olam, obj); } return out; }
  async buildAll(defs) { const results = new Map(); for (const def of defs || []) { try { results.set(defId(def), await this.build(def)); } catch (error) { console.error(`B"H - NivrahFactory: Error building ${defId(def)}`, error); } } return results; }
}
export default NivrahFactory;

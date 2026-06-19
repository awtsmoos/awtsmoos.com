// B"H
import { ShapeNodeFactory as S } from '../shapes/ShapeNodeFactory.js';
import { AssetLibrary } from '../assets/AssetLibrary.js';
/** Resolves authored scene documents into graph nodes without procedural invention. */
export class SceneResolver {
  static resolve(doc, context = {}) { const world = doc.world?.toJSON?.() || doc.world || {}; return S.group(doc.id || 'scene_document', this.districts(world, context)); }
  static districts(world, ctx) { return (world.districts || []).map(d => this.group(d, ctx)); }
  static group(group = {}, ctx) { const kids = (group.children || []).map(c => c.kind === 'asset' ? this.asset(c, ctx) : this.group(c, ctx)); return S.group(group.id || 'group', kids, { x: group.x || 0, y: group.y || 0 }); }
  static asset(asset, ctx) { return AssetLibrary.build(asset.assetId || asset.id, { ...ctx, ...asset, ...(asset.props || {}) }); }
}

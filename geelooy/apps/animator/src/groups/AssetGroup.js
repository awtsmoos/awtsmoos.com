// B"H
import { AssetLibrary } from '../assets/AssetLibrary.js';
import { ShapeNodeFactory as S } from '../shapes/ShapeNodeFactory.js';
export class AssetGroup {
  static build(id, assets = [], context = {}) { return S.group(id, assets.map(a => AssetLibrary.build(a.assetId || a.id, { ...context, ...a, id: a.id }))); }
}

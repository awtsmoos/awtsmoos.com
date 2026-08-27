// B"H
import { AssetGroup } from './AssetGroup.js';
export class KitchenGroup {
  static build(width, height) { return AssetGroup.build('kitchen_group', [{ id: 'wall', assetId: 'wall' }, { id: 'window', assetId: 'window' }, { id: 'shelf', assetId: 'shelf' }, { id: 'table', assetId: 'table' }], { width, height }); }
}

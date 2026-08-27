// B"H
import { AssetGroup } from './AssetGroup.js';
export class HealthyLunchGroup {
  static build(width, height) { const y = height * .58, x = width * .48; return AssetGroup.build('healthy_lunch_group', [{ id: 'plate', assetId: 'plate', x, y }, { id: 'apple', assetId: 'apple', x: x - 58, y: y - 42 }, { id: 'carrot', assetId: 'carrot', x: x + 18, y: y - 34 }, { id: 'sandwich', assetId: 'sandwich', x: x + 92, y: y - 34 }], { width, height }); }
}

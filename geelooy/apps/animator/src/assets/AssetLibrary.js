// B"H
import { FoodAssets } from './food/FoodAssets.js';
import { KitchenAssets } from './environment/KitchenAssets.js';
import { HumanAssets } from './characters/HumanAssets.js';
/** Registry of explicit authored assets. */
export class AssetLibrary {
  static build(assetId, opts = {}) {
    const { id = assetId, x = 0, y = 0, width = 720, height = 1080 } = opts;
    const table = { apple: () => FoodAssets.apple(id, x, y), carrot: () => FoodAssets.carrot(id, x, y), sandwich: () => FoodAssets.sandwich(id, x, y), plate: () => FoodAssets.plate(id, x, y), wall: () => KitchenAssets.wall(width, height), table: () => KitchenAssets.table(width, height), window: () => KitchenAssets.window(width, height), shelf: () => KitchenAssets.shelf(width, height), human: () => HumanAssets.marker(id, x, y, opts.color) };
    return (table[assetId] || table.human)();
  }
}

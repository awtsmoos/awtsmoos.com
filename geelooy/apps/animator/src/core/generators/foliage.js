/* B”H */
import { TrunkRenderer } from './foliage/TrunkRenderer.js';
import { LeafRenderer } from './foliage/LeafRenderer.js';

export class FoliageGenerator {
  static generate(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    TrunkRenderer.draw(ctx, size);
    LeafRenderer.draw(ctx, size);
    ctx.restore();
  }
}

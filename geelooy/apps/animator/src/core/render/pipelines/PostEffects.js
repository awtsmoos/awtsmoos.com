// B"H
export class PostEffects {
  static applyBloom(ctx, intensity) {
    ctx.filter = `blur(${intensity}px) brightness(1.2)`;
  }
}

// B"H
// Lighting pass flushes the low-res light buffer into the main world.
export const lightingPass = tools => (ctx, s) => tools.light?.flush(ctx, s.w, s.h);

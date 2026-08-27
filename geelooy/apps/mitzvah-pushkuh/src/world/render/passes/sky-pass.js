// B"H
// Sky pass delegates to the living sky system.
export const skyPass = tools => (ctx, s) => tools.sky?.draw(ctx, s.w, s.h, s.t, s.q, tools.atlas);

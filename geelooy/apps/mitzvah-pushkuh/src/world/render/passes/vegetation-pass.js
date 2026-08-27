// B"H
// Vegetation pass lets grass and flowers answer wind.
export const vegetationPass = tools => (ctx, s) => tools.vegetation?.draw(ctx, s.w, s.h, s.t, s.q, tools.weatherState?.wind);

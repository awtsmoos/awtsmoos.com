// B"H
// Lens pass adds a subtle cinematic vignette without extra assets.
export const lensPass = () => (ctx, s) => { if (s.q.emergency) return; ctx.save(); ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = "#0006"; ctx.lineWidth = Math.max(12, s.w * .025); ctx.strokeRect(0, 0, s.w, s.h); ctx.restore(); };

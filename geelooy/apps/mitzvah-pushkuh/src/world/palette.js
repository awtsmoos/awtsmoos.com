// B"H
// Ten colors, ten gates, one light that keeps dividing without separating.
export const colors = {
  Tzedakah: "#ffe08a", Torah: "#8feaff", Chesed: "#ff87d7",
  Tefillah: "#d8b4ff", "Ahavas Yisroel": "#9dffbc",
  "Personal Growth": "#ffb36a", Shabbos: "#b7a6ff",
  Family: "#ffb1a4", School: "#a8ffef", Shul: "#fff4c2"
};
export const colorFor = entry => colors[entry?.type] || "#ffe08a";
export const screen = fn => ctx => { ctx.save(); ctx.globalCompositeOperation = "screen"; fn(ctx); ctx.restore(); };

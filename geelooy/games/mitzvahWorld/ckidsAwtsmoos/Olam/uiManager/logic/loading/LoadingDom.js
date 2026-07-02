// B"H
/** DOM helpers: no gameplay veil is removed by mystery selectors. */
export const doc = () => typeof document === "undefined" ? null : document;
export const byId = id => doc()?.getElementById(id) || null;
export const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
export const canvasReady = () => Boolean(doc()?.querySelector?.("canvas"));
export const frame = fn => (globalThis.requestAnimationFrame || globalThis.setTimeout)(fn, 16);
export function removeLoaderDom() {
  doc()?.querySelectorAll?.(".loading,.loadingContent,.menu .rectangle,.menu.hidden.offscreen")
    ?.forEach(n => n.remove());
  doc()?.documentElement?.classList?.add?.("awtsmoos-gameplay-dom-quiet");
}

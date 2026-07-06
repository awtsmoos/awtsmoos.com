// B"H
/** DOM helpers: no gameplay veil is removed by mystery selectors. */
export const doc = () => typeof document === "undefined" ? null : document;
export const byId = id => doc()?.getElementById(id) || null;
export const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
export const canvasReady = () => {
  const canvas = doc()?.querySelector?.("canvas");
  return Boolean(canvas && Number(canvas.width || canvas.clientWidth || 0) > 0 && Number(canvas.height || canvas.clientHeight || 0) > 0);
};
export const canvasInfo = () => {
  const canvas = doc()?.querySelector?.("canvas");
  return canvas ? { width:Number(canvas.width || 0), height:Number(canvas.height || 0), clientWidth:Number(canvas.clientWidth || 0), clientHeight:Number(canvas.clientHeight || 0), ready:canvasReady() } : { ready:false };
};
export const frame = fn => (globalThis.requestAnimationFrame || globalThis.setTimeout)(fn, 16);
export function removeLoaderDom() {
  doc()?.querySelectorAll?.(".loading,.loadingContent,.menu .rectangle,.menu.hidden.offscreen")
    ?.forEach(n => n.remove());
  doc()?.documentElement?.classList?.add?.("awtsmoos-gameplay-dom-quiet");
}

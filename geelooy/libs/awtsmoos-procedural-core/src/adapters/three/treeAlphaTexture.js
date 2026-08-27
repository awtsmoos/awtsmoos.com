// B"H
/** @file treeAlphaTexture.js @description Removes white leaf matte once, then reuses transparent textures. */
const CACHE = new WeakMap();
function sourceImage(texture){ return texture?.image || texture?.source?.data || null; }
function copyState(THREE, src, dst){ dst.name = src.name ? `${src.name}_alpha` : 'awts_leaf_alpha'; dst.flipY = src.flipY; dst.wrapS = src.wrapS ?? THREE.ClampToEdgeWrapping; dst.wrapT = src.wrapT ?? THREE.ClampToEdgeWrapping; dst.repeat?.copy?.(src.repeat); dst.offset?.copy?.(src.offset); dst.center?.copy?.(src.center); dst.rotation = src.rotation || 0; if('colorSpace' in dst && src.colorSpace) dst.colorSpace = src.colorSpace; dst.needsUpdate = true; dst.userData = { ...(src.userData || {}), awtsmoosWhiteMatteRemoved:true }; return dst; }
export function removeWhiteLeafTextureBackgroundOnce(THREE, texture, options = {}) {
  if (!THREE || !texture) return texture;
  if (CACHE.has(texture)) return CACHE.get(texture);
  const img = sourceImage(texture), doc = globalThis.document;
  if (!img || !doc?.createElement) { CACHE.set(texture, texture); return texture; }
  const w = img.naturalWidth || img.videoWidth || img.width, h = img.naturalHeight || img.videoHeight || img.height;
  if (!w || !h) { CACHE.set(texture, texture); return texture; }
  const canvas = doc.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  if (!ctx) { CACHE.set(texture, texture); return texture; }
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h), px = data.data, threshold = options.whiteThreshold ?? 238;
  for (let i=0;i<px.length;i+=4){ const r=px[i],g=px[i+1],b=px[i+2], max=Math.max(r,g,b), min=Math.min(r,g,b); if(max>=threshold && max-min<28) px[i+3]=Math.max(0, Math.min(px[i+3], (255-max)*10)); }
  ctx.putImageData(data, 0, 0);
  const next = copyState(THREE, texture, new THREE.CanvasTexture(canvas));
  CACHE.set(texture, next);
  return next;
}
export default removeWhiteLeafTextureBackgroundOnce;

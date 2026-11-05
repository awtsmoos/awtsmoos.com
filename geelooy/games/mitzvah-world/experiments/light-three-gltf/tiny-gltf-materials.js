// B"H
import { MeshStandardMaterial } from './tiny-runtime.js';

/** GLTF material vessels: no more brown default; linear colors receive display breath. */
const DEFAULT_COLOR = [1, 1, 1, 1];

export async function createTinyMaterials(doc, buffers, baseUrl) {
  const images = await loadImages(doc, buffers, baseUrl);
  const materials = (doc.materials || []).map((def, index) => materialFromDef(doc, def, index, images));
  return { materials, images, diagnostics: materialDiagnostics(doc, materials, images) };
}

function materialFromDef(doc, def = {}, index = 0, images = []) {
  const pbr = def.pbrMetallicRoughness || {}, factor = pbr.baseColorFactor || DEFAULT_COLOR;
  const tex = textureImage(doc, pbr.baseColorTexture, images);
  const color = tex ? factor : displayColor(factor);
  const mat = new MeshStandardMaterial({ name: def.name || `material_${index}`, color, opacity: factor[3] ?? 1, alphaMode: def.alphaMode || 'OPAQUE', alphaCutoff: def.alphaCutoff ?? 0.5, transparent: (def.alphaMode || 'OPAQUE') === 'BLEND' || (factor[3] ?? 1) < 1, doubleSided: def.doubleSided === true });
  Object.assign(mat, { metallicFactor: pbr.metallicFactor ?? 1, roughnessFactor: pbr.roughnessFactor ?? 1, baseColorFactor: factor, sourceColorSpace: tex ? 'texture+sRGB-factor' : 'gltf-factor-linear-to-display', mapImage: tex?.image || null, textureUrl: tex?.url || null, mapRepeat: tex?.repeat || [1, 1], anisotropy: true });
  return mat;
}

export function defaultTinyMaterial() {
  const mat = new MeshStandardMaterial({ name: 'material_default', color: DEFAULT_COLOR, opacity: 1, alphaMode: 'OPAQUE' });
  Object.assign(mat, { sourceColorSpace: 'neutral-default', mapRepeat: [1, 1], anisotropy: true });
  return mat;
}

function textureImage(doc, info, images) {
  if (!info) return null; const tex = doc.textures?.[info.index]; if (!tex) return null;
  const image = images[tex.source]; if (!image) return null; const sampler = doc.samplers?.[tex.sampler] || {};
  return { image, url: image.dataset?.url || image.src || `image_${tex.source}`, repeat: sampler.wrapS === 33071 || sampler.wrapT === 33071 ? [1, 1] : [1, 1] };
}

async function loadImages(doc, buffers, baseUrl) {
  return await Promise.all((doc.images || []).map((image, index) => loadOneImage(doc, buffers, baseUrl, image, index)));
}

async function loadOneImage(doc, buffers, baseUrl, image, index) {
  if (image.uri) return await loadUriImage(new URL(image.uri, baseUrl).href, index);
  if (image.bufferView !== undefined) {
    const bv = doc.bufferViews[image.bufferView], buffer = buffers[bv.buffer];
    const bytes = buffer.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const blob = new Blob([bytes], { type: image.mimeType || 'image/png' });
    const url = URL.createObjectURL(blob);
    try { return await loadUriImage(url, index, `glb-bufferView:${image.bufferView}`); }
    finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
  }
  return null;
}

function loadUriImage(src, index, label = src) {
  return new Promise(resolve => { const img = new Image(); let done = false; const finish = value => { if (!done) { done = true; resolve(value); } }; img.crossOrigin = src.startsWith('blob:') ? null : 'anonymous'; img.onload = () => { img.dataset.url = label; img.dataset.index = String(index); finish(img); }; img.onerror = () => finish(null); img.src = src; });
}

function displayColor(color) { return [toSrgb(color[0] ?? 1), toSrgb(color[1] ?? 1), toSrgb(color[2] ?? 1), color[3] ?? 1]; }
function toSrgb(v) { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }

function materialDiagnostics(doc, materials, images) {
  return { count: materials.length, images: images.filter(Boolean).length, textures: (doc.textures || []).length, defaultColor: DEFAULT_COLOR, colorsConverted: true, entries: materials.map((m, i) => ({ i, name: m.name, color: m.color, raw: m.baseColorFactor, hasMap: !!m.mapImage, textureSize: m.mapImage ? `${m.mapImage.naturalWidth}x${m.mapImage.naturalHeight}` : null, sourceColorSpace: m.sourceColorSpace })).slice(0, 64) };
}

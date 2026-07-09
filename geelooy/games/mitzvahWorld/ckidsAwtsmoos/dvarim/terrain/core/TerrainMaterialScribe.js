// B"H
/** @module TerrainMaterialScribe @description Non-blocking hosted terrain texture mixer for any layer count. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=bright-worker-safe-terrain-20260708-bh1";
export const TERRAIN_TEXTURE_URLS = Object.freeze([
  "https://awtsmoos-docs-base.web.app/full-resolution/grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%203.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/grass1.png"
]);
const FALLBACK = [0x86c95b, 0x8b7a4a, 0x789d4d, 0x927048, 0x6c5037, 0x65b947];
const LAVA_FALLBACK = [0x2b1b18, 0x5d2318, 0x9a431f, 0xd97825, 0x1f1714, 0x703018];
function post(stage, data = {}) { globalThis.__AWTSMOOS_TERRAIN_TEXTURE_PROOF__ = { stage, at:Date.now(), ...data }; globalThis.postMessage?.({ type:"worker_progress", stage, cacheKind:"hosted-ground-textures", ...data }); }
function urlsFrom(data = {}) { if (data.textureType === "remoteFirebaseGrassDirtMix") return [...TERRAIN_TEXTURE_URLS]; const raw = data.textureUrls || data.groundTextures; const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? Object.values(raw) : []; const clean = list.map(v => String(v || "").trim()).filter(Boolean); return clean.length ? [...new Set(clean)] : [...TERRAIN_TEXTURE_URLS]; }
function paletteFor(data = {}) { const raw = String(data.textureType || data.biomeKey || ""); if (/lava|basalt|ash/i.test(raw)) return { key:"lavaBasin", colors:LAVA_FALLBACK }; return { key:"remoteFirebaseGrassDirtMix", colors:FALLBACK }; }
function tune(texture, repeat) { texture.wrapS = THREE.MirroredRepeatWrapping; texture.wrapT = THREE.MirroredRepeatWrapping; texture.repeat?.set?.(repeat, repeat); texture.flipY = true; texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.anisotropy = 16; if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true; return texture; }
function fallbackTexture(color, repeat) { const data = new Uint8Array([(color >> 16) & 255, (color >> 8) & 255, color & 255, 255]); return tune(new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat), repeat); }
function uniformBlock(textures, repeat) { const uniforms = { uRepeat:{ value:repeat }, uNoiseScale:{ value:.055 }, uBright:{ value:1.25 } }; textures.forEach((texture, i) => uniforms[`t${i}`] = { value:texture }); return uniforms; }
function samplers(count) { return Array.from({ length:count }, (_, i) => `uniform sampler2D t${i};`).join("\n"); }
function mixLines(count) { const lines = [`vec4 mixed = texture2D(t0, layerUv(uv, 0.0));`]; for (let i = 1; i < count; i++) lines.push(`mixed = mix(mixed, texture2D(t${i}, layerUv(uv, ${i}.0)), layerMask(wp, ${i}.0));`); return lines.join("\n      "); }
function shaderMaterial(textures, urls, repeat, palette) {
  const count = Math.max(1, textures.length);
  const mat = new THREE.ShaderMaterial({ side:THREE.DoubleSide, depthWrite:true, depthTest:true, uniforms:uniformBlock(textures, repeat), vertexShader:`varying vec2 vUv; varying vec3 vWorld; void main(){vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;}`, fragmentShader:`precision highp float; ${samplers(count)} uniform float uRepeat; uniform float uNoiseScale; uniform float uBright; varying vec2 vUv; varying vec3 vWorld; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);} float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);} vec2 layerUv(vec2 uv,float layer){return uv*uRepeat*(1.0+layer*.041)+vec2(hash(vec2(layer,4.2)),hash(vec2(7.7,layer)))*.31;} float layerMask(vec2 wp,float layer){float a=noise(wp*(uNoiseScale+layer*.012)+layer*11.7); float b=noise(wp*(uNoiseScale*3.1+layer*.023)-layer*5.4); return clamp(smoothstep(.32,.92,a+b*.30)*(.34+layer*.075),.06,.84);} void main(){vec2 wp=vWorld.xz; vec2 uv=vUv; ${mixLines(count)} float grit=(noise(wp*9.0)-.5)*.08; mixed.rgb=pow(max(mixed.rgb+grit,vec3(0.0)),vec3(.86))*uBright; mixed.rgb=mix(mixed.rgb,vec3(.55,.80,.34),.075); gl_FragColor=vec4(min(mixed.rgb,vec3(1.0)),1.0);}` });
  mat.userData = { terrainFullResolutionMix:true, hostedGroundTextures:true, textureUrls:urls, textureCount:count, paletteKey:palette.key, shaderMix:true, dynamicSequentialMix:true, nonBlockingTextures:true, repeat };
  return mat;
}
async function bitmap(url, repeat) { const signal = AbortSignal.timeout ? AbortSignal.timeout(4500) : undefined; const res = await fetch(url, { mode:"cors", cache:"force-cache", signal }); if (!res.ok) throw new Error(`${url} ${res.status}`); const blob = await res.blob(); if (typeof createImageBitmap !== "function") throw new Error("createImageBitmap unavailable in worker"); return tune(new THREE.Texture(await createImageBitmap(blob)), repeat); }
function upgradeAsync(mat, urls, repeat, report) { urls.forEach((url, i) => bitmap(url, repeat).then(texture => { if (!mat.uniforms?.[`t${i}`]) return; mat.uniforms[`t${i}`].value = texture; mat.needsUpdate = true; report.loaded++; report.lastLoaded = { i, url, at:Date.now() }; post("texture:terrain:hosted-mix:item-loaded", report); }).catch(error => { report.failed++; report.failures.push({ i, url, message:error?.message || String(error) }); post("texture:terrain:hosted-mix:item-fallback", report); })); }
export default class TerrainMaterialScribe {
  static async scribe(data = {}) {
    const repeat = Math.max(6, Number(data.textureRepeat || 18));
    const urls = urlsFrom(data), palette = paletteFor(data);
    const textures = urls.map((_, i) => fallbackTexture(palette.colors[i % palette.colors.length], repeat));
    const mat = shaderMaterial(textures, urls, repeat, palette);
    const report = { urls, count:urls.length, loaded:0, failed:0, failures:[], paletteKey:palette.key, nonBlocking:true };
    post("texture:terrain:hosted-mix:material-ready", report);
    upgradeAsync(mat, urls, repeat, report);
    return mat;
  }
}

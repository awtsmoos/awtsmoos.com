// B"H
/**
 * @file shaderTexture.js
 * @description
 * Chapter 70: The Awtsmoos paints textures with light, then seals the memory.
 * A procedural material should be born from shaders, rendered once into a small
 * render target, and then reused by humble Lambert meshes. No canvas. No DOM.
 * No per-frame texture math. A snapshot of Ohr, carried as a texture vessel.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const cache = new WeakMap();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const scene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
scene.add(quad);

function colorUniform(hex) {
  return new THREE.Color(Number(hex ?? 0xffffff));
}

function fallbackTexture(color = 0xffffff) {
  const data = new Uint8Array([(color >> 16) & 255, (color >> 8) & 255, color & 255, 255]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData.awtsmoosFallback = true;
  return texture;
}

function fragment(kind) {
  const common = `
    precision mediump float;
    varying vec2 vUv;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 colorC;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
  `;
  const body = {
    bark: `vec2 uv=vUv; float grain=noise(vec2(uv.x*18.,uv.y*5.)); float line=smoothstep(.72,1.,noise(vec2(uv.x*45.,uv.y*2.))); vec3 col=mix(colorA,colorB,grain*.45+line*.28); gl_FragColor=vec4(col,1.);`,
    noise: `vec2 uv=vUv; float n=noise(uv*16.)*.55+noise(uv*52.)*.18; vec3 col=mix(colorA,colorB,n); gl_FragColor=vec4(mix(col,colorC,smoothstep(.82,1.,noise(uv*90.))*.18),1.);`,
    leaf: `vec2 p=(vUv-.5)*2.; float r=dot(p*vec2(1.05,.78),p*vec2(1.05,.78)); float mask=smoothstep(1.,.72,r); float vein=smoothstep(.04,.0,abs(p.x))*.35; float n=noise(vUv*18.); vec3 col=mix(colorA,colorB,n*.55+vein); gl_FragColor=vec4(col,mask);`,
    ground: `vec2 uv=vUv; float grass=noise(uv*18.)*.45+noise(uv*70.)*.2; float path=1.-smoothstep(.035,.13,abs(uv.y-(.78-.55*uv.x+.05*sin(uv.x*8.)))); vec3 green=mix(colorA,colorB,grass); vec3 dirt=mix(vec3(.45,.28,.13),vec3(.74,.55,.31),noise(uv*40.)); float flower=smoothstep(.985,1.,noise(uv*160.)); vec3 col=mix(green,dirt,path*.82); col=mix(col,colorC,flower*.65); gl_FragColor=vec4(col,1.);`,
    cloud: `vec2 uv=vUv; float c=smoothstep(.42,.82,noise(vec2(uv.x*5.,uv.y*12.))+noise(uv*18.)*.35); c*=smoothstep(0.,.18,uv.y)*smoothstep(1.,.72,uv.y); gl_FragColor=vec4(colorA,c*.72);`
  }[kind] || `gl_FragColor=vec4(colorA,1.);`;
  return `${common}
    void main(){ ${body} }
  `;
}

function vertex() {
  return `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
}

function keyOf(op = {}) {
  return [op.kind, op.size, op.colorA, op.colorB, op.colorC].join(":");
}

/**
 * Bake a procedural shader into a texture snapshot.
 * @param {THREE.WebGLRenderer} renderer Active renderer.
 * @param {Object} op Shader texture options.
 * @returns {THREE.Texture} Baked texture, or tiny fallback if renderer is absent.
 */
export function bakeShaderTexture(renderer, op = {}) {
  if (!renderer?.setRenderTarget) return fallbackTexture(Number(op.colorA ?? 0xffffff));
  let map = cache.get(renderer);
  if (!map) { map = new Map(); cache.set(renderer, map); }
  const key = keyOf(op);
  if (map.has(key)) return map.get(key);
  const size = Math.max(8, Math.floor(Number(op.size || 128)));
  const target = new THREE.WebGLRenderTarget(size, size, { depthBuffer: false, stencilBuffer: false });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  target.texture.wrapS = target.texture.wrapT = THREE.RepeatWrapping;
  target.texture.userData.awtsmoosShaderSnapshot = true;
  const material = new THREE.ShaderMaterial({
    transparent: op.kind === "leaf" || op.kind === "cloud",
    vertexShader: vertex(),
    fragmentShader: fragment(op.kind),
    uniforms: {
      colorA: { value: colorUniform(op.colorA ?? 0xffffff) },
      colorB: { value: colorUniform(op.colorB ?? op.colorA ?? 0xffffff) },
      colorC: { value: colorUniform(op.colorC ?? op.colorB ?? op.colorA ?? 0xffffff) }
    }
  });
  const oldTarget = renderer.getRenderTarget?.() || null;
  quad.material = material;
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  renderer.setRenderTarget(oldTarget);
  material.dispose();
  map.set(key, target.texture);
  return target.texture;
}

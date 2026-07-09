// B"H
/** Terrain test materials: solid, one repeated grass, and dynamic sequential mix shader. */
export const TERRAIN_TEXTURES = Object.freeze([
  "https://awtsmoos-docs-base.web.app/full-resolution/grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%203.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/grass1.png"
]);
function prep(THREE, tex, repeat = 24) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat, repeat); tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; return tex; }
function pixel(THREE, color) { const t = new THREE.DataTexture(new Uint8Array([(color>>16)&255,(color>>8)&255,color&255,255]), 1, 1, THREE.RGBAFormat); return prep(THREE, t, 24); }
export function solidGreen(THREE) { return new THREE.MeshStandardMaterial({ color:0x168a22, roughness:0.9, metalness:0 }); }
export function repeatedGrass(THREE) { const mat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.9, metalness:0 }); mat.map = pixel(THREE, 0x2d9d32); new THREE.TextureLoader().load(TERRAIN_TEXTURES[0], tex => { mat.map = prep(THREE, tex, 30); mat.needsUpdate = true; }); return mat; }
function uniforms(THREE) { const u = { scale:{ value:0.08 }, bright:{ value:1.18 } }; TERRAIN_TEXTURES.forEach((_, i) => u[`t${i}`] = { value:pixel(THREE, [0x52a83f,0x80613e,0x749f45,0x927349,0x6d4d33,0x45a334][i]) }); return u; }
export function fancyMix(THREE) {
  const n = TERRAIN_TEXTURES.length, samplers = TERRAIN_TEXTURES.map((_, i) => `uniform sampler2D t${i};`).join("\n");
  const mix = Array.from({ length:n }, (_, i) => i ? `c=mix(c,texture2D(t${i},uvFor(vUv,${i}.0)).rgb,mask(wp,${i}.0));` : `vec3 c=texture2D(t0,uvFor(vUv,0.0)).rgb;`).join("\n");
  const mat = new THREE.ShaderMaterial({ side:THREE.DoubleSide, uniforms:uniforms(THREE), vertexShader:`varying vec2 vUv;varying vec3 vWp;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vWp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`, fragmentShader:`precision highp float;varying vec2 vUv;varying vec3 vWp;uniform float scale;uniform float bright;${samplers}float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}vec2 uvFor(vec2 uv,float l){return uv*(22.0+l*.9)+vec2(h(vec2(l,4.0)),h(vec2(7.0,l)))*.4;}float mask(vec2 p,float l){float a=noise(p*(scale+l*.017)+l*13.0);float b=noise(p*(scale*3.0+l*.031)-l*5.0);return clamp(smoothstep(.35,.9,a+b*.3)*(.35+l*.07),.06,.82);}void main(){vec2 wp=vWp.xz;${mix}float g=(noise(wp*8.0)-.5)*.07;gl_FragColor=vec4(min(pow(max(c+g,vec3(0.0)),vec3(.86))*bright,vec3(1.0)),1.0);}` });
  TERRAIN_TEXTURES.forEach((url, i) => new THREE.TextureLoader().load(url, tex => { mat.uniforms[`t${i}`].value = prep(THREE, tex, 24); mat.needsUpdate = true; }));
  return mat;
}

// B"H
/**
 * @file ProceduralSky.js
 * @description
 * Chapter 241: The village sky receives a quiet sun and soft drifting clouds.
 * This is not cinematic excess: a gradient dome, warm light, gentle fog, one
 * data-texture sun glow, and a few data-texture cloud sprites. No lava changes.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

function radialTexture(size, color, softness = 1) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const dx = (x / (size - 1)) * 2 - 1, dy = (y / (size - 1)) * 2 - 1;
    const a = Math.max(0, 1 - Math.hypot(dx, dy));
    const i = (y * size + x) * 4, alpha = Math.pow(a, softness) * 255;
    data[i] = color.r; data[i + 1] = color.g; data[i + 2] = color.b; data[i + 3] = alpha;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true; return tex;
}
function cloudTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const u = x / size, v = y / size;
    const blobs = [[0.34, 0.52, 0.28], [0.5, 0.46, 0.34], [0.66, 0.54, 0.25], [0.46, 0.62, 0.22]];
    const a = blobs.reduce((m, b) => Math.max(m, 1 - Math.hypot((u - b[0]) / b[2], (v - b[1]) / (b[2] * 0.55))), 0);
    const i = (y * size + x) * 4, alpha = Math.pow(Math.max(0, a), 1.8) * 150;
    data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = alpha;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true; return tex;
}

export default class ProceduralSky extends Tzomayach {
  type = "ProceduralSky";
  constructor(op = {}, olam) {
    super(op, olam);
    this.sunIntensity = Number(op.sunIntensity ?? 1.42); this.hemiIntensity = Number(op.hemiIntensity ?? 1.05);
    this.ambientIntensity = Number(op.ambientIntensity ?? 0.5); this.fogNear = Number(op.fogNear ?? 120); this.fogFar = Number(op.fogFar ?? 360);
  }
  async heescheel(olam) {
    this.olam = olam;
    const top = new THREE.Color(this.options?.topColor ?? 0x88c9ff), bottom = new THREE.Color(this.options?.bottomColor ?? 0xf4e4bd);
    this.skyMat = new THREE.ShaderMaterial({ uniforms: { topColor: { value: top }, bottomColor: { value: bottom }, offset: { value: 28 }, exponent: { value: 0.72 } }, vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 p=modelMatrix*vec4(position,1.0); vWorldPosition=p.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0); }`, side: THREE.BackSide, depthWrite: false });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1300, 24, 10), this.skyMat);
    this.mesh.name = this.name || "Soft_Inviting_Village_Sky";
    this.sunLight = new THREE.DirectionalLight(0xfff0c8, this.sunIntensity); this.sunLight.position.set(180, 360, 140);
    this.hemiLight = new THREE.HemisphereLight(0xf4fbff, 0x6e5c34, this.hemiIntensity); this.ambientLight = new THREE.AmbientLight(0xfff4dc, this.ambientIntensity);
    this.mesh.add(this.sunLight, this.hemiLight, this.ambientLight); this.addSunGlow(); this.addClouds();
    if (olam.scene) olam.scene.fog = new THREE.Fog(0xe8f4ff, this.fogNear, this.fogFar);
    await olam.hoyseef(this); this.isReady = true;
  }
  addSunGlow() {
    const mat = new THREE.SpriteMaterial({ map: radialTexture(64, { r: 255, g: 242, b: 190 }, 1.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sun = new THREE.Sprite(mat); sun.name = "soft_country_sun_glow"; sun.position.set(220, 380, -360); sun.scale.set(130, 130, 1); this.mesh.add(sun);
  }
  addClouds() {
    const mat = new THREE.SpriteMaterial({ map: cloudTexture(), transparent: true, depthWrite: false, opacity: 0.72 });
    [[-360, 210, -520, 170], [-120, 260, -560, 135], [220, 235, -540, 155], [420, 190, -480, 115], [40, 310, -610, 125]].forEach((c, i) => { const s = new THREE.Sprite(mat.clone()); s.name = `soft_data_cloud_${i}`; s.position.set(c[0], c[1], c[2]); s.scale.set(c[3], c[3] * 0.38, 1); this.mesh.add(s); });
  }
  heesHawvoos() { this.sunLight.intensity = this.sunIntensity; this.hemiLight.intensity = this.hemiIntensity; this.ambientLight.intensity = this.ambientIntensity; }
}

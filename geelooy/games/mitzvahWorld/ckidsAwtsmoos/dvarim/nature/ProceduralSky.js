// B"H
/**
 * @file ProceduralSky.js
 * @description
 * Chapter 244: The ugly haze is rinsed back into honest blue.
 *
 * The reference asks for invitation, not fireworks: soft blue dome, pale horizon,
 * warm sun light, gentle fog, and only a few quiet RGBA cloud sprites. No lens
 * flare excess, no lava brightness changes.
 */
import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function rgbaCloudTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const u = x / size, v = y / size;
    const blobs = [[0.3, 0.54, 0.22], [0.46, 0.48, 0.3], [0.64, 0.55, 0.2], [0.52, 0.63, 0.18]];
    const a = blobs.reduce((m, b) => Math.max(m, 1 - Math.hypot((u - b[0]) / b[2], (v - b[1]) / (b[2] * 0.55))), 0);
    const i = (y * size + x) * 4, alpha = Math.pow(Math.max(0, a), 2.2) * 115;
    data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = alpha;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export default class ProceduralSky extends Tzomayach {
  type = "ProceduralSky";

  constructor(op = {}, olam) {
    super(op, olam);
    this.sunIntensity = Number(op.sunIntensity ?? 1.25);
    this.hemiIntensity = Number(op.hemiIntensity ?? 1.15);
    this.ambientIntensity = Number(op.ambientIntensity ?? 0.55);
    this.fogNear = Number(op.fogNear ?? 130);
    this.fogFar = Number(op.fogFar ?? 390);
  }

  async heescheel(olam) {
    this.olam = olam;
    const top = new THREE.Color(this.options?.topColor ?? 0x80c8ff);
    const bottom = new THREE.Color(this.options?.bottomColor ?? 0xdff3ff);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { topColor: { value: top }, bottomColor: { value: bottom }, offset: { value: 12 }, exponent: { value: 0.86 } },
      vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 p=modelMatrix*vec4(position,1.0); vWorldPosition=p.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; vec3 c=mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)); gl_FragColor=vec4(c,1.0); }`,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1300, 24, 10), this.skyMat);
    this.mesh.name = this.name || "Clear_Blue_Village_Sky";
    this.sunLight = new THREE.DirectionalLight(0xfff1ca, this.sunIntensity);
    this.sunLight.position.set(180, 360, 140);
    this.hemiLight = new THREE.HemisphereLight(0xf2fbff, 0x756a42, this.hemiIntensity);
    this.ambientLight = new THREE.AmbientLight(0xfff7e6, this.ambientIntensity);
    this.mesh.add(this.sunLight, this.hemiLight, this.ambientLight);
    this.addClouds();
    if (olam.scene) olam.scene.fog = new THREE.Fog(0xdff3ff, this.fogNear, this.fogFar);
    await olam.hoyseef(this);
    this.isReady = true;
  }

  addClouds() {
    const material = new THREE.SpriteMaterial({ map: rgbaCloudTexture(), transparent: true, depthWrite: false, opacity: 0.55 });
    [[-360, 230, -560, 150], [-90, 275, -620, 118], [260, 245, -570, 136], [430, 205, -520, 100]].forEach((c, i) => {
      const sprite = new THREE.Sprite(material.clone());
      sprite.name = `quiet_rgba_cloud_${i}`;
      sprite.position.set(c[0], c[1], c[2]);
      sprite.scale.set(c[3], c[3] * 0.36, 1);
      this.mesh.add(sprite);
    });
  }

  heesHawvoos() {
    this.sunLight.intensity = this.sunIntensity;
    this.hemiLight.intensity = this.hemiIntensity;
    this.ambientLight.intensity = this.ambientIntensity;
  }
}

// B"H
/**
 * @file ProceduralSky.js
 * @description
 * Chapter 12: daylight returns to the village. The Awtsmoos gives the scene a
 * clear ambient river, a warm sun, and enough hemisphere light that props,
 * lamps, house, and guide are readable on a phone screen.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralSky extends Tzomayach {
  type = "ProceduralSky";

  constructor(op = {}, olam) {
    super(op, olam);
    this.timeMultiplier = op.timeMultiplier ?? 0;
    this.timeOfDay = op.timeOfDay ?? 14.5;
    this.sunIntensity = Number(op.sunIntensity ?? 1.75);
    this.hemiIntensity = Number(op.hemiIntensity ?? 1.12);
    this.ambientIntensity = Number(op.ambientIntensity ?? 0.72);
  }

  async heescheel(olam) {
    this.olam = olam;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x9bdcff) },
        bottomColor: { value: new THREE.Color(0xf0b35a) },
        offset: { value: 33 },
        exponent: { value: 0.86 }
      },
      vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 p=modelMatrix*vec4(position,1.0); vWorldPosition=p.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0); }`,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 16, 8), this.skyMat);
    this.mesh.name = this.name || "Bright_Village_Sky";
    this.sunLight = new THREE.DirectionalLight(0xffefc2, this.sunIntensity);
    this.sunLight.position.set(220, 430, 180);
    this.hemiLight = new THREE.HemisphereLight(0xf2fbff, 0x806038, this.hemiIntensity);
    this.ambientLight = new THREE.AmbientLight(0xfff0d0, this.ambientIntensity);
    this.mesh.add(this.sunLight, this.hemiLight, this.ambientLight);
    await olam.hoyseef(this);
    this.isReady = true;
  }

  heesHawvoos() {
    this.sunLight.intensity = this.sunIntensity;
    this.hemiLight.intensity = this.hemiIntensity;
    this.ambientLight.intensity = this.ambientIntensity;
  }
}

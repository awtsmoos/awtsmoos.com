// B"H
/**
 * @file ProceduralSky.js
 * @description Chapter 10: A darker, readable desert sky with no light flood.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralSky extends Tzomayach {
  type = "ProceduralSky";

  constructor(op = {}, olam) {
    super(op, olam);
    this.timeMultiplier = op.timeMultiplier ?? 0.0;
    this.timeOfDay = op.timeOfDay ?? 10.0;
    this.dayOfWeek = op.dayOfWeek ?? 0;
    this.isShabbos = false;
  }

  /** Builds a cheap sky dome and one restrained sun. */
  async heescheel(olam) {
    this.olam = olam;
    const skyGeo = new THREE.SphereGeometry(1000, 16, 8);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x3d91c2) },
        bottomColor: { value: new THREE.Color(0xd8bc82) },
        offset: { value: 33 },
        exponent: { value: 0.95 }
      },
      vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 p=modelMatrix*vec4(position,1.0); vWorldPosition=p.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0); }`,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(skyGeo, this.skyMat);
    this.mesh.name = this.name || "Calm_Desert_Sky";

    this.sunLight = new THREE.DirectionalLight(0xffdf9c, 0.28);
    this.sunLight.position.set(280, 520, 120);
    this.sunLight.castShadow = false;
    this.mesh.add(this.sunLight);

    this.hemiLight = new THREE.HemisphereLight(0xbbeaff, 0x5c4328, 0.12);
    this.mesh.add(this.hemiLight);

    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** Keeps the level stable; no rapid day/night shift during testing. */
  heesHawvoos() {
    this.skyMat.uniforms.topColor.value.setHex(0x3d91c2);
    this.skyMat.uniforms.bottomColor.value.setHex(0xd8bc82);
    this.sunLight.intensity = 0.28;
    this.hemiLight.intensity = 0.12;
  }
}

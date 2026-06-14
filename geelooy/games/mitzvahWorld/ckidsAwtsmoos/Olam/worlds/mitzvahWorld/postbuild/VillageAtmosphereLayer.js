// B"H
/**
 * @file VillageAtmosphereLayer.js
 * @description
 * Chapter 1007: distance itself becomes part of the story.
 * The Awtsmoos paints fog, warm sun, and sky so the village is held in air.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const KEY="__awtsmoosVillageAtmosphereLayer";
function applyRenderer(renderer){ if(!renderer) return; renderer.shadowMap.enabled=true; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08; }
function addSun(scene){ const hemi=new THREE.HemisphereLight(0xfff4d7,0x456048,.72); hemi.name="village_warm_hemi_light"; scene.add(hemi); const sun=new THREE.DirectionalLight(0xffd49a,1.35); sun.name="village_low_golden_sun"; sun.position.set(-80,120,62); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun); return {hemi,sun}; }
function addSky(scene){ const geo=new THREE.SphereGeometry(460,32,16); const mat=new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false, uniforms:{top:{value:new THREE.Color(0x6fb4ff)},bottom:{value:new THREE.Color(0xffe1b0)}}, vertexShader:"varying vec3 v; void main(){v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}", fragmentShader:"varying vec3 v; uniform vec3 top; uniform vec3 bottom; void main(){float h=normalize(v).y*.5+.5; gl_FragColor=vec4(mix(bottom,top,smoothstep(.05,1.,h)),1.);} " }); const mesh=new THREE.Mesh(geo,mat); mesh.name="village_gradient_sky_dome"; scene.add(mesh); return mesh; }
export async function ensureVillageAtmosphereLayer(context={}){ const olam=context.olam||context, scene=context.scene||olam.scene; if(!scene||!olam||olam[KEY]) return olam?.[KEY]||null; scene.fog=new THREE.FogExp2(0xd9e9ff,.0045); scene.background=new THREE.Color(0xb8dbff); applyRenderer(olam.renderer||context.renderer); const root=new THREE.Group(); root.name="village_atmosphere_root"; const lights=addSun(root); const sky=addSky(root); root.userData.stats={fog:true,sky:!!sky,sun:!!lights.sun}; scene.add(root); olam[KEY]=root; return root; }

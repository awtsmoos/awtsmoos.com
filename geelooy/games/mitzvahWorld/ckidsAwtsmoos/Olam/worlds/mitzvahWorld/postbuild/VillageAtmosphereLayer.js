// B"H
/**
 * @file VillageAtmosphereLayer.js
 * @description Fog, sun, sky, renderer tone, and mobile-safe atmosphere with parser-clear flow.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const KEY = "__awtsmoosVillageAtmosphereLayer";
function budget() { return globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget || {}; }
function shadowsAllowed() { return budget().shadowMode !== "off"; }
function applyRenderer(renderer) { if (!renderer) return; if (renderer.shadowMap) renderer.shadowMap.enabled = shadowsAllowed(); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; }
function addSun(root) { const hemi = new THREE.HemisphereLight(0xfff4d7, 0x456048, .72); hemi.name = "village_warm_hemi_light"; root.add(hemi); const sun = new THREE.DirectionalLight(0xffd49a, 1.35); sun.name = "village_low_golden_sun"; sun.position.set(-80, 120, 62); sun.castShadow = shadowsAllowed(); if (sun.shadow && sun.shadow.mapSize) sun.shadow.mapSize.set(256, 256); root.add(sun); return { hemi, sun }; }
function addSky(root) { const geo = new THREE.SphereGeometry(460, 32, 16); const mat = new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false, uniforms:{ top:{ value:new THREE.Color(0x6fb4ff) }, bottom:{ value:new THREE.Color(0xffe1b0) } }, vertexShader:"varying vec3 v; void main(){ v = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader:"varying vec3 v; uniform vec3 top; uniform vec3 bottom; void main(){ float h = normalize(v).y * 0.5 + 0.5; gl_FragColor = vec4(mix(bottom, top, smoothstep(0.05, 1.0, h)), 1.0); }" }); const mesh = new THREE.Mesh(geo, mat); mesh.name = "village_gradient_sky_dome"; root.add(mesh); return mesh; }
function sceneOf(context, olam) { return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
export async function ensureVillageAtmosphereLayer(context = {}) { const olam = context.olam || context, scene = sceneOf(context, olam); if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY]; scene.fog = new THREE.FogExp2(0xd9e9ff, .0045); scene.background = new THREE.Color(0xb8dbff); applyRenderer(olam.renderer || context.renderer); const root = new THREE.Group(); root.name = "village_atmosphere_root"; const lights = addSun(root), sky = addSky(root); root.userData.stats = { fog:true, sky:Boolean(sky), sun:Boolean(lights.sun), toneMapped:true, shadows:shadowsAllowed() }; scene.add(root); olam[KEY] = root; return root; }

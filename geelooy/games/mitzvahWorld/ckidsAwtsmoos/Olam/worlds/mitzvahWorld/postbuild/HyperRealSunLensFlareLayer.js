// B"H
/**
 * @file HyperRealSunLensFlareLayer.js
 * @description The noon sun becomes a crown of glare: white core, blue aura,
 * diagonal phone-camera streak, spectral ghosts, haze, and camera-facing breath.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const KEY = "__awtsmoosHyperRealSunLensFlareLayer";
const DATA_KEY = "hyperRealSunLensFlare";
const REF = "midday_phone_sun_white_streak_blue_sky_green_ghost";

function sceneOf(context, olam) { return context?.scene || olam?.scene || null; }
function set3(v, p) { v.set(p[0], p[1], p[2]); return v; }
function material(color, opacity) {
  return new THREE.MeshBasicMaterial({ color, transparent:true, opacity, depthWrite:false, depthTest:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide });
}
function faceCamera(mesh) {
  mesh.onBeforeRender = (_r, _s, camera) => { if (camera?.position && mesh.lookAt) mesh.lookAt(camera.position); };
  return mesh;
}
function plane(name, color, opacity, size, pos, rot = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material(color, opacity));
  m.name = name; set3(m.position, pos); m.rotation.z = rot; m.renderOrder = 9997; m.userData.visualRole = "hyper_real_lens_plane"; return faceCamera(m);
}
function orb(name, color, opacity, radius, pos) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), material(color, opacity));
  m.name = name; set3(m.position, pos); m.renderOrder = 9998; m.userData.visualRole = "hyper_real_lens_orb"; return faceCamera(m);
}
function rays(root, pos) {
  const rays = [[118,1.25,-.41,.33],[92,.9,1.16,.16],[64,.7,.16,.13],[38,.48,-1.92,.09]];
  for (let i = 0; i < rays.length; i++) root.add(plane(`hyper_real_starburst_ray_${i}`, 0xffffff, rays[i][3], [rays[i][0], rays[i][1]], pos, rays[i][2]));
}
function sun(root) {
  const p = [-78, 126, -72];
  root.add(orb("hyper_real_white_hot_solar_core", 0xffffff, .98, 5.8, p));
  root.add(orb("hyper_real_overexposed_blue_white_aura", 0xa8dcff, .28, 15.5, [-78,126,-72.2]));
  root.add(orb("hyper_real_large_faint_air_halo", 0xeaf8ff, .11, 31, [-78,126,-72.5]));
  rays(root, [-78,126,-72.8]);
}
function streak(root) {
  const a = -0.41, p = [-78, 126, -73.1];
  root.add(plane("hyper_real_reference_photo_diagonal_white_streak", 0xffffff, .62, [218, 3.6], p, a));
  root.add(plane("hyper_real_reference_photo_blue_fringe", 0x8fd0ff, .25, [202, 7.6], [-78,126,-73.3], a));
  root.add(plane("hyper_real_reference_photo_warm_core", 0xffdfaa, .18, [148, 1.9], [-78,126,-73.5], a));
}
function ghosts(root) {
  root.add(orb("hyper_real_green_sensor_dot_below_sun", 0x43ffe4, .45, 1.25, [-52,74,-66]));
  root.add(orb("hyper_real_tiny_cyan_micro_ghost", 0x98ffff, .28, .52, [-38,87,-67]));
  root.add(orb("hyper_real_magenta_vertical_internal_reflection", 0xffb6ff, .13, 5.7, [-94,147,-76]));
  root.add(orb("hyper_real_low_glass_smear", 0xb9ffd9, .13, 10.5, [-31,51,-68]));
  root.add(orb("hyper_real_faint_gold_counter_ghost", 0xffe1a6, .10, 3.4, [-12,63,-69]));
}
function tune(scene, olam, root) {
  scene.userData[DATA_KEY] = { version:"20260616-bh2", reference:REF, objects:root.children.length, billboarded:true, bloomSimulatedByAdditiveGeometry:true };
  if (scene.fog && typeof scene.fog.density === "number") scene.fog.density = Math.min(scene.fog.density, .0036);
  const renderer = olam?.renderer || null;
  if (renderer && "toneMappingExposure" in renderer) renderer.toneMappingExposure = Math.max(renderer.toneMappingExposure || 1, 1.24);
}
export async function ensureHyperRealSunLensFlareLayer(context = {}) {
  const olam = context.olam || context, scene = sceneOf(context, olam);
  if (!scene || !olam) return null;
  if (olam[KEY]) return olam[KEY];
  const root = new THREE.Group(); root.name = "hyper_real_sun_lens_flare_root";
  root.userData.stats = { sunDisc:3, streaks:3, starburstRays:4, ghosts:5, haze:1, referencePhotos:2, cameraFacing:true };
  sun(root); streak(root); ghosts(root);
  root.add(plane("hyper_real_sky_airglow_haze_sheet", 0xd8f3ff, .11, [94, 48], [-72,119,-74], -0.1));
  scene.add(root); tune(scene, olam, root); olam[KEY] = root; return root;
}

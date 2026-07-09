// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";
import { meadowMaterial } from "./RamTextures.js?v=ram-meadow-bh3-grass-diffuse";
import { RamOctree } from "./RamOctree.js?v=ram-meadow-bh6-camera-octree";
import { createControls } from "./RamControls.js?v=ram-meadow-bh9-real-chossid-motion";

const app = document.getElementById("app"), hud = document.getElementById("hud"), loader = document.getElementById("loader");
const say = text => { if (hud) hud.textContent = `B"H RAM Meadow\n${text}`; window.__RAM_BOOT_LOG__?.(text); };
const hideLoader = reason => { loader?.remove?.(); say(reason); };
window.__RAM_ERRORS__ = [];
addEventListener("error", e => window.__RAM_ERRORS__.push(String(e.message || e.error || e)));
addEventListener("unhandledrejection", e => window.__RAM_ERRORS__.push(String(e.reason?.message || e.reason || e)));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ed7ff);
scene.fog = new THREE.Fog(0x9ed7ff, 92, 230);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 500);
const renderer = new THREE.WebGLRenderer({ antialias:false, powerPreference:"low-power" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.15));
renderer.setSize(innerWidth, innerHeight);
app.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd8efff, 0x43833a, 1.55));
const sun = new THREE.DirectionalLight(0xfff1c0, 1.15);
sun.position.set(-25, 38, 18);
scene.add(sun);
const octree = new RamOctree(THREE), controls = createControls();
const terrain = new THREE.Mesh(new THREE.PlaneGeometry(180, 150, 1, 1), meadowMaterial(THREE, text => { if (window.__RAM_MEADOW__) say(text); }));
terrain.rotation.x = -Math.PI / 2;
terrain.name = "visible_grass_diffuse_ram_meadow_terrain";
scene.add(terrain);
const player = new THREE.Group();
player.position.set(-8, .15, 18);
player.rotation.y = Math.PI;
scene.add(player);
let visual = new THREE.Mesh(new THREE.CapsuleGeometry(.35, 1.45, 4, 8), new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.8 }));
visual.position.y = .95;
player.add(visual);
let mixer = null, idle = null, walk = null, jumpAction = null, active = null, jumpUntil = 0;
function chooseClip(clips, words) { return clips.find(c => words.some(w => c.name.toLowerCase().includes(w))); }
function play(action, once = false) {
  if (!action || active === action) return;
  active?.fadeOut?.(.09);
  action.reset().fadeIn(.09).play();
  if (once) action.setLoop(THREE.LoopOnce, 1), action.clampWhenFinished = true;
  else action.setLoop(THREE.LoopRepeat, Infinity), action.clampWhenFinished = false;
  active = action;
}
function loadPlayerInBackground() {
  let finished = false;
  const failTimer = setTimeout(() => { if (!finished) say("Playable. Chossid still loading; capsule fallback active."); }, 2400);
  new GLTFLoader().load("https://models-3122d.web.app/chossid.glb?k=2", gltf => {
    finished = true; clearTimeout(failTimer);
    player.remove(visual); visual = gltf.scene; visual.scale.setScalar(1); visual.position.y = 0; player.add(visual);
    mixer = new THREE.AnimationMixer(visual);
    idle = mixer.clipAction(chooseClip(gltf.animations, ["idle", "stand"]) || gltf.animations[0]);
    walk = mixer.clipAction(chooseClip(gltf.animations, ["walk", "run"]) || gltf.animations[1] || gltf.animations[0]);
    jumpAction = mixer.clipAction(chooseClip(gltf.animations, ["jump", "fall", "air"]) || null);
    active = idle; active?.play(); say("Playable. Real Chossid keys: W/S move, A/D turn, Q/E strafe.");
  }, undefined, error => { finished = true; clearTimeout(failTimer); window.__RAM_ERRORS__.push(String(error?.message || error)); say("Playable. Remote GLB failed; capsule fallback active."); });
}
function box(name, x, y, z, w, h, d, color) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness:.85 })); m.position.set(x, y, z); m.name = name; scene.add(m); return octree.addVisibleMesh(m); }
box("real_left_split_rail_fence", -31, 1.05, 0, 1, 2.1, 24, 0x6e4a2d); box("real_right_split_rail_fence", 31, 1.05, -5, 1, 2.1, 28, 0x6e4a2d);
box("real_back_meadow_fence", 0, 1, -36, 54, 2, 1, 0x6e4a2d); box("real_stone_obstacle_one", 12, .7, 11, 4.8, 1.4, 3.6, 0x747a79);
box("real_stone_obstacle_two", -18, .85, -18, 5.6, 1.7, 4.2, 0x767a66); box("real_low_log_barrier", 8, .55, -17, 14, 1.1, 1.4, 0x64502e);
box("real_small_crate_cluster_a", 24, .65, 22, 2.8, 1.3, 2.8, 0x7e5535); box("real_small_crate_cluster_b", 27.2, .55, 20.8, 2.2, 1.1, 2.2, 0x7e5535);
let vy = 0, grounded = false, last = performance.now();
const targetHeight = 1.25, offsetFromWall = 1.2, zoomDampening = 5.0;
function lerp(a, b, t) { return a + t * (b - a); }
function cameraRotation() { return new THREE.Quaternion().setFromEuler(new THREE.Euler(controls.phiDeg * THREE.MathUtils.DEG2RAD, controls.thetaDeg * THREE.MathUtils.DEG2RAD, 0, "YXZ")); }
function cameraAnchor() { return player.position.clone().add(new THREE.Vector3(0, targetHeight, 0)); }
function updateCamera() {
  const anchor = cameraAnchor(), rotation = cameraRotation();
  const desired = anchor.clone().sub(new THREE.Vector3(0, 0, controls.desiredDistance).applyQuaternion(rotation));
  const hit = octree.raycastSegment(anchor, desired, 0.32);
  let corrected = controls.desiredDistance;
  if (hit) corrected = Math.max(controls.minDistance, hit.distance - offsetFromWall);
  const smooth = (!hit || corrected > controls.currentDistance) ? lerp(controls.currentDistance, corrected, 0.032 * zoomDampening) : corrected;
  controls.currentDistance = Math.max(controls.minDistance, Math.min(controls.maxDistance, smooth));
  const finalPos = anchor.clone().sub(new THREE.Vector3(0, 0, controls.currentDistance).applyQuaternion(rotation));
  camera.position.copy(octree.resolveCamera(anchor, finalPos, 0.48));
  camera.lookAt(anchor);
}
function movementVector(m, dt) {
  const speed = (m.running ? 12 : 8) * dt;
  const turn = 4.2 * dt;
  if (m.turningLeft) player.rotation.y += turn;
  if (m.turningRight) player.rotation.y -= turn;
  const f = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  const r = new THREE.Vector3(f.z, 0, -f.x);
  const move = new THREE.Vector3();
  if (m.forward) move.addScaledVector(f, -1);
  if (m.backward) move.addScaledVector(f, 1);
  if (m.stridingLeft) move.addScaledVector(r, -1);
  if (m.stridingRight) move.addScaledVector(r, 1);
  return move.lengthSq() > 0 ? move.normalize().multiplyScalar(speed) : move;
}
function tick(t) {
  const dt = Math.min(.033, (t - last) / 1000); last = t;
  const m = controls.motion();
  const move = movementVector(m, dt), moving = move.lengthSq() > .0001 || m.turningLeft || m.turningRight;
  let next = player.position.clone().add(move);
  vy -= 18 * dt;
  if (grounded && m.jump) { vy = 7.2; grounded = false; jumpUntil = t + 650; if (jumpAction) play(jumpAction, true); }
  next.y += vy * dt;
  const ground = octree.rayGround(next.x, next.z, 0);
  if (next.y < ground + .15) { next.y = ground + .15; vy = 0; grounded = true; }
  player.position.copy(octree.resolveSphere(next, .42));
  if (t > jumpUntil) play(moving ? walk : idle);
  mixer?.update(dt);
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
window.__RAM_MEADOW__ = { ok:true, scene, octree, player, terrain, obstacles:octree.items.length, controls, camera, seal:"ram-meadow-bh9-real-chossid-motion" };
hideLoader("Playable. Existing Chossid movement model: W/S move, A/D turn, Q/E strafe.");
requestAnimationFrame(tick);
setTimeout(loadPlayerInBackground, 50);

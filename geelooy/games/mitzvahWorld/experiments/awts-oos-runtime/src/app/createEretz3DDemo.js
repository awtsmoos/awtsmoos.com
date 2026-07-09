// B"H
import { Scene, PerspectiveCamera } from '../../../light-three-gltf/tiny-runtime.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsOctree } from '../collision/AwtsOctree.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { JumpButton } from '../input/JumpButton.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { AwtsCollisionMover } from '../collision/AwtsCollisionMover.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';
import { WorldGround } from '../world/WorldGround.js';
import { createTerrainPackage, REAL_GRASS_URL } from '../world/Terrain3D.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';

const GLB = 'https://models-3122d.web.app/chossid.glb', SIDE_SIGN = -1, FACE_HEIGHT = 1.78, MAX_STEP = .86, STEP_DOWN = .62;

/** Real 3D AWTS OOS: stairs, high jump, slope slide, and boolean doorway. */
export async function createEretz3DDemo({ canvas, joystickHost, jumpHost, hud }) {
  const scene = new Scene(), camera = new PerspectiveCamera(45, innerWidth / innerHeight, .1, 800), renderer = new TinyWebGLRenderer({ canvas });
  const input = new UiEventSystem(canvas).install({ emit() {} }), joystick = new MobileJoystick(joystickHost), jumpButton = new JumpButton(jumpHost);
  const orbit = new CameraOrbitController(canvas, { distance: 10.8, pitch: .23, yaw: Math.PI, min: 2.4, max: 54 });
  const [grassImage, gltf] = await Promise.all([loadImage(REAL_GRASS_URL, 2400), loadTinyGltf(GLB)]);
  const terrain = createTerrainPackage(createObstacleField(), grassImage), octree = buildTriangleOctree(terrain.colliders), ground = new WorldGround({ terrainHeightAt: terrain.heightAt, octree });
  scene.add(createSky3D()); scene.add(terrain.group);
  const model = gltf.scene; model.scale.set(1.52, 1.52, 1.52); model.position.set(0, 0, 4); model.setBaseTransform(); scene.add(model);
  const feet = alignModelFeetToGround(model, 0), footOffset = model.position.y, player = new TinyAnimationPlayer(model, gltf.animations), clips = clipMap(player.names);
  const state = { x:0, y:ground.heightAt(0,4)+footOffset, z:4, facing:Math.PI, moving:false, clip:'', feet, contacts:[], normals:[], velY:0, grounded:true, airPhase:'ground', jumpClock:0, faceHeight:FACE_HEIGHT, stepState:'flat', slopeState:'walk' };
  const mover = new AwtsCollisionMover({ octree, radius:.38, height:1.72, footOffset }), jumpPhysics = new JumpPhysics({ ground, footOffset });
  resize(); addEventListener('resize', resize); requestAnimationFrame(frame);

  function resize() { renderer.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio); camera.aspect = innerWidth / innerHeight; }
  function frame(now) { const dt = Math.min(.05, ((now - (frame.last || now)) / 1000) || 0); frame.last = now; update(dt); renderer.render(scene, camera); expose(); requestAnimationFrame(frame); }
  function update(dt) { move(dt); const physics = jumpPhysics.update(state, dt, jumpButton.consume()); if (physics.slide) mover.move(state, physics.slide, wallOptions(.1)); animate(dt); placeModel(model, state); orbit.apply(camera, faceTarget(state), octree); }

  function move(dt) {
    const delta = movementDelta(dt); state.moving = !!delta; if (!delta) return;
    const target = ground.sample(state.x + delta.x, state.z + delta.z), targetY = target.height + footOffset, diff = targetY - state.y;
    state.stepState = 'flat'; if (state.grounded && diff > .02 && diff <= MAX_STEP) { state.y = targetY; state.stepState = 'up'; }
    if (state.grounded && diff < -.02 && diff >= -STEP_DOWN) { state.y = targetY; state.stepState = 'down'; }
    if (state.grounded && diff < -STEP_DOWN) { state.grounded = false; state.stepState = 'ledge'; }
    mover.move(state, delta, wallOptions(MAX_STEP)); const landed = ground.sample(state.x, state.z), floorY = landed.height + footOffset;
    if (state.grounded && Math.abs(floorY - state.y) <= MAX_STEP) state.y = floorY;
    state.contacts = [...new Set(mover.lastContacts)].slice(0, 8); state.normals = mover.lastNormals.slice(-4);
  }

  function movementDelta(dt) {
    const axis = input.axis(), joy = joystick.vector, f = orbit.forward(), r = orbit.right();
    const forwardAxis = -(axis.y + joy.y * joy.magnitude), sideAxis = SIDE_SIGN * (axis.x + joy.x * joy.magnitude);
    let dx = r.x * sideAxis + f.x * forwardAxis, dz = r.z * sideAxis + f.z * forwardAxis; const len = Math.hypot(dx, dz);
    if (len <= .05) return null; dx /= len; dz /= len; state.facing = Math.atan2(dx, dz); const speed = state.grounded ? 3.45 : 2.65; return { x: dx * dt * speed, z: dz * dt * speed };
  }
  function wallOptions(step) { return { grounded: state.grounded, maxStepHeight: step, floorY: state.y - footOffset }; }
  function animate(dt) { const wanted = !state.grounded ? (state.airPhase === 'jump' ? clips.jump : clips.fall) : (state.moving ? clips.walk : clips.stand); if (state.clip !== wanted) { player.play(wanted); state.clip = wanted; } player.update(dt); }
  function expose() { window.__AWTS_OOS_3D__ = { scene, camera, renderer, player, model, state, octree, joystick, jumpButton, orbit, ground, grassImage, terrainStats: terrain.stats, grassTextureUrl: REAL_GRASS_URL, sky: true, animationNames: player.names, clips, controlSigns:{ side:SIDE_SIGN }, stepConfig:{ maxStep:MAX_STEP, stepDown:STEP_DOWN } }; if (hud) hud.textContent = `B"H 3D chossid • ${state.clip} • ${state.airPhase}/${state.stepState}/${state.slopeState} • x ${state.x.toFixed(1)} z ${state.z.toFixed(1)}`; }
  return window.__AWTS_OOS_3D__;
}

function clipMap(names) { const pick = (re, fb) => names.find((n) => re.test(n)) || fb; const stand = pick(/stand|idle/i, names[0] || ''); const walk = pick(/(^|[^a-z])walk(_|[^a-z]|$)/i, pick(/run/i, stand)); const jump = pick(/(^|[^a-z])jump(_|[^a-z]|$)/i, pick(/leap/i, stand)); return { stand, walk, jump, fall: pick(/fall|air|drop/i, jump) }; }
function placeModel(model, s) { model.position.set(s.x, s.y, s.z); model.quaternion.set(0, Math.sin(s.facing / 2), 0, Math.cos(s.facing / 2)); }
function faceTarget(s) { return { x:s.x, y:s.y + s.faceHeight, z:s.z }; }
function buildTriangleOctree(colliders) { const octree = new AwtsOctree(Aabb.centerSize({ x:0, y:0, z:0 }, { x:180, y:120, z:180 })); for (const tri of colliders) octree.insert(tri); return octree; }
function loadImage(src, timeoutMs = 2400) { return new Promise((resolve) => { const img = new Image(); let done = false; const finish = (v) => { if (!done) { done = true; resolve(v); } }; const timer = setTimeout(() => finish(null), timeoutMs); img.crossOrigin = 'anonymous'; img.onload = () => { clearTimeout(timer); finish(img); }; img.onerror = () => { clearTimeout(timer); finish(null); }; img.src = src; }); }

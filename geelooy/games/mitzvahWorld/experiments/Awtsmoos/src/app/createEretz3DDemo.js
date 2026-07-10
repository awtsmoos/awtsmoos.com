// B"H
import { Scene, PerspectiveCamera } from '../../../light-three-gltf/tiny-runtime.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { JumpButton } from '../input/JumpButton.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';
import { WorldGround } from '../world/WorldGround.js';
import { createTerrainPackage, DIRT_URLS, GRASS_URLS } from '../world/Terrain3D.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import { houseDoorDef } from '../world/House3D.js';
import { NpcChossid } from '../world/NpcChossid.js';
import { LavaLevel } from '../world/LavaLevel.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { ActionBar } from '../ui/ActionBar.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { NpcHud } from '../ui/NpcHud.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { loadHouseAssets } from '../assets/HouseAssets.js';

const GLB = 'https://models-3122d.web.app/chossid.glb', SIDE_SIGN = -1, FACE_HEIGHT = 1.78;
const MAX_STEP = .86, STEP_DOWN = .62, MAX_SLOPE_NORMAL = .72, WALK_SPEED = 3.25, RUN_SPEED = 6.15;

/** Real 3D Awtsmoos: isolated GLBs, switchable worlds, textured house and doors. */
export async function createEretz3DDemo({ canvas, joystickHost, jumpHost, hud, actionHost, inventoryHost, npcHost, dialogueHost }) {
  const scene = new Scene(), camera = new PerspectiveCamera(45, innerWidth / innerHeight, .1, 800), renderer = new TinyWebGLRenderer({ canvas });
  const bus = new AwtsmoosEventBus(), input = new UiEventSystem(canvas).install(bus), joystick = new MobileJoystick(joystickHost), jumpButton = new JumpButton(jumpHost), orbit = new CameraOrbitController(canvas, { distance: 10.8, pitch: .23, yaw: Math.PI, min: 2.4, max: 54 });
  const [grassImage, dirtImage, assets, playerGltf, npcGltf] = await Promise.all([loadFirstImage(GRASS_URLS, 4200), loadFirstImage(DIRT_URLS, 3600), loadHouseAssets(loadFirstImage), loadIsolatedGltf(GLB, 'player'), loadIsolatedGltf(GLB, 'npc')]);
  const terrain = createTerrainPackage(createObstacleField(assets), grassImage, dirtImage), mainOctree = buildTriangleOctree(terrain.colliders), ground = new WorldGround({ terrainHeightAt: terrain.heightAt, octree: mainOctree });
  scene.add(createSky3D()); scene.add(terrain.group);
  const model = playerGltf.scene; model.name = 'Awtsmoos_visible_player_isolated_chossid'; model.scale.set(1.52, 1.52, 1.52); model.position.set(0, 0, 4); model.setBaseTransform(); scene.add(model);
  const feet = alignModelFeetToGround(model, 0), footOffset = model.position.y, player = new TinyAnimationPlayer(model, playerGltf.animations), clips = clipMap(player.names), y0 = ground.heightAt(0, 4) + footOffset;
  const playerStats = { face: '🎩', name: 'Chossid', health: 100, xp: 0, xpMax: 100, level: 1 };
  const state = { x: 0, y: y0, renderY: y0, z: 4, facing: Math.PI, moving: false, runMode: false, clip: '', feet, contacts: [], normals: [], velY: 0, grounded: true, airPhase: 'ground', jumpClock: 0, faceHeight: FACE_HEIGHT, stepState: 'flat', slopeState: 'walk', ceilingHit: null, level: 'eretz', player: playerStats };
  const doors = [new DynamicDoor3D(tallDoorDef()), new DynamicDoor3D(houseDoorDef(assets))]; for (const d of doors) { d.setInteractionContext({ canvas, getCameraTarget: () => faceTarget(state) }).install(canvas, camera); scene.add(d.mesh); }
  const npc = new NpcChossid({ gltf: npcGltf, canvas, camera, bus, ground }); scene.add(npc.group); const lava = new LavaLevel(scene, assets);
  const mover = new AwtsmoosCollisionMover({ octree: mainOctree, radius: .38, height: 1.72, footOffset }), jumpPhysics = new JumpPhysics({ ground, footOffset, maxSlopeNormal: MAX_SLOPE_NORMAL });
  const worldMode = new WorldModeManager({ state, ground, mover, mainOctree, mainGroup: terrain.group, lava, mainObjects: [npc.group, ...doors.map(d => d.mesh)], footOffset }).rememberMainHeight(terrain.heightAt);
  const equipment = equipmentFromModel(model); const inventoryPanel = new InventoryPanel(inventoryHost, bus, { equipment, onEquipmentToggle: (m, on) => toggleMaterial(model, m, on) }); const actionBar = new ActionBar(actionHost, bus, state); const npcHud = new NpcHud(npcHost, dialogueHost, bus); wireBus(bus, state, worldMode);
  const api = {}; window.Awtsmoos = api; expose(); resize(); addEventListener('resize', resize); requestAnimationFrame(frame);

  function resize() { renderer.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio); camera.aspect = innerWidth / innerHeight; }
  function frame(now) { try { const dt = Math.min(.05, ((now - (frame.last || now)) / 1000) || 0); frame.last = now; update(dt); renderer.render(scene, camera); expose(); } catch (error) { window.AwtsmoosError = error?.stack || String(error); } requestAnimationFrame(frame); }
  function update(dt) { for (const d of doors) d.update(dt); lava.update(state); move(dt); const physics = jumpPhysics.update(state, dt, jumpButton.consume()); if (physics.slide) mover.move(state, physics.slide, wallOptions(.1, false)); resolveCeiling(); smoothRenderY(dt); animate(dt); npc.update(dt, state); placeModel(model, state); orbit.apply(camera, faceTarget(state), mover.octree); }
  function move(dt) { const delta = movementDelta(dt); state.moving = !!delta; if (!delta) return; const old = { x: state.x, y: state.y, z: state.z }, target = ground.sample(state.x + delta.x, state.z + delta.z), diff = target.height + footOffset - state.y; state.stepState = stepStateFor(target, diff); if (state.stepState === 'up' || state.stepState === 'down') state.y = target.height + footOffset; if (state.stepState === 'ledge') state.grounded = false; mover.move(state, delta, wallOptions(MAX_STEP, true)); if (headBlocked()) Object.assign(state, old, { stepState: 'head-block' }); const landed = ground.sample(state.x, state.z), floorY = landed.height + footOffset; if (state.grounded && Math.abs(floorY - state.y) <= MAX_STEP && landed.normal.y >= MAX_SLOPE_NORMAL) state.y = floorY; state.contacts = [...new Set([...mover.lastContacts, state.ceilingHit].filter(Boolean))].slice(0, 8); state.normals = mover.lastNormals.slice(-4); }
  function stepStateFor(target, diff) { if (state.grounded && target.normal.y < MAX_SLOPE_NORMAL && diff > .015) return 'too-steep'; if (state.grounded && diff > .02 && diff <= MAX_STEP) return 'up'; if (state.grounded && diff < -.02 && diff >= -STEP_DOWN) return 'down'; if (state.grounded && diff < -STEP_DOWN) return 'ledge'; return 'flat'; }
  function movementDelta(dt) { const axis = input.axis(), joy = joystick.vector, f = orbit.forward(), r = orbit.right(); const fa = -(axis.y + joy.y * joy.magnitude), sa = SIDE_SIGN * (axis.x + joy.x * joy.magnitude); let dx = r.x * sa + f.x * fa, dz = r.z * sa + f.z * fa, len = Math.hypot(dx, dz); if (len <= .05) return null; dx /= len; dz /= len; state.facing = Math.atan2(dx, dz); return { x: dx * dt * (state.runMode ? RUN_SPEED : WALK_SPEED), z: dz * dt * (state.runMode ? RUN_SPEED : WALK_SPEED) }; }
  function wallOptions(step, blockSteepFloors) { return { grounded: state.grounded, maxStepHeight: step, floorY: state.y - footOffset, maxSlopeNormal: MAX_SLOPE_NORMAL, blockSteepFloors, dynamicColliders: state.level === 'eretz' ? doors.flatMap(d => d.activeColliders()) : [] }; }
  function headBlocked() { if (!state.grounded) return false; const hit = mover.ceilingHit(state, wallOptions(MAX_STEP, true)); state.ceilingHit = hit?.kind || null; return !!hit; }
  function resolveCeiling() { state.ceilingHit = null; if (state.velY <= 0 && state.grounded) return; const c = mover.resolveCeiling(state, wallOptions(MAX_STEP, true)); if (!c.hit) return; state.ceilingHit = c.kind; state.velY = Math.min(state.velY, -1.45); state.grounded = false; state.airPhase = 'fall'; }
  function smoothRenderY(dt) { state.renderY += (state.y - state.renderY) * (state.grounded ? Math.min(1, dt * 12) : 1); }
  function animate(dt) { const wanted = !state.grounded ? (state.airPhase === 'jump' ? clips.jump : clips.fall) : (state.moving ? (state.runMode ? clips.run : clips.walk) : clips.stand); if (state.clip !== wanted) { player.play(wanted); state.clip = wanted; } player.update(dt); }
  function expose() { npcHud.updatePlayer(playerStats); Object.assign(api, { scene, camera, renderer, player, model, npc, lava, state, mover, bus, actionBar, npcHud, inventoryPanel, equipment, octree: mover.octree, mainOctree, joystick, jumpButton, orbit, ground, doors, door: doors[0], houseDoor: doors[1], worldMode, grassImage, dirtImage, assets, terrainStats: terrain.stats, lavaStats: lava.stats(), worldStats: worldMode.stats(), playerSource: playerGltf.scene.userData.isolatedModelLoad, npcSource: npcGltf.scene.userData.isolatedModelLoad, animationNames: player.names, clips, animationDiagnostics: player.diagnostics(), stepConfig: { maxStep: MAX_STEP, stepDown: STEP_DOWN, maxSlopeNormal: MAX_SLOPE_NORMAL, walkSpeed: WALK_SPEED, runSpeed: RUN_SPEED } }); if (hud) hud.textContent = `B"H 3D chossid • ${state.clip} • ${state.runMode ? 'run' : 'walk'} • ${state.level} • ${state.airPhase}/${state.stepState}/${state.slopeState}${state.ceilingHit ? '/ceiling' : ''} • doors ${doors.map(d=>d.state).join('/')} • clubs ${lava.collected}/${lava.clubs.length} • x ${state.x.toFixed(1)} z ${state.z.toFixed(1)}`; }
  return api;
}
function equipmentFromModel(model) { const mats = new Set(), meshes = [], visible = {}; model.traverse(o => { if (o.isMesh || o.isSkinnedMesh) { const mat = o.material?.name || 'material'; mats.add(mat); visible[mat] = o.visible !== false; meshes.push({ name: o.name, material: mat, object: o }); } }); return { materials: [...mats], meshes, visible }; }
function toggleMaterial(model, materialName, on) { model.traverse(o => { if ((o.isMesh || o.isSkinnedMesh) && o.material?.name === materialName) o.visible = !!on; }); }
function wireBus(bus, state, worldMode) { bus.on('mode:toggle-run', () => { state.runMode = !state.runMode; bus.emit('mode:changed', { runMode: state.runMode }); }); bus.on('level:lava', () => { worldMode.enterLava(); bus.emit('level:changed', { level: state.level }); }); bus.on('level:return-eretz', () => { worldMode.returnEretz(); bus.emit('level:changed', { level: state.level }); }); }
function clipMap(names) { const pick = (re, fb) => names.find(n => re.test(n)) || fb; const stand = pick(/stand|idle/i, names[0] || ''), walk = pick(/walk/i, stand), run = pick(/run/i, walk), jump = pick(/jump|leap/i, stand); return { stand, walk, run, jump, fall: pick(/fall|air|drop/i, jump) }; }
function placeModel(model, s) { model.position.set(s.x, s.renderY, s.z); model.quaternion.set(0, Math.sin(s.facing / 2), 0, Math.cos(s.facing / 2)); }
function faceTarget(s) { return { x: s.x, y: s.renderY + s.faceHeight, z: s.z }; }
function buildTriangleOctree(colliders) { const octree = new AwtsmoosOctree(Aabb.centerSize({ x: 0, y: 0, z: 0 }, { x: 180, y: 120, z: 180 })); for (const tri of colliders) octree.insert(tri); return octree; }
async function loadFirstImage(urls, timeoutMs) { for (const url of urls) { const img = await loadImage(url, timeoutMs); if (img) return img; } return null; }
function loadImage(src, timeoutMs = 2400) { return new Promise(resolve => { const img = new Image(); let done = false; const finish = v => { if (!done) { done = true; resolve(v); } }; const timer = setTimeout(() => finish(null), timeoutMs); img.crossOrigin = 'anonymous'; img.onload = () => { clearTimeout(timer); finish(img); }; img.onerror = () => { clearTimeout(timer); finish(null); }; img.src = src; }); }

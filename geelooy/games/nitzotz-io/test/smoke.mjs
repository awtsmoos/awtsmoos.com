// B"H
import { step } from '../js/game.js';
import { buildRenderList } from '../js/engine/renderList.js';
import { createLevel } from '../js/level.js';
import { createWorld } from '../js/state.js';

const limits = {
  low: { objects: 120, commands: 260 },
  medium: { objects: 210, commands: 540 },
  high: { objects: 760, commands: 650 }
};

const results = [];
for (const perf of Object.keys(limits)) results.push(checkPerf(perf));
results.push(checkHazard());
console.log(JSON.stringify({ ok: true, results }));

function checkPerf(perf) {
  const world = createWorld();
  world.save.perf = perf;
  world.level = createLevel(world.save, 0);
  world.mode = 'playing';
  for (let i = 0; i < 10; i += 1) step(world, 1 / 60);
  const commands = buildRenderList(world, 1);
  const bad = commands.filter(command => !finiteCommand(command));
  const nearWall = commands.filter(command => nearCameraWall(command, world));
  if (bad.length) throw new Error(`${perf}: non-finite render commands ${bad.length}`);
  if (nearWall.length) throw new Error(`${perf}: near camera wall commands ${nearWall.length}`);
  if (world.level.objects.length > limits[perf].objects) throw new Error(`${perf}: too many active objects ${world.level.objects.length}`);
  if (commands.length > limits[perf].commands) throw new Error(`${perf}: too many commands ${commands.length}`);
  return { perf, objects: world.level.objects.length, commands: commands.length, camera: world.camera };
}

function checkHazard() {
  const world = createWorld();
  world.mode = 'playing';
  world.score = 500;
  world.level.objects = [{ id: 999, name: 'giant-test', hood: 'Trial', x: 1, y: 1, z: 0, r: 90, h: 120, sx: 90, sz: 90, sparks: 900, taken: false, color: [1, 0, 0], hue: 0, rot: 0 }];
  const before = world.timeLeft;
  step(world, 1 / 60);
  if (world.score >= 500) throw new Error('hazard did not reduce score');
  if (world.timeLeft >= before) throw new Error('hazard did not reduce time');
  return { perf: 'hazard', score: world.score, timeLeft: world.timeLeft, hits: world.danger.hits };
}

function nearCameraWall(command, world) {
  const d = Math.hypot(command.pos[0] - world.camera.x, command.pos[2] - world.camera.y);
  return d < 170 && command.scale[1] > 80;
}

function finiteCommand(command) {
  return [...command.pos, ...command.scale, command.rot, command.alpha, command.glow].every(Number.isFinite);
}

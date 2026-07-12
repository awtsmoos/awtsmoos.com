// B"H
import { buildRenderList } from '../engine/renderList.js';
import { updateStats } from '../engine/stats.js';
import { hsl } from '../math.js';
import { updatePerformance } from '../performance.js';
import { drawCommand } from './draw.js';
import { viewProjection } from './matrix.js';

/** Render one bright material-aware, fogged, persistent procedural arena frame. */
export function renderFrame(renderer, effects, screen, world, canvas) {
	const gl = renderer.gl;
	const time = performance.now() * 0.001;
	const commands = buildRenderList(world, time);
	const useEffects = Boolean(world.save.postfx && world.performance?.postfx);
	effects.begin();
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.024, 0.022, 0.065, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(renderer.program);
	setSceneUniforms(renderer, world, canvas, time);
	for (const command of commands) drawCommand(renderer, command);
	const texture = effects.end();
	if (effects.enabled && useEffects) screen.draw(gl, texture);
	updatePerformance(world.performance, world.lastDt || 1 / 60, commands.length);
	updateStats(world, commands.length, useEffects ? 'postfx' : 'direct');
}

function setSceneUniforms(renderer, world, canvas, time) {
	const { gl, loc } = renderer;
	const camera = world.camera;
	const fog = hsl(world.level.hue, 38, 12);
	gl.uniformMatrix4fv(loc.uVP, false, new Float32Array(viewProjection(canvas, camera, world.player)));
	gl.uniform3fv(loc.uCamera, [camera.x, camera.z, camera.y]);
	gl.uniform3fv(loc.uFogColor, fog);
	gl.uniform1f(loc.uFogNear, 980);
	gl.uniform1f(loc.uFogFar, Math.max(2800, world.level.bounds * 1.3));
	gl.uniform1f(loc.uTime, time);
}

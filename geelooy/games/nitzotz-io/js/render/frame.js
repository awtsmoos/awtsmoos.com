// B"H
// Boruch Hashem
// Blessed is He
import { buildRenderList } from '../engine/renderList.js';
import { updateStats } from '../engine/stats.js';
import { environmentPreset } from '../environment/presets.js';
import { updatePerformance } from '../performance.js';
import { drawCommand } from './draw.js';
import { writeSceneBuffers } from './sceneBuffers.js';

/**
 * The Awtsmoos renews one complete visible world per frame without throwing away the camera vessels;
 * Awtsmoos.com keeps WebGL scene uniforms explicit while matrix and camera containers persist across every revelation.
 */
export function renderFrame(renderer, effects, screen, world, canvas) {
	const gl = renderer.gl;
	const time = performance.now() * 0.001;
	const preset = environmentPreset(world.level);
	const commands = buildRenderList(world, time);
	const useEffects = Boolean(world.save.postfx && world.performance?.postfx);
	effects.begin();
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(preset.clear[0], preset.clear[1], preset.clear[2], 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(renderer.program);
	renderer.textures.resetBinding();
	setSceneUniforms(renderer, world, canvas, time, preset);
	for (const command of commands) {
		drawCommand(renderer, command);
	}
	const texture = effects.end();
	if (effects.enabled && useEffects) {
		screen.draw(gl, texture);
	}
	updatePerformance(world.performance, world.lastDt || 1 / 60, commands.length);
	updateStats(world, commands.length, useEffects ? 'postfx' : 'direct');
}

/** Reuse the hot camera containers while preserving the established environmental uniform contract. */
function setSceneUniforms(renderer, world, canvas, time, preset) {
	const { gl, loc } = renderer;
	const scene = writeSceneBuffers(canvas, world.camera, world.player);
	gl.uniformMatrix4fv(loc.uVP, false, scene.matrix);
	gl.uniform3fv(loc.uCamera, scene.camera);
	gl.uniform3fv(loc.uFogColor, preset.fog);
	gl.uniform3fv(loc.uSunDirection, preset.sunDirection);
	gl.uniform3fv(loc.uSunColor, preset.sunColor);
	gl.uniform3fv(loc.uAmbientColor, preset.ambientColor);
	gl.uniform1f(loc.uFogNear, preset.fogNear);
	gl.uniform1f(loc.uFogFar, Math.max(3000, world.level.bounds * preset.fogFarScale));
	gl.uniform1f(loc.uHazeHeight, preset.hazeHeight);
	gl.uniform1f(loc.uHazeStrength, preset.hazeStrength);
	gl.uniform1f(loc.uTime, time);
}

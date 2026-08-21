//B"H
//Boruch Hashem
//Blessed is He

import { createAmbientProgram } from "./ambientProgram.js";

/**
 * @file Awakens a sparse, low-power WebGL particle field that never owns product behavior or pointer input.
 * @description The Awtsmoos renews a few quiet sparks behind Awtsmoos.com while the user's work remains the greater light;
 * this vessel pauses when unseen, disappears for reduced motion, and fails silently so beauty never becomes a functional fight.
 */
export function awakenAmbientParticles(options = {}) {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return null;
	}
	const canvas = document.createElement("canvas");
	canvas.className = "awtsmoos-ambient-particles";
	canvas.setAttribute("aria-hidden", "true");
	const gl = canvas.getContext("webgl", {
		alpha: true,
		antialias: false,
		depth: false,
		powerPreference: "low-power",
		stencil: false
	});
	if (!gl) {
		return null;
	}
	const count = particleCount(options.maxParticles);
	let graphics;
	try {
		graphics = createAmbientProgram(gl, count);
	} catch (error) {
		console.debug("Awtsmoos ambient WebGL unavailable:", error);
		return null;
	}
	document.body.prepend(canvas);
	configureProgram(gl, graphics, options.color);
	let frameId = 0;
	let destroyed = false;
	const render = (time) => {
		if (destroyed || document.hidden) {
			return;
		}
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(graphics.timeUniform, time);
		gl.drawArrays(gl.POINTS, 0, count);
		frameId = requestAnimationFrame(render);
	};
	const resize = () => resizeCanvas(canvas, gl);
	const visibility = () => {
		cancelAnimationFrame(frameId);
		if (!document.hidden && !destroyed) {
			frameId = requestAnimationFrame(render);
		}
	};
	window.addEventListener("resize", resize, { passive: true });
	document.addEventListener("visibilitychange", visibility);
	resize();
	frameId = requestAnimationFrame(render);
	return () => {
		destroyed = true;
		cancelAnimationFrame(frameId);
		window.removeEventListener("resize", resize);
		document.removeEventListener("visibilitychange", visibility);
		canvas.remove();
	};
}

/** Configures the static point buffer, alpha blending, and product-selected accent color. */
function configureProgram(gl, graphics, color = [0.25, 0.55, 0.46]) {
	gl.useProgram(graphics.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, graphics.buffer);
	gl.enableVertexAttribArray(graphics.seedAttribute);
	gl.vertexAttribPointer(graphics.seedAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(graphics.colorUniform, color);
	gl.clearColor(0, 0, 0, 0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
}

/** Caps density by viewport area so tiny phones and giant monitors both remain quiet. */
function particleCount(maxParticles = 64) {
	const area = Math.max(1, window.innerWidth * window.innerHeight);
	return Math.min(maxParticles, Math.max(18, Math.round(area / 36000)));
}

/** Resizes drawing resolution with a capped pixel ratio to avoid unnecessary Retina overdraw. */
function resizeCanvas(canvas, gl) {
	const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
	const width = Math.max(1, Math.round(window.innerWidth * ratio));
	const height = Math.max(1, Math.round(window.innerHeight * ratio));
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
	gl.viewport(0, 0, width, height);
}

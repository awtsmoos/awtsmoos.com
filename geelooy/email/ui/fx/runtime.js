//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailAmbientRuntime
 * @description The Awtsmoos renews every frame without fatigue; Awtsmoos.com gives optional particles a bounded lifecycle so hidden tabs, reduced motion, and constrained devices remain quiet.
 */
import { GL } from './gl.js';
import { SHADERS } from './shaders.js';
import { Physics } from './physics.js';

const ATTRIBUTES = Object.freeze([
	{ name: 'a_position', size: 2 },
	{ name: 'a_size', size: 1 },
	{ name: 'a_alpha', size: 1 },
	{ name: 'a_type', size: 1 }
]);

/** Owns only WebGL initialization, sizing, visibility, and the animation loop. */
export class TiferesAmbientRuntime {
	constructor() {
		this.gl = null;
		this.canvas = null;
		this.program = null;
		this.buffer = null;
		this.animationFrame = null;
		this.uniforms = null;
		this.boundResize = () => this.resize();
		this.boundVisibility = () => this.handleVisibility();
	}

	init(canvas) {
		this.stop();
		if (!canvas || !this.animationAllowed()) {
			return false;
		}
		this.canvas = canvas;
		this.gl = GL.createContext(canvas);
		this.program = this.gl ? GL.createProgram(this.gl, SHADERS.VS, SHADERS.FS) : null;
		this.buffer = this.program ? GL.createBuffer(this.gl) : null;
		if (!this.gl || !this.program || !this.buffer) {
			this.stop();
			return false;
		}
		this.uniforms = {
			resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
			scroll: this.gl.getUniformLocation(this.program, 'u_scroll')
		};
		this.resize();
		Physics.init(this.canvas.width, this.canvas.height);
		window.addEventListener('resize', this.boundResize, { passive: true });
		document.addEventListener('visibilitychange', this.boundVisibility);
		this.resume();
		return true;
	}

	resize() {
		if (!this.gl || !this.canvas) {
			return;
		}
		const previousWidth = this.canvas.width;
		const previousHeight = this.canvas.height;
		GL.resize(this.gl);
		if (previousWidth !== this.canvas.width || previousHeight !== this.canvas.height) {
			Physics.init(this.canvas.width, this.canvas.height);
		}
	}

	stop() {
		this.pause();
		window.removeEventListener('resize', this.boundResize);
		document.removeEventListener('visibilitychange', this.boundVisibility);
		this.gl = null;
		this.canvas = null;
		this.program = null;
		this.buffer = null;
		this.uniforms = null;
	}

	pause() {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
		this.animationFrame = null;
	}

	resume() {
		if (!this.animationFrame && this.gl && this.animationAllowed()) {
			this.loop();
		}
	}

	handleVisibility() {
		document.visibilityState === 'hidden' ? this.pause() : this.resume();
	}

	animationAllowed() {
		const reduceMotion = typeof window.matchMedia === 'function'
			&& window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const hardwareThreads = Number(navigator.hardwareConcurrency || 0);
		const lowCpu = hardwareThreads > 0 && hardwareThreads <= 2;
		return !reduceMotion && !lowCpu && document.visibilityState !== 'hidden';
	}

	loop() {
		if (!this.gl || !this.canvas || !this.animationAllowed()) {
			this.animationFrame = null;
			return;
		}
		const { data, scroll } = Physics.update(this.canvas.width, this.canvas.height);
		this.gl.useProgram(this.program);
		this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
		this.gl.uniform1f(this.uniforms.scroll, scroll);
		GL.drawPoints(this.gl, this.program, this.buffer, data, ATTRIBUTES);
		this.animationFrame = requestAnimationFrame(() => this.loop());
	}
}

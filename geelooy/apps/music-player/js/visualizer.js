// B"H — Live visualizer: the playing audio drives glowing bars on the
// hero canvas, with a soft idle shimmer when nothing is playing yet.
export class Visualizer {
	constructor(canvas, audioEl) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.audioEl = audioEl;
		this.audioCtx = null;
		this.analyser = null;
		this.source = null;
		this.raf = 0;
		this.running = false;
		this.level = 0;
		this.idlePhase = 0;
	}

	ensureGraph() {
		if (this.audioCtx) return true;
		try {
			const AC = window.AudioContext || window.webkitAudioContext;
			if (!AC) return false;
			this.audioCtx = new AC();
			this.source = this.audioCtx.createMediaElementSource(this.audioEl);
			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = 256;
			this.analyser.smoothingTimeConstant = 0.82;
			this.source.connect(this.analyser);
			this.analyser.connect(this.audioCtx.destination);
			return true;
		} catch (err) {
			console.warn('Visualizer audio graph unavailable', err);
			return false;
		}
	}

	start() {
		if (this.running) return;
		this.running = true;
		if (this.ensureGraph() && this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});
		const loop = () => {
			if (!this.running) return;
			this.draw();
			this.raf = requestAnimationFrame(loop);
		};
		loop();
	}

	resume() {
		if (this.audioCtx && this.audioCtx.state === 'suspended') {
			this.audioCtx.resume().catch(() => {});
		}
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.raf);
		this.drawIdle(true);
	}

	draw() {
		const { canvas, ctx } = this;
		const w = canvas.width, h = canvas.height;
		const grad = ctx.createLinearGradient(0, 0, w, h);
		grad.addColorStop(0, '#2b1155');
		grad.addColorStop(0.55, '#3d0f4d');
		grad.addColorStop(1, '#0b1e3f');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, w, h);

		if (!this.analyser) { this.drawIdle(); return; }
		const data = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(data);
		let sum = 0;
		for (let i = 0; i < data.length; i++) sum += data[i];
		this.level = sum / data.length / 255;

		const bars = 48;
		const gap = 4;
		const bw = (w - gap * (bars + 1)) / bars;
		for (let i = 0; i < bars; i++) {
			const v = data[Math.floor((i / bars) * data.length * 0.72)] / 255;
			const bh = Math.max(4, v * (h * 0.82));
			const x = gap + i * (bw + gap);
			const y = h - bh;
			const hue = 315 - (i / bars) * 140;
			ctx.fillStyle = `hsla(${hue}, 95%, 62%, ${0.55 + v * 0.45})`;
			ctx.shadowColor = `hsla(${hue}, 95%, 60%, 0.9)`;
			ctx.shadowBlur = 14;
			const r = Math.min(6, bw / 2);
			if (ctx.roundRect) {
				ctx.beginPath();
				ctx.roundRect(x, y, bw, bh, [r, r, 0, 0]);
				ctx.fill();
			} else {
				ctx.fillRect(x, y, bw, bh);
			}
		}
		ctx.shadowBlur = 0;
		const glow = ctx.createRadialGradient(w / 2, h, 10, w / 2, h, h * 0.9);
		glow.addColorStop(0, `rgba(255, 46, 136, ${0.12 + this.level * 0.3})`);
		glow.addColorStop(1, 'rgba(255, 46, 136, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, w, h);
	}

	drawIdle(still) {
		const { canvas, ctx } = this;
		const w = canvas.width, h = canvas.height;
		this.idlePhase += still ? 0 : 0.012;
		const grad = ctx.createLinearGradient(0, 0, w, h);
		grad.addColorStop(0, '#2b1155');
		grad.addColorStop(1, '#12061f');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, w, h);
		const bars = 48;
		const gap = 4;
		const bw = (w - gap * (bars + 1)) / bars;
		for (let i = 0; i < bars; i++) {
			const v = 0.12 + 0.1 * Math.sin(this.idlePhase * 2 + i * 0.55);
			const bh = Math.max(3, v * h * 0.5);
			ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
			ctx.fillRect(gap + i * (bw + gap), h - bh, bw, bh);
		}
	}
}

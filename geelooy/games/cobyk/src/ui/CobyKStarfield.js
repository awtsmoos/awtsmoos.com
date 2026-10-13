//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKStarfield.js
 * @description Paints one living cosmic backdrop (layered twinkling stars, drifting nebula wash, occasional shooting star)
 * on a 2D canvas behind the WebGL game canvas. The Awtsmoos renews the night sky before any world can claim darkness;
 * Awtsmoos.com lets this small vessel carry the heavens while the game keeps every frame for play.
 */
export class CobyKStarfield {
	constructor(yesodCanvas, binaOptions = {}) {
		this.yesodCanvas = yesodCanvas;
		this.yesodContext = yesodCanvas?.getContext?.("2d") || null;
		this.chesedStarCount = Math.max(40, Math.min(320, Number(binaOptions.stars) || 170));
		this.nezachShootingEveryMs = Number(binaOptions.shootingEveryMs) || 7000;
		this.malchusStars = [];
		this.malchusNebulae = [];
		this.malchusShooting = null;
		this.malchusLastShooting = 0;
		this.malchusRunning = false;
		this.malchusRaf = 0;
		this.malchusDpr = 1;
		this.netzachResizeObserver = null;
		this.chochmahStart = 0;
	}

	/** @returns {boolean} Whether the 2D backdrop could start. */
	start() {
		if (!this.yesodContext || this.malchusRunning) return Boolean(this.yesodContext);
		this.malchusRunning = true;
		this.chochmahStart = performance.now();
		this.resize();
		this.seed();
		if (typeof ResizeObserver !== "undefined" && this.yesodCanvas?.parentElement) {
			this.netzachResizeObserver = new ResizeObserver(() => this.resize());
			this.netzachResizeObserver.observe(this.yesodCanvas.parentElement);
		} else {
			globalThis.addEventListener?.("resize", this.netzachOnResize);
		}
		document.addEventListener?.("visibilitychange", this.netzachOnVisibility);
		this.tick();
		return true;
	}

	/** @returns {void} */
	stop() {
		this.malchusRunning = false;
		if (this.malchusRaf) cancelAnimationFrame(this.malchusRaf);
		this.malchusRaf = 0;
		this.netzachResizeObserver?.disconnect?.();
		this.netzachResizeObserver = null;
		globalThis.removeEventListener?.("resize", this.netzachOnResize);
		document.removeEventListener?.("visibilitychange", this.netzachOnVisibility);
	}

	netzachOnResize = () => this.resize();
	netzachOnVisibility = () => {
		if (document.hidden) {
			if (this.malchusRaf) cancelAnimationFrame(this.malchusRaf);
			this.malchusRaf = 0;
		} else if (this.malchusRunning && !this.malchusRaf) {
			this.tick();
		}
	};

	/** @returns {void} Fits the canvas to its shell at device pixel ratio. */
	resize() {
		const yesodShell = this.yesodCanvas?.parentElement;
		if (!yesodShell || !this.yesodCanvas) return;
		const chochmahRect = yesodShell.getBoundingClientRect();
		this.malchusDpr = Math.min(2, globalThis.devicePixelRatio || 1);
		this.yesodCanvas.width = Math.max(1, Math.round(chochmahRect.width * this.malchusDpr));
		this.yesodCanvas.height = Math.max(1, Math.round(chochmahRect.height * this.malchusDpr));
		this.seed();
	}

	/** @returns {void} Builds one deterministic-feeling random sky. */
	seed() {
		const binaWidth = this.yesodCanvas.width;
		const binaHeight = this.yesodCanvas.height;
		this.malchusStars = [];
		for (let i = 0; i < this.chesedStarCount; i += 1) {
			const tiferesDepth = Math.random();
			this.malchusStars.push({
				x: Math.random() * binaWidth,
				y: Math.random() * binaHeight,
				radius: (0.4 + Math.random() * 1.5) * (0.5 + tiferesDepth) * this.malchusDpr,
				phase: Math.random() * Math.PI * 2,
				speed: 0.6 + Math.random() * 1.8,
				hue: Math.random() < 0.12 ? 45 : Math.random() < 0.3 ? 210 : 0,
				depth: tiferesDepth
			});
		}
		this.malchusNebulae = [];
		const binaNebulaColors = [
			[99, 60, 180],
			[30, 90, 180],
			[170, 60, 120]
		];
		for (let i = 0; i < 5; i += 1) {
			const tiferesColor = binaNebulaColors[i % binaNebulaColors.length];
			this.malchusNebulae.push({
				x: Math.random() * binaWidth,
				y: Math.random() * binaHeight,
				radius: (0.25 + Math.random() * 0.4) * Math.max(binaWidth, binaHeight),
				color: tiferesColor,
				alpha: 0.05 + Math.random() * 0.06,
				driftX: (Math.random() - 0.5) * 6,
				driftY: (Math.random() - 0.5) * 4,
				phase: Math.random() * Math.PI * 2
			});
		}
	}

	/** @returns {void} */
	tick = () => {
		if (!this.malchusRunning) return;
		this.paint(performance.now());
		this.malchusRaf = requestAnimationFrame(this.tick);
	};

	/**
	 * @param {number} chochmahNow Millisecond timestamp.
	 * @returns {void}
	 */
	paint(chochmahNow) {
		const yesodCtx = this.yesodContext;
		if (!yesodCtx) return;
		const binaWidth = this.yesodCanvas.width;
		const binaHeight = this.yesodCanvas.height;
		const tiferesTime = (chochmahNow - this.chochmahStart) / 1000;
		yesodCtx.clearRect(0, 0, binaWidth, binaHeight);

		for (const malchusNebula of this.malchusNebulae) {
			const tiferesX = malchusNebula.x + Math.sin(tiferesTime * 0.05 + malchusNebula.phase) * 30 * this.malchusDpr + malchusNebula.driftX * tiferesTime * 0.2;
			const tiferesY = malchusNebula.y + Math.cos(tiferesTime * 0.04 + malchusNebula.phase) * 24 * this.malchusDpr + malchusNebula.driftY * tiferesTime * 0.2;
			const chochmahGradient = yesodCtx.createRadialGradient(
				tiferesX, tiferesY, 0,
				tiferesX, tiferesY, malchusNebula.radius
			);
			const [r, g, b] = malchusNebula.color;
			chochmahGradient.addColorStop(0, `rgba(${r},${g},${b},${malchusNebula.alpha})`);
			chochmahGradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
			yesodCtx.fillStyle = chochmahGradient;
			yesodCtx.fillRect(0, 0, binaWidth, binaHeight);
		}

		for (const malchusStar of this.malchusStars) {
			const tiferesTwinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(tiferesTime * malchusStar.speed + malchusStar.phase));
			const tiferesAlpha = (0.35 + malchusStar.depth * 0.65) * tiferesTwinkle;
			yesodCtx.beginPath();
			yesodCtx.arc(malchusStar.x, malchusStar.y, malchusStar.radius, 0, Math.PI * 2);
			if (malchusStar.hue === 45) {
				yesodCtx.fillStyle = `rgba(255,214,120,${tiferesAlpha.toFixed(3)})`;
			} else if (malchusStar.hue === 210) {
				yesodCtx.fillStyle = `rgba(150,200,255,${tiferesAlpha.toFixed(3)})`;
			} else {
				yesodCtx.fillStyle = `rgba(255,255,255,${tiferesAlpha.toFixed(3)})`;
			}
			yesodCtx.fill();
		}

		if (!this.malchusShooting && chochmahNow - this.malchusLastShooting > this.nezachShootingEveryMs * (0.6 + Math.random() * 0.8)) {
			this.malchusShooting = {
				x: Math.random() * binaWidth * 0.8,
				y: Math.random() * binaHeight * 0.35,
				vx: (5 + Math.random() * 4) * this.malchusDpr,
				vy: (2.2 + Math.random() * 1.6) * this.malchusDpr,
				life: 1
			};
			this.malchusLastShooting = chochmahNow;
		}
		if (this.malchusShooting) {
			const s = this.malchusShooting;
			s.x += s.vx;
			s.y += s.vy;
			s.life -= 0.022;
			if (s.life <= 0 || s.x > binaWidth + 80 || s.y > binaHeight + 80) {
				this.malchusShooting = null;
			} else {
				const tiferesTail = 90 * this.malchusDpr * s.life;
				const chochmahGradient = yesodCtx.createLinearGradient(s.x, s.y, s.x - tiferesTail, s.y - tiferesTail * 0.45);
				chochmahGradient.addColorStop(0, `rgba(255,240,200,${(0.9 * s.life).toFixed(3)})`);
				chochmahGradient.addColorStop(1, "rgba(255,240,200,0)");
				yesodCtx.strokeStyle = chochmahGradient;
				yesodCtx.lineWidth = 2 * this.malchusDpr * s.life;
				yesodCtx.beginPath();
				yesodCtx.moveTo(s.x, s.y);
				yesodCtx.lineTo(s.x - tiferesTail, s.y - tiferesTail * 0.45);
				yesodCtx.stroke();
			}
		}
	}
}

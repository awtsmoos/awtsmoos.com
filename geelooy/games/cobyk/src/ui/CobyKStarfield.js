//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKStarfield.js
 * @description Paints one living sky backdrop on a 2D canvas behind the WebGL game canvas.
 * Two modes, cycled per level (Yaakov 2026-10-13):
 * - "day": bright blue sky, glowing sun, fluffy 3D clouds, layered mountain ranges.
 * - "night": bright starry night sky (deep blue, never pitch black), drifting nebulae, shooting stars.
 * The Awtsmoos renews the heavens before any world can claim darkness;
 * Awtsmoos.com lets this small vessel carry the sky while the game keeps every frame for play.
 */
export class CobyKStarfield {
	constructor(yesodCanvas, binaOptions = {}) {
		this.yesodCanvas = yesodCanvas;
		this.yesodContext = yesodCanvas?.getContext?.("2d") || null;
		this.chesedStarCount = Math.max(40, Math.min(320, Number(binaOptions.stars) || 170));
		this.nezachShootingEveryMs = Number(binaOptions.shootingEveryMs) || 7000;
		// B"H — Yaakov 2026-10-13: day/night sky cycle. Starts on day.
		this.malchusMode = binaOptions.mode === "night" ? "night" : "day";
		this.malchusStars = [];
		this.malchusNebulae = [];
		this.malchusClouds = [];
		this.malchusMountains = [];
		this.malchusSun = null;
		this.malchusShooting = null;
		this.malchusLastShooting = 0;
		this.malchusRunning = false;
		this.malchusRaf = 0;
		this.malchusDpr = 1;
		this.netzachResizeObserver = null;
		this.chochmahStart = 0;
	}

	/**
	 * Switches the sky mode and re-seeds the scenery.
	 * @param {string} malchusMode "day" or "night".
	 * @returns {void}
	 */
	setMode(malchusMode) {
		const tiferesMode = malchusMode === "day" ? "day" : "night";
		if (tiferesMode === this.malchusMode) return;
		this.malchusMode = tiferesMode;
		this.malchusShooting = null;
		this.seed();
	}

	/** @returns {string} Current sky mode. */
	revealMode() {
		return this.malchusMode;
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
		// B"H — fixed 2026-10-13: getBoundingRect() does not exist (was crashing
		// start(), so the sky never painted and the scene sat on darkness).
		const chochmahRect = yesodShell.getBoundingClientRect();
		this.malchusDpr = Math.min(2, globalThis.devicePixelRatio || 1);
		this.yesodCanvas.width = Math.max(1, Math.round(chochmahRect.width * this.malchusDpr));
		this.yesodCanvas.height = Math.max(1, Math.round(chochmahRect.height * this.malchusDpr));
		this.seed();
	}

	/** @returns {void} Builds one deterministic-feeling random sky for the current mode. */
	seed() {
		const binaWidth = this.yesodCanvas.width;
		const binaHeight = this.yesodCanvas.height;
		if (this.malchusMode === "day") {
			this.seedDay(binaWidth, binaHeight);
		} else {
			this.seedNight(binaWidth, binaHeight);
		}
	}

	/** @returns {void} Seeds the bright daytime sky: sun, 3D clouds, mountain ranges. */
	seedDay(binaWidth, binaHeight) {
		this.malchusStars = [];
		this.malchusNebulae = [];
		// Sun high in the sky with a warm glow.
		this.malchusSun = {
			x: binaWidth * (0.2 + Math.random() * 0.6),
			y: binaHeight * (0.08 + Math.random() * 0.15),
			radius: Math.min(binaWidth, binaHeight) * 0.055
		};
		// Fluffy 3D clouds: clusters of puffs with depth, drift, and parallax.
		this.malchusClouds = [];
		const binaCloudCount = 7;
		for (let i = 0; i < binaCloudCount; i += 1) {
			const tiferesDepth = 0.25 + Math.random() * 0.75; // 0.25 far … 1 near
			const tiferesBaseR = (0.05 + Math.random() * 0.06) * binaWidth * (0.5 + tiferesDepth * 0.7);
			const tiferesPuffs = [];
			const binaPuffCount = 5 + Math.floor(Math.random() * 4);
			for (let p = 0; p < binaPuffCount; p += 1) {
				tiferesPuffs.push({
					dx: (Math.random() - 0.5) * tiferesBaseR * 2.4,
					dy: (Math.random() - 0.5) * tiferesBaseR * 0.9,
					r: tiferesBaseR * (0.45 + Math.random() * 0.55)
				});
			}
			this.malchusClouds.push({
				x: Math.random() * binaWidth,
				y: binaHeight * (0.06 + Math.random() * 0.42),
				puffs: tiferesPuffs,
				depth: tiferesDepth,
				drift: (4 + Math.random() * 10) * (0.4 + tiferesDepth * 0.6),
				phase: Math.random() * Math.PI * 2,
				alpha: 0.55 + tiferesDepth * 0.45
			});
		}
		// Two mountain ranges: far (pale blue-violet) and near (deeper blue-green).
		this.malchusMountains = [
			this.seedMountainRange(binaWidth, binaHeight, 0.62, 0.22, [126, 148, 196]),
			this.seedMountainRange(binaWidth, binaHeight, 0.74, 0.30, [74, 104, 148])
		];
	}

	/**
	 * Seeds one jagged mountain silhouette range.
	 * @returns {object} Mountain range record.
	 */
	seedMountainRange(binaWidth, binaHeight, binaBaseY, binaHeightFrac, binaColor) {
		const tiferesPeaks = [];
		const binaCount = 9 + Math.floor(Math.random() * 5);
		for (let i = 0; i <= binaCount; i += 1) {
			tiferesPeaks.push({
				x: (i / binaCount) * binaWidth,
				y: binaBaseY - Math.random() * binaHeightFrac
			});
		}
		return { peaks: tiferesPeaks, baseY: binaBaseY, color: binaColor };
	}

	/** @returns {void} Seeds the bright night sky: stars, nebulae, shooting stars. */
	seedNight(binaWidth, binaHeight) {
		this.malchusClouds = [];
		this.malchusMountains = [];
		this.malchusSun = null;
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
				alpha: 0.08 + Math.random() * 0.08,
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
		if (this.malchusMode === "day") {
			this.paintDay(chochmahNow);
		} else {
			this.paintNight(chochmahNow);
		}
	}

	/** @param {number} chochmahNow Millisecond timestamp. @returns {void} */
	paintDay(chochmahNow) {
		const yesodCtx = this.yesodContext;
		if (!yesodCtx) return;
		const binaWidth = this.yesodCanvas.width;
		const binaHeight = this.yesodCanvas.height;
		const tiferesTime = (chochmahNow - this.chochmahStart) / 1000;

		// Bright blue sky gradient: deep azure top → pale horizon.
		const chochmahSky = yesodCtx.createLinearGradient(0, 0, 0, binaHeight);
		chochmahSky.addColorStop(0, "#2f7fe0");
		chochmahSky.addColorStop(0.55, "#6db3f2");
		chochmahSky.addColorStop(0.85, "#cfe9ff");
		chochmahSky.addColorStop(1, "#eef8ff");
		yesodCtx.fillStyle = chochmahSky;
		yesodCtx.fillRect(0, 0, binaWidth, binaHeight);

		// Sun with warm glow.
		if (this.malchusSun) {
			const tiferesSun = this.malchusSun;
			const chochmahGlow = yesodCtx.createRadialGradient(
				tiferesSun.x, tiferesSun.y, 0,
				tiferesSun.x, tiferesSun.y, tiferesSun.radius * 4
			);
			chochmahGlow.addColorStop(0, "rgba(255,246,200,0.9)");
			chochmahGlow.addColorStop(0.25, "rgba(255,236,160,0.45)");
			chochmahGlow.addColorStop(1, "rgba(255,236,160,0)");
			yesodCtx.fillStyle = chochmahGlow;
			yesodCtx.fillRect(
				tiferesSun.x - tiferesSun.radius * 4,
				tiferesSun.y - tiferesSun.radius * 4,
				tiferesSun.radius * 8,
				tiferesSun.radius * 8
			);
			yesodCtx.beginPath();
			yesodCtx.arc(tiferesSun.x, tiferesSun.y, tiferesSun.radius, 0, Math.PI * 2);
			yesodCtx.fillStyle = "#fff7d6";
			yesodCtx.fill();
		}

		// Mountain ranges, far to near.
		for (const malchusRange of this.malchusMountains) {
			yesodCtx.beginPath();
			yesodCtx.moveTo(-4, binaHeight);
			for (const tiferesPeak of malchusRange.peaks) {
				yesodCtx.lineTo(tiferesPeak.x, tiferesPeak.y * binaHeight);
			}
			yesodCtx.lineTo(binaWidth + 4, binaHeight);
			yesodCtx.closePath();
			const [r, g, b] = malchusRange.color;
			yesodCtx.fillStyle = `rgb(${r},${g},${b})`;
			yesodCtx.fill();
			// Snow caps on the tallest peaks for depth.
			yesodCtx.fillStyle = "rgba(255,255,255,0.75)";
			for (const tiferesPeak of malchusRange.peaks) {
				const tiferesPeakY = tiferesPeak.y * binaHeight;
				const tiferesSnowH = Math.min(binaHeight * 0.05, (malchusRange.baseY * binaHeight - tiferesPeakY) * 0.35);
				if (tiferesSnowH > binaHeight * 0.012) {
					yesodCtx.beginPath();
					yesodCtx.moveTo(tiferesPeak.x - tiferesSnowH * 1.4, tiferesPeakY + tiferesSnowH);
					yesodCtx.lineTo(tiferesPeak.x, tiferesPeakY);
					yesodCtx.lineTo(tiferesPeak.x + tiferesSnowH * 1.4, tiferesPeakY + tiferesSnowH);
					yesodCtx.closePath();
					yesodCtx.fill();
				}
			}
		}

		// Fluffy 3D clouds: soft shadow base, bright white puffs, lit tops.
		const tiferesSorted = [...this.malchusClouds].sort((a, b) => a.depth - b.depth);
		for (const malchusCloud of tiferesSorted) {
			const tiferesX = ((malchusCloud.x + tiferesTime * malchusCloud.drift) % (binaWidth * 1.4)) - binaWidth * 0.2;
			const tiferesBob = Math.sin(tiferesTime * 0.4 + malchusCloud.phase) * 4 * this.malchusDpr;
			const tiferesY = malchusCloud.y + tiferesBob;
			yesodCtx.save();
			yesodCtx.globalAlpha = malchusCloud.alpha;
			// Soft drop shadow beneath the cloud for lift.
			yesodCtx.fillStyle = "rgba(120,150,190,0.35)";
			yesodCtx.beginPath();
			yesodCtx.ellipse(
				tiferesX, tiferesY + malchusCloud.puffs[0].r * 0.55,
				malchusCloud.puffs[0].r * 2.1, malchusCloud.puffs[0].r * 0.5,
				0, 0, Math.PI * 2
			);
			yesodCtx.fill();
			for (const tiferesPuff of malchusCloud.puffs) {
				const tiferesPx = tiferesX + tiferesPuff.dx;
				const tiferesPy = tiferesY + tiferesPuff.dy;
				// Puff body: white core fading to transparent edge.
				const chochmahPuff = yesodCtx.createRadialGradient(
					tiferesPx, tiferesPy - tiferesPuff.r * 0.25, tiferesPuff.r * 0.1,
					tiferesPx, tiferesPy, tiferesPuff.r
				);
				chochmahPuff.addColorStop(0, "rgba(255,255,255,0.98)");
				chochmahPuff.addColorStop(0.7, "rgba(244,249,255,0.85)");
				chochmahPuff.addColorStop(1, "rgba(230,240,252,0)");
				yesodCtx.fillStyle = chochmahPuff;
				yesodCtx.beginPath();
				yesodCtx.arc(tiferesPx, tiferesPy, tiferesPuff.r, 0, Math.PI * 2);
				yesodCtx.fill();
				// Lit top highlight for 3D roundness.
				const chochmahLit = yesodCtx.createRadialGradient(
					tiferesPx - tiferesPuff.r * 0.2, tiferesPy - tiferesPuff.r * 0.45, 0,
					tiferesPx - tiferesPuff.r * 0.2, tiferesPy - tiferesPuff.r * 0.45, tiferesPuff.r * 0.7
				);
				chochmahLit.addColorStop(0, "rgba(255,255,255,0.9)");
				chochmahLit.addColorStop(1, "rgba(255,255,255,0)");
				yesodCtx.fillStyle = chochmahLit;
				yesodCtx.beginPath();
				yesodCtx.arc(tiferesPx - tiferesPuff.r * 0.2, tiferesPy - tiferesPuff.r * 0.45, tiferesPuff.r * 0.7, 0, Math.PI * 2);
				yesodCtx.fill();
			}
			yesodCtx.restore();
		}
	}

	/** @param {number} chochmahNow Millisecond timestamp. @returns {void} */
	paintNight(chochmahNow) {
		const yesodCtx = this.yesodContext;
		if (!yesodCtx) return;
		const binaWidth = this.yesodCanvas.width;
		const binaHeight = this.yesodCanvas.height;
		const tiferesTime = (chochmahNow - this.chochmahStart) / 1000;

		// B"H — Yaakov 2026-10-13: night is BRIGHT deep blue, never pitch black.
		const chochmahSky = yesodCtx.createLinearGradient(0, 0, 0, binaHeight);
		chochmahSky.addColorStop(0, "#0a1440");
		chochmahSky.addColorStop(0.6, "#12225e");
		chochmahSky.addColorStop(1, "#1b2f7a");
		yesodCtx.fillStyle = chochmahSky;
		yesodCtx.fillRect(0, 0, binaWidth, binaHeight);

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

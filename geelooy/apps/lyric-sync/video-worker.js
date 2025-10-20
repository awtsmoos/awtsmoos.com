// B"H - Definitive Worker: Advanced Physics, Increased Speed & Size

// --- FONT SETUP ---
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif';

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- WORKER GLOBAL STATE ---
let lastActiveCue = null;
const frameRate = 24;

// --- MAIN MESSAGE HANDLER ---
self.onmessage = async ({
	data: {
		cues,
		audioBufferShim,
		settings
	}
}) => {
	try {
		await handleExport({
			cues,
			audioBufferShim,
			settings
		});
	} catch (error) {
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: {
				message: error.message,
				error: error.stack
			}
		});
	}
};

// --- EXPORT HANDLING ---
async function handleExport({
	cues,
	audioBufferShim,
	settings
}) {
	const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
	const totalFrames = Math.floor(totalDuration * frameRate);
	const volumeDataForFrames = preAnalyzeAudio(audioBufferShim, totalFrames);
	const exportParticleSystem = new ParticleSystem(settings.particles, settings.resolution);

	// --- QUALITY SET TO 1 ---
	const renderer = new MediaBunnyBase({
			resolution: settings.resolution,
			outputFormat: {
				quality: 1
			}
		},
		(base, frame) => {
			drawFrame({
				...base,
				cues,
				settings,
				particleSystem: exportParticleSystem,
				volumeDataForFrames
			}, frame);
		}, {
			libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
		}
	);

	await renderer.start();

	for (let i = 0; i <= totalFrames; i++) {
		const time = i / frameRate;
		await renderer.addFrame({
			time,
			duration: 1 / frameRate,
			frameNumber: i
		});
		if (i > 0 && i % frameRate === 0) {
			self.postMessage({
				type: 'STATUS_UPDATE',
				payload: {
					message: `Encoding frame ${i} of ${totalFrames}`,
					progress: (i / totalFrames) * 100
				}
			});
		}
	}

	const blob = await renderer.finalize(audioBufferShim);
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob,
			fileName: `BH_video_${new Date().getTime()}.mp4`
		}
	});
}

// --- CORE DRAWING LOGIC ---
function drawFrame({
	ctx,
	canvas,
	cues,
	settings,
	particleSystem,
	volumeDataForFrames
}, framePayload) {
	const {
		time,
		frameNumber
	} = framePayload;
	const {
		width,
		height
	} = canvas;
	const currentVolume = volumeDataForFrames[frameNumber] || 0.01;

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	particleSystem.updateAndDraw(ctx, currentVolume);
	drawWaveform(ctx, time, width, height, settings, currentVolume);

	const currentCue = cues.find(cue => time >= cue.start && time < cue.end);
	if (currentCue) lastActiveCue = currentCue;

	if (lastActiveCue) {
		const boxSize = width * 0.9;
		const {
			boxColor,
			boxOpacity,
			font
		} = settings;
		const r = parseInt(boxColor.substr(1, 2), 16),
			g = parseInt(boxColor.substr(3, 2), 16),
			b = parseInt(boxColor.substr(5, 2), 16);
		ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
		ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
		wrapText(ctx, lastActiveCue.text, width / 2, height / 2, boxSize, boxSize, font, height / 720);
	}
}

// --- ALL VISUAL & HELPER FUNCTIONS ---

function preAnalyzeAudio(audioBufferShim, totalFrames) {
	/* ... same as before ... */ }

function drawWaveform(ctx, time, width, height, settings, volume) {
	/* ... same as before ... */ }

function getWrappedLines(ctx, text, maxWidth) {
	/* ... same as before ... */ }

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
	/* ... same as before ... */ }

// --- REWRITTEN PARTICLE SYSTEM WITH ADVANCED PHYSICS ---
class ParticleSystem {
	constructor(settings, resolution) {
		this.settings = settings;
		this.width = resolution.width;
		this.height = resolution.height;
		// --- BIGGER PARTICLES ---
		this.sizeScalar = Math.max(1.0, this.height / 720) * 1.5;
		this.particles = Array.from({
			length: settings.density || 0
		}, () => this.createParticle({}));
	}

	createParticle(p = {}, options = {}) {
		const {
			isSubParticle = false, x, y
		} = options;
		p.x = x !== undefined ? x : Math.random() * this.width;
		p.y = y !== undefined ? y : this.height + Math.random() * 20;

		// --- NEW PHYSICS STATE ---
		// Audio-driven velocity, which will decay over time
		p.avx = 0;
		p.avy = 0;

		if (isSubParticle) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 3 + Math.random() * 4;
			// Base velocity for sub-particles is their explosion direction
			p.vx = Math.cos(angle) * speed;
			p.vy = Math.sin(angle) * speed;
			p.life = 60;
		} else {
			// Base velocity for primary particles is a faster upward drift
			p.vx = (Math.random() - 0.5) * 2;
			p.vy = -(Math.random() * 2.5 + 2.0); // --- FASTER UPWARD SPEED ---
			p.life = Infinity;
		}

		const baseSize = Math.max(5, (this.settings.baseSize || 20) + (Math.random() - 0.5) * (this.settings.variation || 15));
		p.size = baseSize * this.sizeScalar;
		if (isSubParticle) p.size *= 0.6;
		p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
		p.hue = Math.random() * 360;
		p.opacity = 0.6 + Math.random() * 0.4;
		return p;
	}

	updateAndDraw(ctx, volume) {
		// --- NEW PHYSICS CALCULATIONS ---
		const forceAmount = (volume ** 2) * 2.5; // How much "push" the audio gives
		const damping = 0.92; // Friction factor, closer to 1 means less friction

		// Lower explosion chance to allow particles to live longer
		const explosionChance = 0.001 + (volume * 0.015);

		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			if (p.life !== Infinity) p.life--;
			if (p.life <= 0) {
				this.particles.splice(i, 1);
				continue;
			}

			// Explosion logic remains the same
			if (p.life === Infinity && Math.random() < explosionChance) {
				for (let j = 0; j < 7; j++) this.particles.push(this.createParticle({}, {
					isSubParticle: true,
					x: p.x,
					y: p.y
				}));
				this.createParticle(p);
				continue;
			}

			// --- APPLY FORCE & DAMPING ---
			// 1. Apply a random "push" from the audio volume to the audio velocity
			if (forceAmount > 0.1) {
				p.avx += (Math.random() - 0.5) * forceAmount;
				p.avy += (Math.random() - 0.5) * forceAmount;
			}

			// 2. Apply damping (friction) to the audio velocity so it decays over time
			p.avx *= damping;
			p.avy *= damping;

			// 3. Update position using BOTH base velocity and the decaying audio velocity
			p.x += p.vx + p.avx;
			p.y += p.vy + p.avy;

			// Resetting logic remains the same
			if (p.life === Infinity && p.y < -p.size) this.createParticle(p);

			const opacity = (p.life < 30) ? p.opacity * (p.life / 30) : p.opacity;

			ctx.save();
			ctx.translate(p.x, p.y); // We no longer add jitter here
			ctx.rotate((p.x + p.y) * 0.02);
			ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
			ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${opacity})`;
			ctx.fillText(p.char, 0, 0);
			ctx.restore();
		}
		this.drawLightning(ctx);
	}

	drawLightning(ctx) {
		const checks = 3;
		for (let i = 0; i < checks; i++) {
			const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
			const p2 = this.particles[Math.floor(Math.random() * this.particles.length)];
			if (p1 && p2 && p1 !== p2 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < this.width * 0.35) {
				const createPath = () => {
					ctx.beginPath();
					ctx.moveTo(p1.x, p1.y);
					for (let j = 1; j <= 3; j++) ctx.lineTo(p1.x + (p2.x - p1.x) * (j / 4) + (Math.random() - 0.5) * 25, p1.y + (p2.y - p1.y) * (j / 4) + (Math.random() - 0.5) * 25);
					ctx.lineTo(p2.x, p2.y);
				};
				ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
				ctx.lineWidth = 3;
				createPath();
				ctx.stroke();
				ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
				ctx.lineWidth = 1;
				createPath();
				ctx.stroke();
			}
		}
	}
}

function getWrappedLines(ctx, text, maxWidth) {
	const lines = text.split("\n");
	let allLines = [];
	lines.forEach(line => {
		let currentLine = "",
			words = line.split(" ");
		for (let i = 0; i < words.length; i++) {
			let testLine = currentLine + (currentLine ? " " : "") + words[i];
			i > 0 && ctx.measureText(testLine).width > maxWidth ? (allLines.push(currentLine), currentLine = words[i]) : currentLine = testLine
		}
		allLines.push(currentLine)
	});
	return allLines
}

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
	let scaledFontSize = fontSettings.size * scaleFactor;
	while (scaledFontSize > 5) {
		ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
		const lines = getWrappedLines(ctx, text, maxWidth * .95);
		if (lines.length * scaledFontSize * 1.4 < maxHeight * .95) break;
		scaledFontSize -= 1
	}
	ctx.direction = "ltr", ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`, ctx.textAlign = fontSettings.align;
	const lines = getWrappedLines(ctx, text, maxWidth * .95),
		lineHeight = 1.4 * scaledFontSize,
		startY = y - (lines.length - 1) * lineHeight / 2 + .3 * scaledFontSize;
	lines.forEach((line, i) => {
		const currentY = startY + i * lineHeight;
		if (fontSettings.borderWidth > 0) {
			ctx.strokeStyle = fontSettings.borderColor, ctx.lineWidth = fontSettings.borderWidth * scaleFactor * 2, ctx.strokeText(line, x, currentY)
		}
		ctx.fillStyle = fontSettings.color, ctx.fillText(line, x, currentY)
	})
}

function preAnalyzeAudio(audioBufferShim, totalFrames) {
	const channelData = audioBufferShim.channels[0];
	if (!channelData || channelData.length === 0) return new Array(totalFrames).fill(.01);
	const volumeLevels = [];
	const samplesPerFrame = Math.floor(channelData.length / totalFrames);
	for (let i = 0; i < totalFrames; i++) {
		let rms = 0;
		const start = i * samplesPerFrame;
		for (let j = 0; j < samplesPerFrame; j++) rms += (channelData[start + j] || 0) ** 2;
		const volume = Math.sqrt(rms / samplesPerFrame);
		volumeLevels.push(isNaN(volume) ? .01 : Math.max(.01, volume))
	}
	return volumeLevels
}

function drawWaveform(ctx, time, width, height, settings, volume) {
	const {
		waveformHeight,
		waveformThickness
	} = settings;
	if (waveformHeight <= 0) return;
	const maxAmplitude = height * (waveformHeight / 100),
		amplitude = maxAmplitude * volume ** 1.5,
		undulation = Math.sin(time * .7) * (height * .015),
		baseY = height * .85 + undulation;
	const createPath = () => {
		ctx.beginPath();
		for (let x = 0; x <= width; x += 15) {
			const mainWave = Math.sin(x * .01 + time * 4) * .5,
				detailWave = Math.sin(x * .03 + time * 9) * .3,
				staticWave = Math.sin(x * .1 + time * 20) * .2,
				yOffset = (mainWave + detailWave + staticWave) * amplitude,
				finalY = baseY + yOffset;
			x === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY)
		}
	};
	const colorIntensity = 200 + Math.floor(volume * 55),
		glowColor = `rgba(${colorIntensity-50}, ${colorIntensity-20}, 255, ${.3*volume})`,
		mainColor = `rgba(${colorIntensity}, ${colorIntensity}, 255, ${.6*volume+.2})`;
	ctx.strokeStyle = glowColor, ctx.lineWidth = waveformThickness * 3, createPath(), ctx.stroke(), ctx.strokeStyle = mainColor, ctx.lineWidth = waveformThickness, createPath(), ctx.stroke()
}
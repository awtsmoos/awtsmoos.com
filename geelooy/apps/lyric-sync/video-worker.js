// B"H
// - Definitive Worker v3: Restored Exploding Particles, Shape-Based Effects, Lightning Fast

// --- FONT SETUP ---
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif'; // The key to universal, font-free emoji support

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- WORKER GLOBAL STATE ---
let lastActiveCue = null;
const frameRate = 24;
let backgroundImages = [];

// --- MAIN MESSAGE HANDLER ---
self.onmessage = async ({
	data: {
		cues,
		audioBufferShim,
		settings,
		imageBitmaps
	}
}) => {
	try {
		if (imageBitmaps && imageBitmaps.length > 0) {
			backgroundImages = imageBitmaps.map(bitmap =>
				calculateImageFit(bitmap, settings.resolution.width, settings.resolution.height)
			);
		} else {
			backgroundImages = [];
		}
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
	const glowLayer = new OffscreenCanvas(settings.resolution.width, settings.resolution.height);
	const glowCtx = glowLayer.getContext('2d', {
		alpha: true
	});

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
				volumeDataForFrames,
				glowLayer,
				glowCtx
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
			fileName: `BH_video_final_${new Date().getTime()}.mp4`
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
	volumeDataForFrames,
	glowLayer,
	glowCtx
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

	// 1. Draw Background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);
	if (backgroundImages.length > 0) {
		const imageIndex = Math.floor(time / 5) % backgroundImages.length;
		const img = backgroundImages[imageIndex];
		const scale = 1 + currentVolume * 0.05;
		const scaledWidth = img.drawWidth * scale;
		const scaledHeight = img.drawHeight * scale;
		ctx.drawImage(img.bitmap, img.sx, img.sy, img.sWidth, img.sHeight, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);
	}

	// 2. Draw Particles & Waveform
	glowCtx.clearRect(0, 0, width, height);
	particleSystem.updateAndDraw(ctx, glowCtx, currentVolume);
	drawWaveform(ctx, glowCtx, time, width, height, settings, currentVolume);

	// 3. Apply SHAPE-BASED Bloom (FAST)
	applyShapeBloom(ctx, glowLayer, settings.effects.bloom);

	// 4. Draw Text
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

	// 5. Apply Post-Processing (FAST)
	applyPostProcessing(ctx, canvas, settings.effects);
}

// --- RESTORED & UPGRADED PARTICLE SYSTEM ---
class ParticleSystem {
	constructor(settings, resolution) {
		this.settings = settings;
		this.width = resolution.width;
		this.height = resolution.height;
		this.sizeScalar = Math.max(1.0, this.height / 720) * 1.5;
		this.particles = (settings.density > 0 && settings.chars.length > 0) ?
			Array.from({
				length: settings.density
			}, () => this.createParticle({})) :
			[];
	}

	createParticle(p = {}, options = {}) {
		const {
			isSubParticle = false, x, y
		} = options;
		p.x = x !== undefined ? x : Math.random() * this.width;
		p.y = y !== undefined ? y : this.height + Math.random() * 20;
		p.avx = 0;
		p.avy = 0; // Audio-driven velocity

		if (isSubParticle) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 3 + Math.random() * 4;
			p.vx = Math.cos(angle) * speed;
			p.vy = Math.sin(angle) * speed;
			p.life = 60;
		} else {
			p.vx = (Math.random() - 0.5) * 2;
			p.vy = -(Math.random() * 2.5 + 2.0); // Faster upward speed
			p.life = Infinity;
		}

		const baseSize = Math.max(5, (this.settings.baseSize || 20) + (Math.random() - 0.5) * (this.settings.variation || 15));
		p.size = baseSize * this.sizeScalar * (isSubParticle ? 0.6 : 1);
		p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
		p.hue = Math.random() * 360;
		p.opacity = 0.6 + Math.random() * 0.4;
		return p;
	}

	updateAndDraw(ctx, glowCtx, volume) {
		if (this.particles.length === 0) return;
		const forceAmount = (volume ** 2) * 2.5;
		const damping = 0.92;
		const explosionChance = 0.001 + (volume * 0.015);

		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			if (p.life !== Infinity) p.life--;
			if (p.life <= 0) {
				this.particles.splice(i, 1);
				continue;
			}

			if (p.life === Infinity && Math.random() < explosionChance) {
				for (let j = 0; j < 7; j++) this.particles.push(this.createParticle({}, {
					isSubParticle: true,
					x: p.x,
					y: p.y
				}));
				this.createParticle(p); // Replace the exploded particle
				continue;
			}

			if (forceAmount > 0.1) {
				p.avx += (Math.random() - 0.5) * forceAmount;
				p.avy += (Math.random() - 0.5) * forceAmount;
			}
			p.avx *= damping;
			p.avy *= damping;
			p.x += p.vx + p.avx;
			p.y += p.vy + p.avy;

			if (p.life === Infinity && p.y < -p.size) this.createParticle(p);

			const opacity = (p.life < 30) ? p.opacity * (p.life / 30) : p.opacity;
			const font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
			const color = `hsla(${p.hue}, 90%, 75%, ${opacity})`;

			// Draw to both canvases for bloom effect
			ctx.font = font;
			ctx.fillStyle = color;
			ctx.fillText(p.char, p.x, p.y);

			glowCtx.font = font;
			glowCtx.fillStyle = color;
			glowCtx.fillText(p.char, p.x, p.y);
		}
		this.drawLightning(ctx); // Restore lightning effect
	}

	drawLightning(ctx) {
		if (this.particles.length < 2) return;
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
				// Draw with strokes instead of gradients
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


// --- HIGH-PERFORMANCE, SHAPE-BASED VISUAL EFFECTS ---

function applyShapeBloom(ctx, glowLayer, intensity) {
	if (intensity <= 0) return;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	// Draw the glow layer multiple times with increasing size and decreasing opacity
	ctx.globalAlpha = 0.4;
	ctx.drawImage(glowLayer, 0, 0, ctx.canvas.width + intensity * 2, ctx.canvas.height + intensity * 2);
	ctx.globalAlpha = 0.25;
	ctx.drawImage(glowLayer, 0, 0, ctx.canvas.width + intensity * 4, ctx.canvas.height + intensity * 4);
	ctx.globalAlpha = 0.15;
	ctx.drawImage(glowLayer, 0, 0, ctx.canvas.width + intensity * 6, ctx.canvas.height + intensity * 6);
	ctx.restore();
}

function applyPostProcessing(ctx, canvas, effects) {
	if (effects.grain <= 0 && effects.vignette <= 0) return;
	const {
		width,
		height
	} = canvas;
	const imageData = ctx.getImageData(0, 0, width, height);
	const pixels = imageData.data;
	const centerX = width / 2;
	const centerY = height / 2;
	const maxDist = Math.hypot(centerX, centerY);
	for (let i = 0; i < pixels.length; i += 4) {
		const x = (i / 4) % width;
		const y = Math.floor((i / 4) / width);
		const dist = Math.hypot(x - centerX, y - centerY);
		const vignette = 1 - Math.pow(dist / maxDist, 2.0) * (effects.vignette / 100);
		const grain = (Math.random() - 0.5) * effects.grain;
		pixels[i] = pixels[i] * vignette + grain;
		pixels[i + 1] = pixels[i + 1] * vignette + grain;
		pixels[i + 2] = pixels[i + 2] * vignette + grain;
	}
	ctx.putImageData(imageData, 0, 0);
}


// --- HELPER & UTILITY FUNCTIONS (Unchanged) ---
function calculateImageFit(img, targetWidth, targetHeight) {
	const imgRatio = img.width / img.height;
	const targetRatio = targetWidth / targetHeight;
	let sWidth, sHeight, sx, sy;
	if (imgRatio > targetRatio) {
		sHeight = img.height;
		sWidth = sHeight * targetRatio;
		sx = (img.width - sWidth) / 2;
		sy = 0;
	} else {
		sWidth = img.width;
		sHeight = sWidth / targetRatio;
		sx = 0;
		sy = (img.height - sHeight) / 2;
	}
	return {
		bitmap: img,
		sx,
		sy,
		sWidth,
		sHeight,
		drawWidth: targetWidth,
		drawHeight: targetHeight
	};
}

function getWrappedLines(ctx, text, maxWidth) {
	const lines = text.split("\n");
	let allLines = [];
	lines.forEach(line => {
		let currentLine = "",
			words = line.split(" ");
		for (let i = 0; i < words.length; i++) {
			let testLine = currentLine + (currentLine ? " " : "") + words[i];
			if (ctx.measureText(testLine).width > maxWidth && i > 0) {
				allLines.push(currentLine);
				currentLine = words[i];
			} else {
				currentLine = testLine;
			}
		}
		allLines.push(currentLine);
	});
	return allLines;
}

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
	let scaledFontSize = fontSettings.size * scaleFactor;
	while (scaledFontSize > 5) {
		ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
		const lines = getWrappedLines(ctx, text, maxWidth * .95);
		if (lines.length * scaledFontSize * 1.4 < maxHeight * .95) break;
		scaledFontSize -= 1
	}
	ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
	ctx.textAlign = fontSettings.align;
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

function drawWaveform(ctx, glowCtx, time, width, height, settings, volume) {
	const {
		waveformHeight,
		waveformThickness
	} = settings;
	if (waveformHeight <= 0) return;
	const maxAmplitude = height * (waveformHeight / 100),
		amplitude = maxAmplitude * volume ** 1.5,
		undulation = Math.sin(time * .7) * (height * .015),
		baseY = height * .85 + undulation;
	const createPath = (targetCtx) => {
		targetCtx.beginPath();
		for (let x = 0; x <= width; x += 15) {
			const yOffset = (Math.sin(x * .01 + time * 4) * .5 + Math.sin(x * .03 + time * 9) * .3 + Math.sin(x * .1 + time * 20) * .2) * amplitude;
			x === 0 ? targetCtx.moveTo(x, baseY + yOffset) : targetCtx.lineTo(x, baseY + yOffset)
		}
	};
	const colorIntensity = 200 + Math.floor(volume * 55),
		glowColor = `rgba(${colorIntensity - 50}, ${colorIntensity - 20}, 255, ${.3 * volume})`,
		mainColor = `rgba(${colorIntensity}, ${colorIntensity}, 255, ${.6 * volume + .2})`;
	const drawOnContext = (targetCtx) => {
		targetCtx.strokeStyle = glowColor;
		targetCtx.lineWidth = waveformThickness * 3;
		createPath(targetCtx);
		targetCtx.stroke();
		targetCtx.strokeStyle = mainColor;
		targetCtx.lineWidth = waveformThickness;
		createPath(targetCtx);
		targetCtx.stroke();
	};
	drawOnContext(ctx);
	drawOnContext(glowCtx);
}
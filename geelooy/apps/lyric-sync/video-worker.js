// B"H
// - Definitive Worker: Image Backgrounds + High-Performance Ein Sof Effects

// --- FONT SETUP ---
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
// Using a generic fallback is the key to universal emoji support without loading font files.
const EMOJI_FALLBACK_FONT = 'sans-serif';

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- WORKER GLOBAL STATE ---
let lastActiveCue = null;
const frameRate = 24;
let backgroundImages = []; // Will hold pre-processed image data

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
		// B"H - Pre-process images as soon as they arrive
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

	// B"H - Create offscreen canvases for effects. This is more efficient than creating them per frame.
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
			// Pass all necessary components to the draw function
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
			fileName: `BH_video_EinSof_${new Date().getTime()}.mp4`
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

	// --- 1. Draw Background ---
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);
	if (backgroundImages.length > 0) {
		// Cycle through images every 5 seconds, for example
		const imageIndex = Math.floor(time / 5) % backgroundImages.length;
		const img = backgroundImages[imageIndex];

		// Audio-reactive scaling
		const scale = 1 + currentVolume * 0.05; // Subtle "breathing" effect
		const scaledWidth = img.drawWidth * scale;
		const scaledHeight = img.drawHeight * scale;

		ctx.drawImage(
			img.bitmap,
			img.sx, img.sy, img.sWidth, img.sHeight, // source rect
			(width - scaledWidth) / 2, (height - scaledHeight) / 2, // destination pos (centered)
			scaledWidth, scaledHeight // destination size
		);
	}

	// --- 2. Draw Particles & Waveform ---
	// Clear the glow layer for this frame
	glowCtx.clearRect(0, 0, width, height);

	particleSystem.updateAndDraw(ctx, glowCtx, currentVolume);
	drawWaveform(ctx, glowCtx, time, width, height, settings, currentVolume);

	// --- 3. Apply High-Performance Bloom ---
	applyBloom(ctx, glowLayer, settings.effects.bloom);

	// --- 4. Draw Text Box and Lyrics ---
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

	// --- 5. Apply Fast Post-Processing Effects ---
	applyPostProcessing(ctx, canvas, settings.effects);
}


// --- EIN SOF & VISUAL FUNCTIONS ---

function applyBloom(ctx, glowLayer, intensity) {
	if (intensity <= 0) return;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.globalAlpha = 0.7;
	ctx.filter = `blur(${intensity * 1.5}px)`;
	ctx.drawImage(glowLayer, 0, 0);
	ctx.globalAlpha = 1.0;
	ctx.filter = `blur(${intensity * 0.5}px)`;
	ctx.drawImage(glowLayer, 0, 0);
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
		// Vignette calculation
		const x = (i / 4) % width;
		const y = Math.floor((i / 4) / width);
		const dist = Math.hypot(x - centerX, y - centerY);
		const vignette = 1 - Math.pow(dist / maxDist, 2.5) * (effects.vignette / 100);

		// Film grain calculation
		const grain = (Math.random() - 0.5) * effects.grain;

		pixels[i] = pixels[i] * vignette + grain;
		pixels[i + 1] = pixels[i + 1] * vignette + grain;
		pixels[i + 2] = pixels[i + 2] * vignette + grain;
	}
	ctx.putImageData(imageData, 0, 0);
}


// --- PARTICLE SYSTEM (Updated to draw to glow layer) ---
class ParticleSystem {
	constructor(settings, resolution) {
		this.settings = settings;
		this.width = resolution.width;
		this.height = resolution.height;
		this.sizeScalar = Math.max(1.0, this.height / 720);
		// Only create particles if density is greater than 0
		this.particles = (settings.density > 0 && settings.chars.length > 0) ?
			Array.from({
				length: settings.density
			}, () => this.createParticle({})) :
			[];
	}

	createParticle(p = {}) {
		p.x = Math.random() * this.width;
		p.y = Math.random() * this.height;
		p.vx = (Math.random() - 0.5) * 0.5;
		p.vy = (Math.random() - 0.5) * 0.5;
		p.size = (this.settings.baseSize + (Math.random() - 0.5) * this.settings.variation) * this.sizeScalar;
		p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
		p.hue = Math.random() * 360;
		p.opacity = 0.4 + Math.random() * 0.5;
		return p;
	}

	updateAndDraw(ctx, glowCtx, volume) {
		if (this.particles.length === 0) return;
		this.particles.forEach(p => {
			p.x += p.vx + (Math.random() - 0.5) * volume * 2;
			p.y += p.vy + (Math.random() - 0.5) * volume * 2;
			if (p.x > this.width + p.size) p.x = -p.size;
			if (p.x < -p.size) p.x = this.width + p.size;
			if (p.y > this.height + p.size) p.y = -p.size;
			if (p.y < -p.size) p.y = this.height + p.size;

			const finalOpacity = p.opacity * (0.5 + volume * 2);
			const color = `hsla(${p.hue}, 90%, 75%, ${finalOpacity})`;
			// Use the universal emoji font stack
			const font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;

			// Draw to main canvas
			ctx.font = font;
			ctx.fillStyle = color;
			ctx.fillText(p.char, p.x, p.y);

			// Draw a brighter version to the glow canvas for the bloom effect
			glowCtx.font = font;
			glowCtx.fillStyle = `hsla(${p.hue}, 95%, 85%, ${finalOpacity * 0.8})`;
			glowCtx.fillText(p.char, p.x, p.y);
		});
	}
}

// --- HELPER FUNCTIONS ---

function calculateImageFit(img, targetWidth, targetHeight) {
	const imgRatio = img.width / img.height;
	const targetRatio = targetWidth / targetHeight;
	let sWidth, sHeight, sx, sy, drawWidth, drawHeight;

	// This logic ensures the image "covers" the canvas without stretching
	if (imgRatio > targetRatio) { // Image is wider than target
		sHeight = img.height;
		sWidth = sHeight * targetRatio;
		sx = (img.width - sWidth) / 2;
		sy = 0;
	} else { // Image is taller or same ratio
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

// --- Unchanged Functions: wrapText, getWrappedLines, preAnalyzeAudio, drawWaveform ---
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
			const mainWave = Math.sin(x * .01 + time * 4) * .5,
				detailWave = Math.sin(x * .03 + time * 9) * .3,
				staticWave = Math.sin(x * .1 + time * 20) * .2,
				yOffset = (mainWave + detailWave + staticWave) * amplitude,
				finalY = baseY + yOffset;
			x === 0 ? targetCtx.moveTo(x, finalY) : targetCtx.lineTo(x, finalY)
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
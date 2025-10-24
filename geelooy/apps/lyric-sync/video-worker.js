// B"H
// - Definitive Worker v9: FINAL PERFORMANCE. Highlight bug fixed.
// - Text rendering engine rebuilt for perfect vertical highlight centering.
// - Particle explosions are now fewer, faster, and have a shorter lifespan for maximum visual impact and speed.

const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif';
const DEBRIS_CHARS = ['.', '*', '•', '+'];

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- WORKER GLOBAL STATE ---
let lastActiveCue = null;
let lastActiveCueIndex = -1;
let lastActiveWordIndex = -1;
let backgroundImages = [];
const frameRate = 24;

self.onmessage = async ({
	data: {
		cues,
		audioBufferShim,
		settings,
		imageBitmaps
	}
}) => {
	try {
		backgroundImages = imageBitmaps && imageBitmaps.length > 0 ? imageBitmaps.map(b => calculateImageFit(b, settings.resolution.width, settings.resolution.height)) : [];
		await handleExport({
			cues,
			audioBufferShim,
			settings
		});
	} catch (e) {
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: {
				message: e.message,
				error: e.stack
			}
		});
	}
};

async function handleExport({
	cues,
	audioBufferShim,
	settings
}) {
	const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
	const totalFrames = Math.floor(totalDuration * frameRate);
	const volumeData = preAnalyzeAudio(audioBufferShim, totalFrames);
	const particleSystem = new ParticleSystem(settings.particles, settings.resolution);

	const renderer = new MediaBunnyBase({
			resolution: settings.resolution,
			outputFormat: {
				quality: 1
			}
		},
		(base, frame) => drawFrame({
			...base,
			cues,
			settings,
			particleSystem,
			volumeData
		}, frame), {
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
		if (i > 0 && i % frameRate === 0) self.postMessage({
			type: 'STATUS_UPDATE',
			payload: {
				message: `Encoding frame ${i}/${totalFrames}`,
				progress: (i / totalFrames) * 100
			}
		});
	}
	const blob = await renderer.finalize(audioBufferShim);
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob,
			fileName: `BH_video_INFINITE_${new Date().getTime()}.mp4`
		}
	});
}

function drawFrame({
	ctx,
	canvas,
	cues,
	settings,
	particleSystem,
	volumeData
}, {
	time,
	frameNumber
}) {
	const {
		width,
		height
	} = canvas;
	const currentVolume = volumeData[frameNumber] || 0.01;

	// 1. Background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);
	if (backgroundImages.length > 0) {
		const img = backgroundImages[Math.floor(time / 5) % backgroundImages.length];
		const scale = 1 + currentVolume * 0.05;
		const sW = img.drawWidth * scale,
			sH = img.drawHeight * scale;
		ctx.drawImage(img.bitmap, img.sx, img.sy, img.sWidth, img.sHeight, (width - sW) / 2, (height - sH) / 2, sW, sH);
	}

	// 2. Effects & Particles
	particleSystem.updateAndDraw(ctx, currentVolume, settings.effects.bloom);
	drawFastWaveform(ctx, time, width, height, settings, currentVolume);

	// 3. Text
	const activeCueIndex = cues.findIndex(c => time >= c.start && time < c.end);
	if (activeCueIndex !== -1) {
		lastActiveCue = cues[activeCueIndex];
	}
	if (lastActiveCue) {
		if (lastActiveCue.words && lastActiveCue.words.length > 0) {
			const currentTime = activeCueIndex !== -1 ? time : -1;
			drawKaraokeText(ctx, canvas, lastActiveCue, currentTime, settings, particleSystem, activeCueIndex);
		} else {
			drawSimpleText(ctx, canvas, lastActiveCue, settings);
		}
	}

	// 4. Post-Processing
	drawFastGrain(ctx, width, height, settings.effects.grain);
}

// --- PARTICLE SYSTEM with OPTIMIZED INTENSE BURSTS ---
class ParticleSystem {
	constructor(settings, resolution) {
		this.settings = settings;
		this.width = resolution.width;
		this.height = resolution.height;
		this.sizeScalar = Math.max(1.0, this.height / 720) * 1.5;
		this.particles = settings.density > 0 && settings.chars.length > 0 ? Array.from({
			length: settings.density
		}, () => this.createParticle({})) : [];
		this.burstParticles = [];
		this.debrisChars = [...DEBRIS_CHARS, ...settings.chars];
	}
	triggerBurst(x, y) {
		// B"H - Fewer particles, higher impact for performance
		for (let i = 0; i < 25; i++) {
			this.burstParticles.push(this.createBurstParticle({}, x, y));
		}
	}
	createBurstParticle(p, x, y) {
		p.x = x;
		p.y = y;
		const angle = Math.random() * Math.PI * 2;
		// B"H - Much higher velocity for a bigger "pop"
		const speed = 5 + Math.random() * 10;
		p.vx = Math.cos(angle) * speed;
		p.vy = Math.sin(angle) * speed;
		// B"H - Shorter lifespan for faster clearing
		p.life = 15 + Math.random() * 10;
		p.size = (this.settings.baseSize * 0.6) + Math.random() * 6;
		p.char = this.debrisChars[Math.floor(Math.random() * this.debrisChars.length)];
		p.hue = Math.random() * 360;
		return p;
	}
	createParticle(p = {}, options = {}) {
		const {
			isSubParticle = false, x, y
		} = options;
		const baseSpeed = this.settings.speed || 3,
			speedVar = this.settings.speedVariation || 2;
		p.x = x !== undefined ? x : Math.random() * this.width;
		p.y = y !== undefined ? y : this.height + Math.random() * 20;
		p.avx = 0;
		p.avy = 0;
		if (isSubParticle) {
			const angle = Math.random() * Math.PI * 2,
				speed = (baseSpeed * 0.8) + Math.random() * (speedVar * 1.2);
			p.vx = Math.cos(angle) * speed;
			p.vy = Math.sin(angle) * speed;
			p.life = 60;
		} else {
			const randSpeed = baseSpeed + (Math.random() - 0.5) * speedVar;
			p.vx = (Math.random() - 0.5) * randSpeed * 0.5;
			p.vy = -(randSpeed * (Math.random() * 0.5 + 0.75));
			p.life = Infinity;
		}
		const baseSize = Math.max(5, (this.settings.baseSize || 20) + (Math.random() - 0.5) * (this.settings.variation || 15));
		p.size = baseSize * this.sizeScalar * (isSubParticle ? 0.6 : 1);
		p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
		p.hue = Math.random() * 360;
		p.opacity = 0.6 + Math.random() * 0.4;
		return p;
	}
	updateAndDraw(ctx, volume, bloom) {
		const force = (volume ** 2) * 2.5,
			damp = 0.92,
			boomChance = 0.001 + (volume * 0.015);
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			if (p.life !== Infinity) p.life--;
			if (p.life <= 0) {
				this.particles.splice(i, 1);
				continue;
			}
			if (p.life === Infinity && Math.random() < boomChance) {
				for (let j = 0; j < 7; j++) this.particles.push(this.createParticle({}, {
					isSubParticle: true,
					x: p.x,
					y: p.y
				}));
				this.createParticle(p);
				continue;
			}
			if (force > 0.1) {
				p.avx += (Math.random() - 0.5) * force;
				p.avy += (Math.random() - 0.5) * force;
			}
			p.avx *= damp;
			p.avy *= damp;
			p.x += p.vx + p.avx;
			p.y += p.vy + p.avy;
			if (p.life === Infinity && p.y < -p.size) this.createParticle(p);
			const opacity = (p.life < 30) ? p.opacity * (p.life / 30) : p.opacity,
				font = `${p.size}px ${EMOJI_FALLBACK_FONT}`,
				color = `hsla(${p.hue}, 90%, 75%, ${opacity})`;
			if (bloom > 0) {
				ctx.font = `${p.size * (1 + bloom * 0.1)}px ${EMOJI_FALLBACK_FONT}`;
				ctx.fillStyle = `hsla(${p.hue}, 95%, 85%, ${opacity * 0.2})`;
				ctx.fillText(p.char, p.x, p.y);
			}
			ctx.font = font;
			ctx.fillStyle = color;
			ctx.fillText(p.char, p.x, p.y);
		}
		for (let i = this.burstParticles.length - 1; i >= 0; i--) {
			const p = this.burstParticles[i];
			p.life--;
			if (p.life <= 0) {
				this.burstParticles.splice(i, 1);
				continue;
			}
			// B"H - Add drag for more natural explosion physics
			p.vx *= 0.97;
			p.vy *= 0.97;
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.1;
			const opacity = (p.life / 25);
			ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${opacity})`;
			ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
			ctx.fillText(p.char, p.x, p.y);
		}
	}
}

// --- TEXT RENDERING LOGIC ---
function drawSimpleText(ctx, canvas, cue, settings) {
	const {
		width,
		height
	} = canvas;
	const boxSize = width * 0.9;
	const {
		boxColor,
		boxOpacity,
		font
	} = settings;
	const [r, g, b] = [parseInt(boxColor.substr(1, 2), 16), parseInt(boxColor.substr(3, 2), 16), parseInt(boxColor.substr(5, 2), 16)];
	ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
	ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
	wrapText(ctx, cue.text, width / 2, height / 2, boxSize, boxSize, font, height / 720);
}

function drawKaraokeText(ctx, canvas, cue, time, settings, particleSystem, activeCueIndex) {
	const {
		width,
		height
	} = canvas;
	const {
		font
	} = settings;
	const scaleFactor = height / 720;
	const scaledFontSize = font.size * scaleFactor;
	const lineHeight = 1.4 * scaledFontSize;

	const layout = wrapText(ctx, cue.text, width / 2, height / 2, width * 0.9, height, font, scaleFactor, true);
	const activeWordIndex = cue.words.findIndex(w => time >= w.start && time < w.end);

	if ((activeWordIndex !== lastActiveWordIndex || activeCueIndex !== lastActiveCueIndex) && activeWordIndex !== -1) {
		const wordInfo = layout.wordLayout[activeWordIndex];
		if (wordInfo) {
			const wordCenterX = wordInfo.x + wordInfo.width / 2;
			const wordCenterY = wordInfo.y; // Already vertically centered
			particleSystem.triggerBurst(wordCenterX, wordCenterY);
		}
	}
	lastActiveWordIndex = activeWordIndex;
	lastActiveCueIndex = activeCueIndex;

	// B"H - THE FIX FOR THE "DOUBLED WORD" and CENTERING BUG
	// 1. Draw the highlight shape FIRST
	if (activeWordIndex !== -1) {
		const wordInfo = layout.wordLayout[activeWordIndex];
		if (wordInfo) {
			ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
			// Draw the highlight perfectly centered around the word's y-position
			ctx.fillRect(wordInfo.x - 5, wordInfo.y - lineHeight / 2, wordInfo.width + 10, lineHeight);
		}
	}
	// 2. Draw ALL the text on top
	layout.lines.forEach(line => {
		if (font.borderWidth > 0) {
			ctx.strokeStyle = font.borderColor;
			ctx.lineWidth = font.borderWidth * scaleFactor;
			ctx.strokeText(line.text, line.x, line.y);
		}
		ctx.fillStyle = font.color;
		ctx.fillText(line.text, line.x, line.y);
	});
}

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor, getLayout = false) {
	let scaledFontSize = fontSettings.size * scaleFactor;
	while (scaledFontSize > 5) {
		ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
		const tempLines = getWrappedLines(ctx, text, maxWidth * 0.95);
		if (tempLines.length * scaledFontSize * 1.4 < maxHeight * 0.95) break;
		scaledFontSize -= 2;
	}

	ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
	// B"H - CRITICAL FIX for highlight centering
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';

	const words = text.split(/\s+/);
	const lines = [];
	const wordLayout = [];
	let currentLine = '';
	for (let i = 0; i < words.length; i++) {
		const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
		if (ctx.measureText(testLine).width > maxWidth && i > 0) {
			lines.push({
				text: currentLine,
				x: 0,
				y: 0
			});
			currentLine = words[i];
		} else {
			currentLine = testLine;
		}
	}
	lines.push({
		text: currentLine,
		x: 0,
		y: 0
	});

	const lineHeight = 1.4 * scaledFontSize;
	const totalHeight = lines.length * lineHeight;
	// B"H - Adjust startY for 'middle' baseline
	const startY = y - totalHeight / 2 + lineHeight / 2;
	let wordCounter = 0;

	lines.forEach((line, i) => {
		const lineY = startY + i * lineHeight;
		let lineX;
		switch (fontSettings.align) {
			case 'right':
				lineX = x + (maxWidth / 2) - ctx.measureText(line.text).width;
				break;
			case 'left':
				lineX = x - (maxWidth / 2);
				break;
			default:
				lineX = x - ctx.measureText(line.text).width / 2;
		}
		line.x = lineX;
		line.y = lineY;
		const lineWords = line.text.split(' ');
		let currentWordX = lineX;
		for (let j = 0; j < lineWords.length; j++) {
			const word = lineWords[j];
			const wordWidth = ctx.measureText(word).width;
			wordLayout[wordCounter] = {
				x: currentWordX,
				y: lineY,
				width: wordWidth
			};
			currentWordX += wordWidth + ctx.measureText(' ').width;
			wordCounter++;
		}
	});

	if (getLayout) {
		return {
			lines,
			wordLayout
		};
	} else {
		lines.forEach(line => {
			if (fontSettings.borderWidth > 0) {
				ctx.strokeStyle = fontSettings.borderColor;
				ctx.lineWidth = fontSettings.borderWidth * scaleFactor;
				ctx.strokeText(line.text, line.x, line.y);
			}
			ctx.fillStyle = fontSettings.color;
			ctx.fillText(line.text, line.x, line.y);
		});
	}
}

// --- UTILITIES & HELPERS ---
function getWrappedLines(ctx, text, maxWidth) {
	const lines = text.split("\n");
	let all = [];
	lines.forEach(line => {
		let cL = "",
			w = line.split(" ");
		for (let i = 0; i < w.length; i++) {
			let tL = cL + (cL ? " " : "") + w[i];
			if (ctx.measureText(tL).width > maxWidth && i > 0) {
				all.push(cL);
				cL = w[i];
			} else {
				cL = tL;
			}
		}
		all.push(cL);
	});
	return all;
}

function calculateImageFit(img, tW, tH) {
	const iR = img.width / img.height,
		tR = tW / tH;
	let sW, sH, sx, sy;
	if (iR > tR) {
		sH = img.height;
		sW = sH * tR;
		sx = (img.width - sW) / 2;
		sy = 0;
	} else {
		sW = img.width;
		sH = sW / tR;
		sx = 0;
		sy = (img.height - sH) / 2;
	}
	return {
		bitmap: img,
		sx,
		sy,
		sWidth: sW,
		sHeight: sH,
		drawWidth: tW,
		drawHeight: tH
	};
}

function preAnalyzeAudio(shim, totalFrames) {
	const data = shim.channels[0];
	if (!data || data.length === 0) return new Array(totalFrames).fill(.01);
	const levels = [];
	const spf = Math.floor(data.length / totalFrames);
	for (let i = 0; i < totalFrames; i++) {
		let rms = 0;
		const start = i * spf;
		for (let j = 0; j < spf; j++) rms += (data[start + j] || 0) ** 2;
		const vol = Math.sqrt(rms / spf);
		levels.push(isNaN(vol) ? .01 : Math.max(.01, vol))
	}
	return levels
}

function drawFastWaveform(ctx, time, w, h, settings, vol) {
	const {
		waveformHeight,
		waveformThickness
	} = settings;
	if (waveformHeight <= 0) return;
	const maxAmp = h * (waveformHeight / 100),
		amp = maxAmp * vol ** 1.5,
		baseY = h * .85 + Math.sin(time * .7) * (h * .015);
	const p = new Path2D();
	for (let x = 0; x <= w; x += 15) {
		const yOff = (Math.sin(x * .01 + time * 4) * .5 + Math.sin(x * .03 + time * 9) * .3) * amp;
		x === 0 ? p.moveTo(x, baseY + yOff) : p.lineTo(x, baseY + yOff);
	}
	const cI = 200 + Math.floor(vol * 55),
		gC = `rgba(${cI - 50}, ${cI - 20}, 255, ${.3 * vol})`,
		mC = `rgba(${cI}, ${cI}, 255, ${.6 * vol + .2})`;
	ctx.strokeStyle = gC;
	ctx.lineWidth = waveformThickness * 5;
	ctx.stroke(p);
	ctx.lineWidth = waveformThickness * 2;
	ctx.stroke(p);
	ctx.strokeStyle = mC;
	ctx.lineWidth = waveformThickness;
	ctx.stroke(p);
}

function drawFastGrain(ctx, w, h, intensity) {
	if (intensity <= 0) return;
	const num = (w * h / 1000) * (intensity / 50);
	ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
	for (let i = 0; i < num; i++) {
		ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
	}
}
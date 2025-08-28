/*
ב"ה
B"H
*/

// --- Worker Setup ---

// *** ADD THIS CODE BLOCK ***

// Polyfill AudioBuffer for the Worker scope.
// This fake class will satisfy the library's "instanceof AudioBuffer" check.
// *** REPLACE WITH THIS ROBUST POLYFILL ***
self.AudioBuffer = function(options) {
	/* ב"ה B"H */
	// This is a polyfill that mimics the real AudioBuffer interface
	// enough for the mediabunny library to work.
	Object.assign(this, options); // Copies sampleRate, duration, channels array, etc.

	this.getChannelData = function(channelIndex) {
		/* ב"ה B"H */
		return this.channels[channelIndex];
	};

	this.copyFromChannel = function(destination, channelNumber, startInChannel = 0) {
		/* ב"ה B"H */
		// This is the critical function the library needs.
		const source = this.channels[channelNumber];
		if (!source) return;

		// Create a view of the source data starting from the specified offset.
		// The slice to copy is limited by the destination's length.
		const sourceSlice = source.subarray(startInChannel, startInChannel + destination.length);

		// Copy the data from our source channel into the destination array the library provides.
		destination.set(sourceSlice);
	};
};

// 1. Create the 'exports' object in the worker's global scope.
self.exports = {};

// 2. Load the library. It will populate self.exports.
try {
	importScripts('mediabunny-library.js');
} catch (e) {
	console.error("Failed to import mediabunny library", e);
	// Send a fatal error back to the main thread
	self.postMessage({
		type: 'FATAL_ERROR',
		payload: {
			message: "Could not load mediabunny-library.js. Is the file in the same directory?"
		}
	});
}


// 3. Assign the populated object to a convenient local constant.
const mediabunny = self.exports;

// --- Global Worker State ---
let einSofRenderer = {}; // All rendering functions will be attached to this.
const MIN_SEGMENT_DURATION = 1e-6; // Minimum time for a segment to be valid

// --- Main Message Handler ---
self.onmessage = async (event) => {
	/*
	ב"ה
	B"H
	*/
	try {
		const {
			type,
			payload
		} = event.data;

		if (type === 'START_RENDER') {
			await handleRender(payload);
		} else if (type === 'GENERATE_PREVIEW') {
			await handlePreview(payload);
		}
	} catch (error) {
		console.error("Error during worker execution:", error);
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: {
				message: error.message,
				stack: error.stack
			}
		});
	}
};

// --- Core Worker Functions ---

// REPLACE your entire existing `async function handleRender(payload) { ... }`
async function handleRender(payload) {
    /* ב"ה B"H */
    const {
        mode, // This will be 'video' or 'imageBatch'
        settings,
        resolution,
        captionData,
        portalBitmaps,
        plainAudioBuffer,
        isDynamic,
        fps,
        enableImageDownload // New payload parameter
    } = payload;

    if (mode === 'video') {
        await generateVideo({
            settings,
            resolution,
            captionData,
            portalBitmaps,
            plainAudioBuffer,
            isDynamic,
            fps,
            enableImageDownload
        });
    } else if (mode === 'imageBatch') { // Handle the new mode for image batch
        await generateImageBatch({
            settings,
            resolution,
            captionData,
            portalBitmaps,
            enableImageDownload
        });
    } else {
        // This handles a single 'image' render mode if image batch download is NOT enabled.
        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Generating single image...' } });
        const canvas = new OffscreenCanvas(resolution.width, resolution.height);
        const ctx = canvas.getContext('2d');

        // Get the first primary caption, or a placeholder if none
        const primaryCaption = captionData.primary.length > 0 ? captionData.primary[0].text : 'No Caption';
        const translationCaption = captionData.translation.length > 0 ? captionData.translation[0].text : null;

        const { canvas: bgCanvas } = einSofRenderer.generateBackgroundCanvas(einSofRenderer.resolveSettings(settings), resolution, portalBitmaps);
        const cachedOverlays = await cacheAllOverlays(captionData, settings, resolution); // Cache overlays for single image

        // Render the frame with the first caption
        einSofRenderer.renderCompositeFrame(
            ctx,
            bgCanvas,
            { text: primaryCaption }, // Pass an object to match `primaryCap` structure expected by `renderCompositeFrame` for `primaryCap.text`
            translationCaption ? { text: translationCaption } : null, // Same for translation
            settings,
            resolution,
            [], // palette (if needed, pass it)
            cachedOverlays // Pass the cached overlays here
        );

        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const filename = `BH_${Date.now()}_single_image.png`;
        self.postMessage({ type: 'IMAGE_COMPLETE', payload: { blob, filename } });
        self.postMessage({ type: 'BATCH_COMPLETE' }); // Treat single image as a batch of one
    }
}



async function handlePreview(payload) {
	/*
	ב"ה
	B"H
	*/
	const {
		settings,
		resolution,
		primaryCaption,
		portalBitmaps
	} = payload;
	const canvas = new OffscreenCanvas(resolution.width, resolution.height);
	const ctx = canvas.getContext('2d');

	const {
		canvas: bgCanvas
	} = einSofRenderer.generateBackgroundCanvas(settings, resolution, portalBitmaps);
	einSofRenderer.renderOverlays(ctx, bgCanvas, primaryCaption, null, settings.headerText, settings, resolution, []);

	const bitmap = canvas.transferToImageBitmap();
	self.postMessage({
		type: 'PREVIEW_READY',
		payload: {
			bitmap
		}
	}, [bitmap]);
}

// --- Video Generation Logic ---
async function generateVideo({
	settings,
	resolution,
	captionData,
	portalBitmaps,
	plainAudioBuffer,
	isDynamic,
	fps
}) {
	/*
	ב"ה
	B"H
	*/
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Initializing video encoder...'
		}
	});

	// 1. Prepare Timeline and Caches
	const {
		timeEvents,
		lastTime
	} = createTimeEvents(captionData, plainAudioBuffer);
	if (lastTime === 0) {
		throw new Error("No valid timeline. Check caption data.");
	}

	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Caching caption overlays...'
		}
	});
	const cachedOverlays = await cacheAllOverlays(captionData, settings, resolution);

	// 2. Setup Encoder
	const output = new mediabunny.Output({
		format: new mediabunny.Mp4OutputFormat(),
		target: new mediabunny.BufferTarget()
	});
	const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	const ctx = renderCanvas.getContext('2d', {
		alpha: false
	});

	let videoCodec = 'avc1.42001E'; // A safe default
	try {
		videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), {
			width: resolution.width,
			height: resolution.height
		});
	} catch (e) {
		console.warn("Codec check failed, using default.");
	}

	const canvasSource = new mediabunny.CanvasSource(renderCanvas, {
		codec: videoCodec,
		bitrate: mediabunny.QUALITY_HIGH
	});
	output.addVideoTrack(canvasSource);
    
    // *** THE FIX STARTS HERE ***
	// *** REPLACE WITH THIS CODE BLOCK ***

let audioBufferSource = null;
let audioBufferShim = null;
if (plainAudioBuffer) {
    // Instantiate our new fake AudioBuffer class
    audioBufferShim = new AudioBuffer({
        ...plainAudioBuffer,
        getChannelData: (channelIndex) => plainAudioBuffer.channels[channelIndex]
    });
    const audioCodec = await mediabunny.getFirstEncodableAudioCodec(output.format.getSupportedAudioCodecs(), audioBufferShim);
    audioBufferSource = new mediabunny.AudioBufferSource({
        codec: audioCodec,
        bitrate: 128_000
    });
    output.addAudioTrack(audioBufferSource);
}
    // *** THE FIX ENDS HERE (PART 1) ***

	await output.start();

	// 3. Render Loop
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Generating master background...'
		}
	});
	const masterBg = isDynamic ? null : einSofRenderer.generateBackgroundCanvas(resolveSettings(settings), resolution, portalBitmaps).canvas;

	for (let i = 0; i < timeEvents.length - 1; i++) {
		const segmentStartTime = timeEvents[i];
		const segmentEndTime = timeEvents[i + 1];
		const segmentDuration = segmentEndTime - segmentStartTime;
		if (segmentDuration < MIN_SEGMENT_DURATION) continue;

		self.postMessage({
			type: 'STATUS_UPDATE',
			payload: {
				message: `Rendering segment ${i + 1}/${timeEvents.length - 1}`
			}
		});
		self.postMessage({
			type: 'PROGRESS_UPDATE',
			payload: {
				percent: (segmentStartTime / lastTime) * 90
			}
		});

		const primaryCap = findCaptionActiveAt(segmentStartTime, captionData.primary);
		const translationCap = findCaptionActiveAt(segmentStartTime, captionData.translation);

		const currentSettings = resolveSettings(settings);

		if (isDynamic) {
			const framesInSegment = Math.max(1, Math.round(segmentDuration * fps));
			const frameDuration = segmentDuration / framesInSegment;
			for (let frameIndex = 0; frameIndex < framesInSegment; frameIndex++) {
				const frameTime = segmentStartTime + (frameIndex * frameDuration);
				const dynamicBg = einSofRenderer.generateBackgroundCanvas(resolveSettings(settings, false), resolution, portalBitmaps).canvas;
				renderCompositeFrame(ctx, dynamicBg, primaryCap, translationCap, currentSettings, resolution, cachedOverlays);
				await canvasSource.add(frameTime, frameDuration);
			}
		} else {
			const bgToUse = settings.regenerateBgToggle ? einSofRenderer.generateBackgroundCanvas(currentSettings, resolution, portalBitmaps).canvas : masterBg;
			renderCompositeFrame(ctx, bgToUse, primaryCap, translationCap, currentSettings, resolution, cachedOverlays);
			await canvasSource.add(segmentStartTime, segmentDuration);
		}
	}

	// 4. Finalize
	canvasSource.close();
    
    // *** THE FIX STARTS HERE (PART 2) ***
	// *** REPLACE WITH THIS CORRECT CODE ***
if (audioBufferSource) {
    self.postMessage({
        type: 'STATUS_UPDATE',
        payload: {
            message: 'Encoding audio...'
        }
    });
    // The library's add() method expects the AudioBuffer shim we already created.
    await audioBufferSource.add(audioBufferShim);
    audioBufferSource.close();
}
    // *** THE FIX ENDS HERE (PART 2) ***

	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Finalizing video file...'
		}
	});
	self.postMessage({
		type: 'PROGRESS_UPDATE',
		payload: {
			percent: 98
		}
	});
	await output.finalize();

	self.postMessage({
		type: 'PROGRESS_UPDATE',
		payload: {
			percent: 100
		}
	});
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob: new Blob([output.target.buffer], {
				type: output.format.mimeType
			})
		}
	});
}


// REPLACE your entire existing `function renderCompositeFrame(...) { ... }`
function renderCompositeFrame(ctx, bgCanvas, primaryCap, translationCap, settings, resolution, cache) {
    /* ב"ה B"H */
    ctx.drawImage(bgCanvas, 0, 0);
    einSofRenderer.renderFrameHeader(ctx, settings.headerText, settings, resolution);

    // Pass the actual caption text strings and the cache
    einSofRenderer.renderText(
        ctx,
        primaryCap ? primaryCap.text : '',
        translationCap ? translationCap.text : '',
        settings,
        resolution,
        [], // Empty array for palette, as renderText now handles palette in the overlay canvas (or pass actual palette if needed for border)
        cache // Pass the cached overlays here
    );

    einSofRenderer.renderCornerText(ctx, settings, resolution);
}

// --- Image Batch Generation ---
// REPLACE your entire existing `async function generateImageBatch(...) { ... }`
async function generateImageBatch({ settings, resolution, captionData, portalBitmaps, enableImageDownload }) {
    /* ב"ה B"H */
    if (!enableImageDownload) {
        throw new Error("Image batch generation called without 'enableImageDownload' being true. This should not happen.");
    }

    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Starting image batch generation...' } });

    const primaryCaptions = captionData.primary;
    if (primaryCaptions.length === 0) {
        throw new Error("No primary captions found for image batch generation.");
    }

    const masterBg = settings.dynamicBackgroundToggle ? null : einSofRenderer.generateBackgroundCanvas(einSofRenderer.resolveSettings(settings), resolution, portalBitmaps).canvas;
    const hasDual = captionData.translation.length > 0;
    const cachedOverlays = await cacheAllOverlays(captionData, settings, resolution);

    for (let i = 0; i < primaryCaptions.length; i++) {
        const primaryCap = primaryCaptions[i];
        const translationCap = findCaptionActiveAt(primaryCap.startTime, captionData.translation);

        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Generating image ${i + 1}/${primaryCaptions.length}` } });
        self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: (i / primaryCaptions.length) * 99 } });

        const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
        const ctx = renderCanvas.getContext('2d', { alpha: false });

        const currentSettings = einSofRenderer.resolveSettings(settings);
        const bgToUse = settings.regenerateBgToggle ? einSofRenderer.generateBackgroundCanvas(currentSettings, resolution, portalBitmaps).canvas : masterBg;

        einSofRenderer.renderCompositeFrame(
            ctx,
            bgToUse,
            { text: primaryCap.text },
            translationCap ? { text: translationCap.text } : null,
            currentSettings,
            resolution,
            [],
            cachedOverlays
        );

        const timestamp = Date.now();
        const captionExcerpt = primaryCap.text.substring(0, 50).replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');
        const filename = `BH_${timestamp}_${captionExcerpt || 'caption'}.png`;

        const blob = await renderCanvas.convertToBlob({ type: 'image/png' });

        self.postMessage({ type: 'IMAGE_COMPLETE', payload: { blob, filename } });
    }

    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Image batch generation complete.' } });
    self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 100 } });
    self.postMessage({ type: 'BATCH_COMPLETE' });
}

// --- Helper Functions ---

function createTimeEvents(captionData, plainAudioBuffer) {
	/*
	ב"ה
	B"H
	*/
	const timeSet = new Set([0]);
	[...captionData.primary, ...captionData.translation].forEach(cap => {
		timeSet.add(cap.startTime);
		timeSet.add(cap.endTime);
	});

	let lastTime = 0;
	if (timeSet.size > 1) {
		lastTime = Math.max(...Array.from(timeSet));
	}
	if (plainAudioBuffer && plainAudioBuffer.duration > lastTime) {
		lastTime = plainAudioBuffer.duration;
		timeSet.add(lastTime);
	}

	const timeEvents = Array.from(timeSet).sort((a, b) => a - b);

	// Deduplicate and filter out invalid values
	return {
		timeEvents: timeEvents.filter((t, i) => i === 0 || t > timeEvents[i - 1] + MIN_SEGMENT_DURATION),
		lastTime
	};
}

function findCaptionActiveAt(time, captions) {
	/*
	ב"ה
	B"H
	*/
	// A caption is active if time is within [startTime, endTime).
	return captions.find(c => time >= c.startTime && time < c.endTime);
}



// ATTACH this function to the einSofRenderer object
einSofRenderer.getLayoutBoxes = function(settings, resolution, hasDualCaptions) {
	/*
	ב"ה
	B"H
	*/
	const isHorizontalLayout = hasDualCaptions && (resolution.width > resolution.height);
	const boxWidthPercent = settings.textBoxWidth / 100;
	const boxHeightPercent = settings.textBoxHeight / 100;
	const gap = settings.textBoxGap;
	let primaryBox, secondaryBox;
	if (hasDualCaptions) {
		if (isHorizontalLayout) { // Side-by-side
			const totalWidth = resolution.width * boxWidthPercent;
			const boxWidth = (totalWidth - gap) / 2;
			const boxHeight = resolution.height * boxHeightPercent;
			const y = (resolution.height - boxHeight) / 2;
			const x1 = (resolution.width - totalWidth) / 2;
			const x2 = x1 + boxWidth + gap;
			primaryBox = {
				x: x1,
				y: y,
				width: boxWidth,
				height: boxHeight
			};
			secondaryBox = {
				x: x2,
				y: y,
				width: boxWidth,
				height: boxHeight
			};
		} else { // Top-and-bottom
			const totalHeight = resolution.height * boxHeightPercent;
			const boxHeight = (totalHeight - gap) / 2;
			const boxWidth = resolution.width * boxWidthPercent;
			const x = (resolution.width - boxWidth) / 2;
			const y1 = (resolution.height - totalHeight) / 2;
			const y2 = y1 + boxHeight + gap;
			primaryBox = {
				x: x,
				y: y1,
				width: boxWidth,
				height: boxHeight
			};
			secondaryBox = {
				x: x,
				y: y2,
				width: boxWidth,
				height: boxHeight
			};
		}
	} else { // Single box
		const boxWidth = resolution.width * boxWidthPercent;
		const boxHeight = resolution.height * boxHeightPercent;
		const x = (resolution.width - boxWidth) / 2;
		const y = (resolution.height - boxHeight) / 2;
		primaryBox = {
			x: x,
			y: y,
			width: boxWidth,
			height: boxHeight
		};
	}
	return {
		primaryBox,
		secondaryBox
	};
};


// REPLACE your entire existing `async function cacheAllOverlays(...) { ... }`
async function cacheAllOverlays(captionData, settings, resolution) {
    /* ב"ה B"H */
    const uniqueTexts = new Set([...captionData.primary.map(c => c.text), ...captionData.translation.map(c => c.text)]);
    const cache = new Map();
    const hasDual = captionData.translation.length > 0;

    for (const text of uniqueTexts) {
        const resolvedSettings = einSofRenderer.resolveSettings(settings);
        const boxes = einSofRenderer.getLayoutBoxes(resolvedSettings, resolution, hasDual);

        const primaryOverlayCanvas = einSofRenderer.renderSingleOverlayCanvas(text, boxes.primaryBox, resolvedSettings, resolution);
        const secondaryOverlayCanvas = hasDual ? einSofRenderer.renderSingleOverlayCanvas(text, boxes.secondaryBox, resolvedSettings, resolution) : null;

        cache.set(text, {
            primary: primaryOverlayCanvas,
            secondary: secondaryOverlayCanvas,
            primaryBox: boxes.primaryBox,
            secondaryBox: boxes.secondaryBox
        });
    }
    return cache;
}



// --- RENDERER ENGINE (Copied from HTML) ---
// This entire object contains the graphics functions. It has no dependency on the DOM.
einSofRenderer.generateBackgroundCanvas = function(settings, resolution, portalBitmaps) {
	/* ב"ה B"H */
	const backgroundCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	const ctx = backgroundCanvas.getContext('2d');
	const palette = this.generateCohesivePalette(6, settings.basePaletteColor);
	const baseLayer = new OffscreenCanvas(resolution.width, resolution.height);
	const baseCtx = baseLayer.getContext('2d');
	const glowLayer = new OffscreenCanvas(resolution.width, resolution.height);
	const glowCtx = glowLayer.getContext('2d');
	const universe = this.generateUniqueUniverse(settings, resolution, palette);
	this.renderBackground(baseCtx, settings, resolution, palette);
	const portalNodes = this.renderPortals(baseCtx, settings, resolution, portalBitmaps);
	this.renderParticles(baseCtx, glowCtx, universe.particles);
	const allNodes = [...universe.particles, ...portalNodes];
	this.renderNetwork(baseCtx, glowCtx, allNodes, settings);
	this.applyBloom(baseCtx, glowLayer, settings);
	this.applyFrameEffects(baseCtx, settings, resolution, palette);
	ctx.drawImage(baseLayer, 0, 0);
	return {
		canvas: backgroundCanvas,
		palette: palette
	};
};
einSofRenderer.renderOverlays = function(ctx, backgroundCanvas, primaryCaption, secondaryCaption, header, settings, resolution, palette) {
	/* ב"ה B"H */
	ctx.drawImage(backgroundCanvas, 0, 0);
	this.renderFrameHeader(ctx, header, settings, resolution);
	this.renderText(ctx, primaryCaption, secondaryCaption, settings, resolution, palette);
	this.renderCornerText(ctx, settings, resolution);
}
einSofRenderer.renderBackground = function(ctx, settings, resolution, palette) {
	/* ב"ה B"H */
	const bgGrad = ctx.createLinearGradient(0, 0, 0, resolution.height);
	bgGrad.addColorStop(0, '#0A0814');
	bgGrad.addColorStop(1, '#000000');
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, resolution.width, resolution.height);
	ctx.globalCompositeOperation = 'source-over';
	for (let i = 0; i < 4; i++) {
		const dustX = resolution.width * Math.random();
		const dustY = resolution.height * Math.random();
		const dustRadius = resolution.width * this.random(0.4, 0.8);
		const dustGrad = ctx.createRadialGradient(dustX, dustY, 0, dustX, dustY, dustRadius);
		dustGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
		dustGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
		ctx.fillStyle = dustGrad;
		ctx.fillRect(0, 0, resolution.width, resolution.height);
	}
	for (let i = 0; i < 1500; i++) {
		ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
		ctx.fillRect(Math.random() * resolution.width, Math.random() * resolution.height, 1, 1);
	}
	for (let i = 0; i < 100; i++) {
		ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
		ctx.fillRect(Math.random() * resolution.width, Math.random() * resolution.height, 2, 2);
	}
	ctx.globalCompositeOperation = 'lighter';
	const coreX = resolution.width * (Math.random() < 0.5 ? -0.2 : 1.2);
	const coreY = resolution.height * Math.random();
	const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, resolution.width * 1.5);
	coreGrad.addColorStop(0, this.hexToRgba(palette[0], 0.1));
	coreGrad.addColorStop(1, this.hexToRgba(palette[0], 0));
	ctx.fillStyle = coreGrad;
	ctx.fillRect(0, 0, resolution.width, resolution.height);
	const createNebula = (x, y, radius, color) => {
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
		gradient.addColorStop(0, this.hexToRgba(color, 0.4));
		gradient.addColorStop(0.5, this.hexToRgba(color, 0.1));
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, resolution.width, resolution.height);
	};
	createNebula(resolution.width * this.random(0.1, 0.9), resolution.height * this.random(0.1, 0.9), resolution.width * this.random(0.5, 0.9), palette[0]);
	createNebula(resolution.width * this.random(0.1, 0.9), resolution.height * this.random(0.1, 0.9), resolution.width * this.random(0.6, 1.0), palette[1]);
	ctx.globalCompositeOperation = 'source-over';
};
einSofRenderer.generateUniqueUniverse = function(settings, resolution, palette) {
	/* ב"ה B"H */
	const particles = [];
	const chars = Array.from(settings.particleChars);
	if (chars.length === 0) {
		chars.push('•');
	}
	const basePalette = [...palette, '#ffffff', '#999999'];
	for (let i = 0; i < settings.particleDensity; i++) {
		const z = Math.random();
		const x = Math.random() * resolution.width;
		const y = Math.random() * resolution.height;
		let color = basePalette[Math.floor(Math.random() * basePalette.length)];
		if (settings.particleColorShift > 0) {
			const rgbColor = this.hexToRgb(color);
			const baseHsl = this.rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
			const hueShift = (x / resolution.width - 0.5) * settings.particleColorShift;
			const newHue = (baseHsl.h * 360 + hueShift + 360) % 360;
			color = this.hslToHex(newHue, baseHsl.s * 100, baseHsl.l * 100);
		}
		particles.push({
			x,
			y,
			z,
			size: (settings.minParticleSize + (settings.maxParticleSize - settings.minParticleSize) * z * z),
			char: chars[Math.floor(Math.random() * chars.length)],
			color
		});
	}
	particles.sort((a, b) => a.z - b.z);
	return {
		particles
	};
};
einSofRenderer.renderParticles = function(ctx, glowCtx, particles) {
	/* ב"ה B"H */
	particles.forEach(p => {
		const opacity = 0.2 + p.z * 0.8;
		if (p.z > 0.8) {
			glowCtx.font = `${p.size}px sans-serif`;
			glowCtx.fillStyle = p.color;
			glowCtx.textAlign = 'center';
			glowCtx.textBaseline = 'middle';
			glowCtx.globalAlpha = opacity * 0.9;
			glowCtx.fillText(p.char, p.x, p.y);
		}
		ctx.globalAlpha = opacity;
		ctx.font = `${p.size}px sans-serif`;
		ctx.fillStyle = p.color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(p.char, p.x, p.y);
	});
	ctx.globalAlpha = 1.0;
};
einSofRenderer.renderNetwork = function(ctx, glowCtx, particles, settings) {
	/* ב"ה B"H */
	if (settings.networkType === 'none') return;
	const connectable = particles.filter(p => p.z > 0.4);
	connectable.forEach(p1 => {
		let neighbors = connectable.filter(p2 => p1 !== p2).sort((a, b) => Math.hypot(p1.x - a.x, p1.y - a.y) - Math.hypot(p1.x - b.x, p1.y - b.y)).slice(0, Math.floor(settings.connectionDensity));
		neighbors.forEach(p2 => {
			if (Math.hypot(p1.x - p2.x, p1.y - p2.y) > 400) return;
			const opacity = Math.min(p1.z, p2.z) * 0.8;
			const color = p1.color || '#ffffff';
			const drawFunc = (targetCtx) => {
				switch (settings.networkType) {
					case 'web':
						this.drawWeb(targetCtx, p1.x, p1.y, p2.x, p2.y, color, opacity);
						break;
					case 'arcs':
						this.drawLightning(targetCtx, p1.x, p1.y, p2.x, p2.y, color, opacity);
						break;
					case 'synapse':
						this.drawSynapse(targetCtx, p1.x, p1.y, p2.x, p2.y, color, opacity);
						break;
				}
			};
			drawFunc(glowCtx);
			drawFunc(ctx);
		});
	});
};
einSofRenderer.applyBloom = function(ctx, glowLayer, settings) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.filter = `blur(${settings.bloomIntensity * 2}px)`;
	ctx.globalAlpha = 0.6;
	ctx.drawImage(glowLayer, 0, 0);
	ctx.filter = `blur(${settings.bloomIntensity * 0.5}px)`;
	ctx.globalAlpha = 1.0;
	ctx.drawImage(glowLayer, 0, 0);
	ctx.restore();
};
einSofRenderer.renderFrameHeader = function(ctx, header, settings, resolution) {
	/* ב"ה B"H */
	if (!header || header.trim() === "") return;
	const padding = resolution.height / 30;
	const headerFontSize = resolution.height / 28;
	const maxAllowedWidth = resolution.width * 0.9;
	const font = `700 ${headerFontSize}px 'Teko', sans-serif`;
	const headerLines = this.wrapText(ctx, header, maxAllowedWidth, font);
	if (headerLines.length > 0) {
		const lineHeight = headerFontSize * 1.2;
		const totalTextHeight = (headerLines.length - 1) * lineHeight + headerFontSize;
		ctx.font = font;
		const actualTextWidth = headerLines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
		const boxWidth = actualTextWidth + padding * 2;
		const boxHeight = totalTextHeight + padding;
		const boxX = (resolution.width - boxWidth) / 2;
		const boxY = padding;
		ctx.fillStyle = 'rgba(16, 16, 24, 0.6)';
		ctx.beginPath();
		ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
		ctx.fill();
		let currentY = boxY + padding / 2;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		headerLines.forEach(line => {
			this.drawTextWithBorder(ctx, line, resolution.width / 2, currentY, headerFontSize, '#FFFFFF', headerFontSize * 0.1);
			currentY += lineHeight;
		});
	}
};



// REPLACE your entire existing `einSofRenderer.renderText = function(...) { ... }`
einSofRenderer.renderText = function(ctx, primaryCaptionText, secondaryCaptionText, settings, resolution, palette, cachedOverlays) {
    /* ב"ה B"H */
    const hasDualCaptions = secondaryCaptionText && secondaryCaptionText.trim() !== '';
    const { primaryBox, secondaryBox } = einSofRenderer.getLayoutBoxes(settings, resolution, hasDualCaptions);

    const renderSingleBoxContent = (text, box, isPrimary) => {
        if (!text || text.trim() === '' || !box) return;

        const cacheEntry = cachedOverlays.get(text);
        if (!cacheEntry) return;

        const overlayCanvas = isPrimary ? cacheEntry.primary : cacheEntry.secondary;
        if (!overlayCanvas) return;

        const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = box;
        const borderRadius = settings.textBoxBorderRadius;

        const snap = ctx.getImageData(boxX, boxY, boxWidth, boxHeight);
        const blurCanvas = new OffscreenCanvas(boxWidth, boxHeight);
        const blurCtx = blurCanvas.getContext('2d', { willReadFrequently: true });
        blurCtx.putImageData(snap, 0, 0);
        blurCtx.filter = 'blur(15px) brightness(0.8)';
        blurCtx.drawImage(blurCanvas, 0, 0);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
        ctx.clip();
        ctx.drawImage(blurCanvas, boxX, boxY);
        ctx.restore();

        ctx.drawImage(overlayCanvas, boxX, boxY, boxWidth, boxHeight);

        const borderGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight);
        borderGrad.addColorStop(0, palette[1]);
        borderGrad.addColorStop(0.5, palette[3]);
        borderGrad.addColorStop(1, palette[0]);

        ctx.save();
        ctx.strokeStyle = palette[2];
        ctx.shadowColor = palette[2];
        ctx.shadowBlur = 25;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    };

    renderSingleBoxContent(primaryCaptionText, primaryBox, true);
    if (hasDualCaptions) renderSingleBoxContent(secondaryCaptionText, secondaryBox, false);
};





einSofRenderer.applyFrameEffects = function(ctx, settings, resolution, palette) {
	/* ב"ה B"H */
	const t = settings.time || Date.now();
	if (settings.quantumDistortion > 0) this.applyDistortion(ctx, settings, resolution, t);
	if (settings.enableFilmGrain) this.applyFilmGrain(ctx, resolution);
	if (settings.enableGodRays) this.drawGodRays(ctx, resolution, palette);
	if (settings.enableLightLeaks) this.applyLightLeaks(ctx, resolution, palette);
	if (settings.enableLensDirt) this.applyLensDirt(ctx, resolution);
	if (settings.enableDustAndScratches) this.applyDustAndScratches(ctx, resolution);
	if (settings.enableLensflare) this.drawLensflare(ctx, resolution, palette);
	if (settings.enableInterference) this.applyInterference(ctx, resolution);
	if (settings.enableScanLines) this.applyScanLines(ctx, resolution);
	if (settings.enableRgbShift) this.applyRgbShift(ctx, resolution);
	if (settings.enableCRTCurvature) this.applyCRTCurvature(ctx, resolution);
	if (settings.enableChromaticAberration) this.applyChromaticAberration(ctx, resolution);
	if (settings.enableVignette) this.applyVignette(ctx, resolution);
};
einSofRenderer.renderCornerText = function(ctx, settings, resolution) {
	/* ב"ה B"H */
	const textCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	const tCtx = textCanvas.getContext('2d');
	tCtx.font = "700 40px 'Teko', sans-serif";
	tCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
	tCtx.textAlign = 'left';
	tCtx.textBaseline = 'top';
	tCtx.fillText('B"H', 35, 35);
	tCtx.textAlign = 'right';
	tCtx.fillText('ב"ה', resolution.width - 35, 35);
	if (settings.enableDataCorruption) {
		for (let i = 0; i < 7; i++) {
			const y = Math.random() * 80;
			const h = this.random(1, 4);
			const xOffset = (Math.random() - 0.5) * 20;
			const slice = tCtx.getImageData(0, y, resolution.width, h);
			tCtx.putImageData(slice, xOffset, y);
		}
	}
	ctx.drawImage(textCanvas, 0, 0);
};
einSofRenderer.applyScanLines = function(ctx, resolution) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'overlay';
	ctx.globalAlpha = 0.15;
	ctx.fillStyle = '#000';
	for (let y = 0; y < resolution.height; y += 4) {
		ctx.fillRect(0, y, resolution.width, 2);
	}
	ctx.restore();
};
einSofRenderer.applyRgbShift = function(ctx, resolution) {
	/* ב"ה B"H */
	const shift = resolution.width * 0.005;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.globalAlpha = 0.8;
	ctx.drawImage(ctx.canvas, shift, 0);
	ctx.globalCompositeOperation = 'difference';
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0, 0, resolution.width, resolution.height);
	ctx.globalCompositeOperation = 'lighter';
	ctx.drawImage(ctx.canvas, -shift, 0);
	ctx.restore();
};
einSofRenderer.applyDustAndScratches = function(ctx, resolution) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'overlay';
	for (let i = 0; i < 20; i++) {
		ctx.beginPath();
		ctx.arc(this.random(0, resolution.width), this.random(0, resolution.height), this.random(1, 4), 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, 255, 255, ${this.random(0.1, 0.6)})`;
		ctx.fill();
	}
	for (let i = 0; i < 5; i++) {
		ctx.beginPath();
		ctx.moveTo(this.random(0, resolution.width), this.random(0, resolution.height));
		ctx.lineTo(this.random(0, resolution.width), this.random(0, resolution.height));
		ctx.strokeStyle = `rgba(255, 255, 255, ${this.random(0.1, 0.3)})`;
		ctx.lineWidth = this.random(0.5, 2);
		ctx.stroke();
	}
	ctx.restore();
};
einSofRenderer.drawGodRays = function(ctx, resolution, palette) {
	/* ב"ה B"H */
	const lightSourceX = resolution.width * (Math.random() < 0.5 ? -0.1 : 1.1);
	const lightSourceY = resolution.height * this.random(-0.1, 0.5);
	const numRays = this.random(20, 40);
	const color = this.hexToRgba(palette[Math.floor(this.random(0, palette.length))], 0.03 + Math.random() * 0.05);
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	for (let i = 0; i < numRays; i++) {
		const angle = this.random(0, Math.PI * 2);
		const rayLength = resolution.width * 1.5;
		const endX = lightSourceX + Math.cos(angle) * rayLength;
		const endY = lightSourceY + Math.sin(angle) * rayLength;
		const spread = this.random(resolution.width * 0.05, resolution.width * 0.2);
		const endX2 = lightSourceX + Math.cos(angle + 0.05) * rayLength + (Math.random() - 0.5) * spread;
		const endY2 = lightSourceY + Math.sin(angle + 0.05) * rayLength + (Math.random() - 0.5) * spread;
		ctx.beginPath();
		ctx.moveTo(lightSourceX, lightSourceY);
		ctx.lineTo(endX, endY);
		ctx.lineTo(endX2, endY2);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	}
	ctx.restore();
};
einSofRenderer.drawLensflare = function(ctx, resolution, palette) {
	/* ב"ה B"H */
	const margin = 0.2;
	const x = this.random(0, resolution.width * (1 - margin * 2)) + resolution.width * margin * (Math.random() < 0.5 ? 0 : 1);
	const y = this.random(0, resolution.height * (1 - margin * 2)) + resolution.height * margin * (Math.random() < 0.5 ? 0 : 1);
	const centerX = resolution.width / 2;
	const centerY = resolution.height / 2;
	const dx = centerX - x;
	const dy = centerY - y;
	const angle = Math.atan2(dy, dx);
	const baseColor = palette[Math.floor(this.random(0, palette.length))];
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	const streakWidth = this.random(resolution.width * 0.5, resolution.width * 1.2);
	const streakHeight = this.random(1, 3);
	const streakGrad = ctx.createLinearGradient(x - streakWidth / 2, y, x + streakWidth / 2, y);
	const streakColor = this.hexToRgba(baseColor, 0.3);
	streakGrad.addColorStop(0, 'rgba(0,0,0,0)');
	streakGrad.addColorStop(0.4, streakColor);
	streakGrad.addColorStop(0.5, this.hexToRgba(baseColor, 0.5));
	streakGrad.addColorStop(0.6, streakColor);
	streakGrad.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = streakGrad;
	ctx.fillRect(x - streakWidth / 2, y - streakHeight / 2, streakWidth, streakHeight);
	const coreSize = this.random(100, 250);
	const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
	coreGrad.addColorStop(0, this.hexToRgba('#FFFFFF', 0.6));
	coreGrad.addColorStop(0.2, this.hexToRgba(baseColor, 0.3));
	coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = coreGrad;
	ctx.fillRect(x - coreSize, y - coreSize, coreSize * 2, coreSize * 2);
	const numGhosts = 7;
	for (let i = 0; i < numGhosts; i++) {
		const step = (i / numGhosts) * 1.5 + this.random(-0.1, 0.1);
		const ghostX = x + dx * step;
		const ghostY = y + dy * step;
		if (ghostX < 0 || ghostX > resolution.width || ghostY < 0 || ghostY > resolution.height) continue;
		const ghostSize = (1 - (step / 2)) * this.random(20, 100);
		const ghostColor = palette[(i + 1) % palette.length];
		const ghostOpacity = 0.2 * (1 - step / 2);
		ctx.globalAlpha = ghostOpacity;
		const ghostGrad = ctx.createRadialGradient(ghostX, ghostY, 0, ghostX, ghostY, ghostSize);
		ghostGrad.addColorStop(0, this.hexToRgba(this.hslToHex((this.rgbToHsl(...Object.values(this.hexToRgb(ghostColor))).h * 360 + 10) % 360, 100, 75), 0.5));
		ghostGrad.addColorStop(0.7, this.hexToRgba(ghostColor, 0.2));
		ghostGrad.addColorStop(1, this.hexToRgba(ghostColor, 0));
		ctx.fillStyle = ghostGrad;
		const sides = Math.floor(this.random(5, 9));
		ctx.beginPath();
		for (let j = 0; j < sides; j++) {
			ctx.lineTo(ghostX + ghostSize * Math.cos(angle + j * Math.PI * 2 / sides), ghostY + ghostSize * Math.sin(angle + j * Math.PI * 2 / sides));
		}
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
};
einSofRenderer.renderPortals = function(ctx, settings, resolution, portalBitmaps) {
	/* ב"ה B"H */
	if (!portalBitmaps || portalBitmaps.length === 0) return [];
	const portalNodes = [];
	const count = Math.min(portalBitmaps.length, settings.portalCount);
	const shuffled = [...portalBitmaps].sort(() => 0.5 - Math.random());
	const blendModes = ['lighter', 'screen', 'overlay', 'normal'];
	for (let i = 0; i < count; i++) {
		const img = shuffled[i];
		const scale = this.random(0.15, 0.4);
		const w = img.width * scale;
		const h = img.height * scale;
		const {
			x,
			y
		} = this.getRandomPortalPosition(resolution, w, h);
		ctx.save();
		ctx.globalAlpha = this.random(0.5, 0.9);
		ctx.globalCompositeOperation = blendModes[Math.floor(Math.random() * blendModes.length)];
		ctx.translate(x + w / 2, y + h / 2);
		ctx.rotate(this.random(0, Math.PI * 2));
		ctx.drawImage(img, -w / 2, -h / 2, w, h);
		ctx.restore();
		portalNodes.push({
			x: x + w / 2,
			y: y + h / 2,
			z: 0.5 + scale,
			color: '#ffffff'
		});
	}
	return portalNodes;
};
einSofRenderer.getRandomPortalPosition = function(resolution, w, h) {
	/* ב"ה B"H */
	const margin = 0.15;
	const side = Math.floor(Math.random() * 4);
	let x, y;
	switch (side) {
		case 0:
			x = this.random(0, resolution.width - w);
			y = this.random(0, resolution.height * margin - h);
			break;
		case 1:
			x = this.random(resolution.width * (1 - margin), resolution.width - w);
			y = this.random(0, resolution.height - h);
			break;
		case 2:
			x = this.random(0, resolution.width - w);
			y = this.random(resolution.height * (1 - margin), resolution.height - h);
			break;
		case 3:
			x = this.random(0, resolution.width * margin - w);
			y = this.random(0, resolution.height - h);
			break;
		default:
			x = 0;
			y = 0;
	}
	return {
		x,
		y
	};
};
einSofRenderer.applyDistortion = function(ctx, settings, resolution, t) {
	/* ב"ה B"H */
	const tempCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	const tempCtx = tempCanvas.getContext('2d');
	tempCtx.drawImage(ctx.canvas, 0, 0);
	const imageData = tempCtx.getImageData(0, 0, resolution.width, resolution.height);
	const pixels = imageData.data;
	const tempPixels = new Uint8ClampedArray(pixels);
	const time = t / 3000;
	const distortion = settings.quantumDistortion;
	for (let y = 0; y < resolution.height; y++) {
		const yOffset = Math.sin(y / 80 + time) * distortion;
		for (let x = 0; x < resolution.width; x++) {
			const xOffset = Math.sin(y / 100 + x / 80 + time) * distortion;
			const srcX = Math.round(x + xOffset);
			const srcY = Math.round(y + yOffset);
			if (srcX >= 0 && srcX < resolution.width && srcY >= 0 && srcY < resolution.height) {
				const dstIdx = (y * resolution.width + x) * 4;
				const srcIdx = (srcY * resolution.width + srcX) * 4;
				pixels[dstIdx] = tempPixels[srcIdx];
				pixels[dstIdx + 1] = tempPixels[srcIdx + 1];
				pixels[dstIdx + 2] = tempPixels[srcIdx + 2];
			}
		}
	}
	ctx.putImageData(imageData, 0, 0);
};
einSofRenderer.applyVignette = function(ctx, resolution) {
	/* ב"ה B"H */
	const g = ctx.createRadialGradient(resolution.width / 2, resolution.height / 2, Math.max(resolution.width, resolution.height) / 3, resolution.width / 2, resolution.height / 2, Math.max(resolution.width, resolution.height));
	g.addColorStop(0, 'rgba(0,0,0,0)');
	g.addColorStop(1, 'rgba(0,0,0,0.7)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, resolution.width, resolution.height);
};
einSofRenderer.applyFilmGrain = function(ctx, resolution) {
	/* ב"ה B"H */
	const iD = ctx.createImageData(resolution.width, resolution.height);
	const d = iD.data;
	for (let i = 0; i < d.length; i += 4) {
		const v = Math.random() * 40;
		d[i] = v;
		d[i + 1] = v;
		d[i + 2] = v;
		d[i + 3] = 20;
	}
	const tC = new OffscreenCanvas(resolution.width, resolution.height);
	tC.getContext('2d').putImageData(iD, 0, 0);
	ctx.save();
	ctx.globalAlpha = 0.5;
	ctx.globalCompositeOperation = 'overlay';
	ctx.drawImage(tC, 0, 0);
	ctx.restore();
};
einSofRenderer.applyLensDirt = function(ctx, resolution) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'overlay';
	ctx.globalAlpha = 0.05;
	for (let i = 0; i < 10; i++) {
		ctx.beginPath();
		ctx.arc(this.random(0, resolution.width), this.random(0, resolution.height), this.random(10, 100), 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255,255,255,0.1)';
		ctx.fill();
	}
	for (let i = 0; i < 15; i++) {
		ctx.beginPath();
		ctx.moveTo(this.random(0, resolution.width), this.random(0, resolution.height));
		ctx.lineTo(this.random(0, resolution.width), this.random(0, resolution.height));
		ctx.strokeStyle = 'rgba(255,255,255,0.2)';
		ctx.lineWidth = this.random(0.5, 1.5);
		ctx.stroke();
	}
	ctx.restore();
};
einSofRenderer.applyInterference = function(ctx, resolution) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'overlay';
	ctx.globalAlpha = 0.08;
	for (let y = 0; y < resolution.height; y += 4) {
		ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
		ctx.fillRect(0, y, resolution.width, 2);
	}
	ctx.restore();
};
einSofRenderer.applyLightLeaks = function(ctx, resolution, palette) {
	/* ב"ה B"H */
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	const numLeaks = this.random(2, 4);
	for (let i = 0; i < numLeaks; i++) {
		const x = this.random(-0.1, 1.1) * resolution.width;
		const y = this.random(-0.1, 1.1) * resolution.height;
		const radius = this.random(0.4, 0.8) * Math.max(resolution.width, resolution.height);
		const color = this.hexToRgba(palette[Math.floor(this.random(0, palette.length))], this.random(0.05, 0.2));
		const colorTransparent = this.hexToRgba(palette[Math.floor(this.random(0, palette.length))], 0);
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, colorTransparent);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, resolution.width, resolution.height);
	}
	ctx.restore();
};
einSofRenderer.applyCRTCurvature = function(ctx, resolution) {
	/* ב"ה B"H */
	const tempCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	const tempCtx = tempCanvas.getContext('2d');
	tempCtx.drawImage(ctx.canvas, 0, 0);
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, resolution.width, resolution.height);
	const strength = 0.04;
	const h = resolution.height;
	for (let y = 0; y < h; y++) {
		const dy = y - h / 2;
		const curve = 1 - (dy / (h / 2)) * (dy / (h / 2));
		const scale = 1 - strength + (strength * curve);
		const newWidth = resolution.width * scale;
		const xOffset = (resolution.width - newWidth) / 2;
		ctx.drawImage(tempCanvas, 0, y, resolution.width, 1, xOffset, y, newWidth, 1);
	}
};
einSofRenderer.applyChromaticAberration = function(ctx, resolution) {
	/* ב"ה B"H */
	const imageData = ctx.getImageData(0, 0, resolution.width, resolution.height);
	const data = imageData.data;
	const temp = new Uint8ClampedArray(data);
	const amount = 3;
	for (let i = 0; i < data.length; i += 4) {
		const rIndex = i - (amount * 4);
		if (rIndex >= 0) {
			data[i] = temp[rIndex];
		}
		const bIndex = i + (amount * 4);
		if (bIndex < data.length) {
			data[i + 2] = temp[bIndex + 2];
		}
	}
	ctx.putImageData(imageData, 0, 0);
};
einSofRenderer.generateCohesivePalette = function(numColors, baseHex) {
	/* ב"ה B"H */
	const baseRgb = this.hexToRgb(baseHex);
	const baseHsl = this.rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
	const palette = [];
	const baseHue = baseHsl.h * 360;
	for (let i = 0; i < numColors; i++) {
		const hue = (baseHue + i * (360 / numColors) + (Math.random() - 0.5) * 40) % 360;
		const saturation = 80 + Math.random() * 20;
		const lightness = 65 + Math.random() * 15;
		palette.push(this.hslToHex(hue, saturation, lightness));
	}
	return palette;
};



// REPLACE your entire existing `einSofRenderer.calculateOptimalFontSize = function(...) { ... }`
einSofRenderer.calculateOptimalFontSize = function(ctx, text, maxWidth, maxHeight) {
    /* ב"ה B"H */
    const MIN_FONT_SIZE = 12; // Minimum readable font size
    const MAX_FONT_SIZE = maxHeight; // Max possible font size is the box height

    let optimalFontSize = MIN_FONT_SIZE;
    let lines = [];

    // Binary search for the optimal font size
    let low = MIN_FONT_SIZE;
    let high = MAX_FONT_SIZE;

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (mid < MIN_FONT_SIZE) {
            mid = MIN_FONT_SIZE;
        }

        ctx.font = `700 ${mid}px 'Teko', sans-serif`;
        const words = text.split(' ');
        let currentLine = '';
        let testLines = [];
        let currentHeight = 0;
        const lineHeight = mid * 1.2;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;

            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                testLines.push({ text: currentLine, height: lineHeight, fontSize: mid });
                currentHeight += lineHeight;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            testLines.push({ text: currentLine, height: lineHeight, fontSize: mid });
            currentHeight += lineHeight;
        }

        if (currentHeight <= maxHeight && testLines.length > 0) {
            optimalFontSize = mid;
            lines = testLines;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (lines.length === 0 && text.trim() !== '') {
        let fallbackFs = MIN_FONT_SIZE;
        let singleLineText = text;
        ctx.font = `700 ${fallbackFs}px 'Teko', sans-serif`;
        while (ctx.measureText(singleLineText).width > maxWidth && fallbackFs > 5) {
            fallbackFs -= 1;
            ctx.font = `700 ${fallbackFs}px 'Teko', sans-serif`;
        }
        lines.push({ text: singleLineText, height: fallbackFs * 1.2, fontSize: fallbackFs });
        optimalFontSize = fallbackFs;
    }

    return {
        optimalFontSize: optimalFontSize,
        lines: lines
    };
};






einSofRenderer.drawTextWithBorder = function(ctx, text, x, y, size, color, borderWidth) {
	/* ב"ה B"H */
	ctx.font = `700 ${size}px 'Teko', sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = 'rgba(0,0,0,0.7)';
	ctx.lineWidth = borderWidth;
	ctx.strokeText(text, x, y);
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
};
einSofRenderer.drawWeb = function(ctx, x1, y1, x2, y2, color, opacity) {
	/* ב"ה B"H */
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = this.hexToRgba(color, opacity * 0.6);
	ctx.lineWidth = 0.5 + opacity;
	ctx.stroke();
};
einSofRenderer.drawLightning = function(ctx, x1, y1, x2, y2, color, opacity) {
	/* ב"ה B"H */
	let p = [
		[x1, y1]
	];
	const d = Math.hypot(x1 - x2, y1 - y2);
	for (let i = 0; i < d / 15; i++) {
		let r = Math.random();
		p.push([x1 + (x2 - x1) * r, y1 + (y2 - y1) * r])
	}
	p.push([x2, y2]);
	p.sort((a, b) => Math.hypot(a[0] - x1, a[1] - y1) - Math.hypot(b[0] - x1, b[1] - y1));
	for (let i = 1; i < p.length - 1; i++) {
		p[i][0] += (Math.random() - 0.5) * 20;
		p[i][1] += (Math.random() - 0.5) * 20;
	}
	ctx.beginPath();
	ctx.moveTo(p[0][0], p[0][1]);
	p.forEach(pt => ctx.lineTo(pt[0], pt[1]));
	ctx.strokeStyle = this.hexToRgba(color, opacity);
	ctx.lineWidth = 1 + opacity * 3;
	ctx.stroke();
};
einSofRenderer.drawSynapse = function(ctx, x1, y1, x2, y2, color, opacity) {
	/* ב"ה B"H */
	const grad = ctx.createLinearGradient(x1, y1, x2, y2);
	grad.addColorStop(0, this.hexToRgba(color, opacity * 0.2));
	grad.addColorStop(0.5, this.hexToRgba(color, opacity));
	grad.addColorStop(1, this.hexToRgba(color, opacity * 0.2));
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = grad;
	ctx.lineWidth = 1 + opacity;
	ctx.stroke();
	const s = 3 + opacity * 6;
	ctx.fillStyle = this.hexToRgba(color, opacity);
	ctx.globalAlpha = opacity;
	ctx.beginPath();
	ctx.arc(x1, y1, s, 0, 2 * Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x2, y2, s, 0, 2 * Math.PI);
	ctx.fill();
	ctx.globalAlpha = 1;
};
einSofRenderer.wrapText = function(ctx, text, maxWidth, font) {
	/* ב"ה B"H */
	ctx.font = font;
	const words = text.split(' ');
	let lines = [];
	let currentLine = '';
	for (const word of words) {
		const testLine = currentLine ? currentLine + ' ' + word : word;
		if (ctx.measureText(testLine).width > maxWidth && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	}
	if (currentLine) {
		lines.push(currentLine);
	}
	return lines;
};
einSofRenderer.hexToRgba = function(hex, alpha) {
	/* ב"ה B"H */
	const r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
};
einSofRenderer.hexToRgb = function(hex) {
	/* ב"ה B"H */
	let r = 0,
		g = 0,
		b = 0;
	if (hex.length == 4) {
		r = "0x" + hex[1] + hex[1];
		g = "0x" + hex[2] + hex[2];
		b = "0x" + hex[3] + hex[3];
	} else if (hex.length == 7) {
		r = "0x" + hex[1] + hex[2];
		g = "0x" + hex[3] + hex[4];
		b = "0x" + hex[5] + hex[6];
	}
	return {
		r: +r,
		g: +g,
		b: +b
	};
};
einSofRenderer.rgbToHsl = function(r, g, b) {
	/* ב"ה B"H */
	r /= 255;
	g /= 255;
	b /= 255;
	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h = 0,
		s = 0,
		l = (max + min) / 2;
	if (max !== min) {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h,
		s,
		l
	};
};
einSofRenderer.hslToHex = function(h, s, l) {
	/* ב"ה B"H */
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
};
einSofRenderer.random = function(min, max) {
	/* ב"ה B"H */
	return min + Math.random() * (max - min);
};
einSofRenderer.randomHexColor = function() {
	/* ב"ה B"H */
	return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
};

// ADD this new function, or REPLACE an existing `einSofRenderer.renderSingleOverlay` function.
einSofRenderer.renderSingleOverlayCanvas = function(text, box, settings, resolution) {
    /* ב"ה B"H */
    if (!text || text.trim() === '' || !box) return null;

    const overlayCanvas = new OffscreenCanvas(box.width, box.height);
    const ctx = overlayCanvas.getContext('2d', { willReadFrequently: true });

    const padding = box.width * (settings.textBoxPadding / 100);
    const innerWidth = box.width - (padding * 2);
    const innerHeight = box.height - (padding * 2);

    const layout = this.calculateOptimalFontSize(ctx, text, innerWidth, innerHeight);
    if (layout.lines.length === 0) return null;

    const borderRadius = settings.textBoxBorderRadius;
    const boxColor = settings.randomizeBoxColorToggle ? this.randomHexColor() : '#101018';

    ctx.fillStyle = this.hexToRgba(boxColor, settings.textBoxOpacity);
    ctx.beginPath();
    ctx.roundRect(0, 0, box.width, box.height, borderRadius);
    ctx.fill();

    const totalTextHeight = layout.lines.reduce((acc, line) => acc + line.height, 0);
    let currentY = (box.height - totalTextHeight) / 2;

    ctx.textBaseline = 'middle';
    layout.lines.forEach(line => {
        const y = currentY + line.height / 2;
        this.drawTextWithBorder(ctx, line.text, box.width / 2, y, line.fontSize, '#FFFFFF', line.fontSize * 0.1);
        currentY += line.height;
    });

    return overlayCanvas;
};


// Inside the `einSofRenderer` object in `ein_sof_worker.js`
// For example, you can add it here, after the existing helper functions:

einSofRenderer.resolveSettings = function(settings, isDynamic = false) {
    /* ב"ה B"H */
    const resolved = {};
    for (const key in settings) {
        const setting = settings[key];
        if (setting && typeof setting === 'object' && setting.randomize) {
            if (setting.type === 'color') {
                resolved[key] = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
            } else {
                const min = Math.min(setting.min, setting.max);
                const max = Math.max(setting.min, setting.max);
                resolved[key] = setting.isFloat ? (min + Math.random() * (max - min)) : Math.floor(min + Math.random() * (max - min + 1));
            }
        } else {
            resolved[key] = (setting && typeof setting === 'object') ? setting.value : setting;
        }
    }
    if (isDynamic) {
        resolved.time = performance.now();
    }
    return resolved;
};


self.postMessage({ type: 'WORKER_READY' });

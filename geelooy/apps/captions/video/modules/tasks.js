/*
ב"ה
B"H
*/

self.taskHandlers = {};

// Helper: Sanitize text for filenames
const getSafeFilename = (index, text) => {
    const safeText = (text || "caption")
        .replace(/<[^>]*>/g, '') // Remove HTML
        .replace(/[^a-z0-9\u0590-\u05FF]/gi, '_') // Keep alphanumeric + Hebrew
        .replace(/_+/g, '_')
        .substring(0, 30); // Max length
    return `${String(index + 1).padStart(3, '0')}_${safeText}.png`;
};

const renderFrame = (ctx, settings, res, bitmaps, time, pCap, sCap, pal, cache, audioSlice) => {
    // 1. BG
    const { canvas: bg, palette } = self.einSofRenderer.generateBg(settings, res, bitmaps, time);
    ctx.drawImage(bg, 0, 0);
    
    // 2. Universe
    const uni = self.einSofRenderer.generateUniverse({ ...settings, time }, res, palette);
    const glowC = new OffscreenCanvas(res.width, res.height).getContext('2d', { willReadFrequently: true });
    self.einSofRenderer.renderParticles(ctx, glowC, uni.particles);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(glowC.canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // 3. Text & HUD
    const header = settings.headerText || '';
    self.einSofRenderer.renderHeader(ctx, header, res);
    
    const pText = pCap ? pCap.text : null;
    const sText = sCap ? sCap.text : null;
    
    self.einSofRenderer.renderText(ctx, pText, sText, settings, res, pal, cache);
    
    const vcr = (settings.enableVCRStamp === true);
    self.einSofRenderer.renderVCRStamp(ctx, res, vcr);
    
    const wave = (settings.enableWaveform === true);
    self.einSofRenderer.renderWaveform(ctx, res, audioSlice, wave);

    // 4. FX
    self.einSofRenderer.applyFX(ctx, settings, res);
};

self.taskHandlers.handleRender = async (payload) => {
    const { mode, settings, resolution, captionData, portalBitmaps, plainAudioBuffer, fps } = payload;
    
    // Optimization: willReadFrequently helps with FX that use getImageData
    const ctx = new OffscreenCanvas(resolution.width, resolution.height).getContext('2d', { willReadFrequently: true });
    
    const cache = await self.einSofRenderer.cacheOverlays(captionData, settings, resolution);
    const { timeEvents, lastTime } = self.utils.createTimeEvents(captionData, plainAudioBuffer);
    
    const getAudioSlice = (t) => {
        if(!plainAudioBuffer || !plainAudioBuffer.channels[0]) return null;
        const idx = Math.floor(t * plainAudioBuffer.sampleRate);
        return plainAudioBuffer.channels[0].subarray(idx, idx + 1024);
    };

    // --- VIDEO MODE (REAL IMPLEMENTATION) ---
    if (mode === 'video') {
        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing Encoder...' } });

        // 1. Setup Mediabunny
        const output = new mediabunny.Output({
            format: new mediabunny.Mp4OutputFormat(),
            target: new mediabunny.BufferTarget()
        });

        // 2. Video Track
        let videoCodec = 'avc1.42001E'; // Default H.264
        try {
            const codecs = output.format.getSupportedVideoCodecs();
            videoCodec = await mediabunny.getFirstEncodableVideoCodec(codecs, { width: resolution.width, height: resolution.height });
        } catch (e) { console.warn("Codec check failed, using default."); }

        // Use the canvas directly as source
        const canvasSource = new mediabunny.CanvasSource(ctx.canvas, { codec: videoCodec, bitrate: 6_000_000 }); // 6Mbps
        output.addVideoTrack(canvasSource);

        // 3. Audio Track
        let audioSource = null;
        if (plainAudioBuffer) {
            const shim = new AudioBuffer(plainAudioBuffer);
            const acodecs = output.format.getSupportedAudioCodecs();
            const audioCodec = await mediabunny.getFirstEncodableAudioCodec(acodecs, shim);
            audioSource = new mediabunny.AudioBufferSource({ codec: audioCodec, bitrate: 128_000 });
            output.addAudioTrack(audioSource);
        }

        await output.start();

        // 4. Render Loop
        const totalFrames = Math.ceil(lastTime * fps);
        const frameDur = 1 / fps;

        for (let i = 0; i < totalFrames; i++) {
            const t = i * frameDur;
            
            // UI Update every 10 frames to save overhead
            if (i % 10 === 0) {
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding Frame ${i}/${totalFrames}` } });
                self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: (i / totalFrames) * 100 } });
            }

            const cap = self.utils.findCaption(t, captionData.primary);
            const sCap = self.utils.findCaption(t, captionData.translation);
            const settingsAtTime = self.utils.resolveSettings(settings, true); // Dynamic time updates

            renderFrame(ctx, settingsAtTime, resolution, portalBitmaps, t * 1000, cap, sCap, ['#FFF'], cache, getAudioSlice(t));
            
            await canvasSource.add(t, frameDur);
        }

        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing Video...' } });
        canvasSource.close();
        if (audioSource) {
            await audioSource.add(new AudioBuffer(plainAudioBuffer));
            audioSource.close();
        }
        await output.finalize();

        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob: new Blob([output.target.buffer], {type: 'video/mp4'}) } });

    } else {
        // --- IMAGE BATCH MODE ---
        const caps = captionData.primary;
        
        if (caps.length === 0) {
            // Render at least one frame if no captions
             caps.push({ startTime: 0, text: "Background", endTime: 5 });
        }

        for (let i = 0; i < caps.length; i++) {
            const cap = caps[i];
            const t = cap.startTime;
            
            // Find corresponding translation
            const sCap = self.utils.findCaption(t, captionData.translation);
            
            renderFrame(
                ctx, 
                self.utils.resolveSettings(settings, true), 
                resolution, 
                portalBitmaps, 
                t * 1000, 
                cap, 
                sCap, 
                ['#FFF', '#CCC', '#888', '#444', '#000'],
                cache, 
                getAudioSlice(t)
            );
            
            const blob = await ctx.canvas.convertToBlob({ type: 'image/png' });
            const filename = getSafeFilename(i, cap.text);

            self.postMessage({ 
                type: 'IMAGE_COMPLETE', 
                payload: { blob, filename } 
            });
            self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: ((i + 1) / caps.length) * 100 } });
        }
        self.postMessage({ type: 'BATCH_COMPLETE' });
    }
};

self.taskHandlers.handlePreview = async (payload) => {
    const { settings, resolution, primaryCaption, portalBitmaps } = payload;
    const cvs = new OffscreenCanvas(resolution.width, resolution.height);
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    
    const resSettings = self.utils.resolveSettings(settings, true);
    
    renderFrame(
        ctx, 
        resSettings, 
        resolution, 
        portalBitmaps, 
        0, 
        { text: primaryCaption }, 
        null, 
        ['#F0F', '#0FF', '#FFF', '#000', '#111'], 
        new Map(), 
        null
    );
    
    const bitmap = cvs.transferToImageBitmap();
    self.postMessage({ type: 'PREVIEW_READY', payload: { bitmap } }, [bitmap]);
};
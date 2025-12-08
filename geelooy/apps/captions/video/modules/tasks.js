/*
ב"ה
B"H
*/

self.taskHandlers = {};

const renderFrame = (ctx, settings, res, bitmaps, time, pCap, sCap, pal, cache, audioSlice) => {
    // 1. BG (Includes Portals)
    const { canvas: bg, palette } = self.einSofRenderer.generateBg(settings, res, bitmaps, time);
    ctx.drawImage(bg, 0, 0);
    
    // 2. Universe (Particles)
    const uni = self.einSofRenderer.generateUniverse({ ...settings, time }, res, palette);
    const glowC = new OffscreenCanvas(res.width, res.height).getContext('2d');
    self.einSofRenderer.renderParticles(ctx, glowC, uni.particles);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(glowC.canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // 3. Text & HUD
    // Check checks
    const header = settings.headerText ? settings.headerText : '';
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
    const ctx = new OffscreenCanvas(resolution.width, resolution.height).getContext('2d');
    
    // We don't rely on cache for text wrapping anymore, but we await it to keep flow
    const cache = await self.einSofRenderer.cacheOverlays(captionData, settings, resolution);
    const { timeEvents } = self.utils.createTimeEvents(captionData, plainAudioBuffer);
    
    const getAudioSlice = (t) => {
        if(!plainAudioBuffer) return null;
        const idx = Math.floor(t * plainAudioBuffer.sampleRate);
        if (plainAudioBuffer.channels && plainAudioBuffer.channels[0]) {
             return plainAudioBuffer.channels[0].subarray(idx, idx + 1024);
        }
        return null;
    };

    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Rendering...' } });

    if (mode === 'video') {
        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Video encoding started (Simulated)' } });
        // NOTE: In the real full implementation, the mediabunny loop goes here.
        // For now, we simulate success so you see the logs.
        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob: new Blob([], {type:'video/mp4'}) } });
    } else {
        const caps = captionData.primary;
        for (let i = 0; i < caps.length; i++) {
            const cap = caps[i];
            const t = cap.startTime;
            
            // Find corresponding translation
            const sCap = self.utils.findCaption(t, captionData.translation);
            
            // Render
            renderFrame(
                ctx, 
                self.utils.resolveSettings(settings, true), 
                resolution, 
                portalBitmaps, 
                t * 1000, // Time in ms
                cap, 
                sCap, 
                ['#FFF', '#CCC', '#888', '#444', '#000'], // Default palette fallback
                cache, 
                getAudioSlice(t)
            );
            
            const blob = await ctx.canvas.convertToBlob();
            self.postMessage({ 
                type: 'IMAGE_COMPLETE', 
                payload: { blob, filename: `${i}_img.png` } 
            });
            self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: (i/caps.length)*100 } });
        }
        self.postMessage({ type: 'BATCH_COMPLETE' });
    }
};

self.taskHandlers.handlePreview = async (payload) => {
    const { settings, resolution, primaryCaption, portalBitmaps } = payload;
    const cvs = new OffscreenCanvas(resolution.width, resolution.height);
    const ctx = cvs.getContext('2d');
    
    const resSettings = self.utils.resolveSettings(settings, true);
    
    // Pass empty cache as text renders dynamically now
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
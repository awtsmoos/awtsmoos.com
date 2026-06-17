/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.drawKeyboardFrame = function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: cfg, ctx } = workerContext, { time, duration: deltaTime } = framePayload, s = PianoVideo.state;
    const scroll = s.eventQueue.filter(e => e.type === 'UPDATE_SCROLL' && e.payload.time <= time).map(e => e.payload).pop() || { scrollX: cfg.initialScrollX, scrollX2: cfg.initialScrollX2 };
    const active = PianoVideo.collectActiveKeys(time, deltaTime), zoom = cfg.resolution.width / cfg.style.userViewportWidth, dual = cfg.alwaysDual || cfg.isVertical, rowH = (cfg.resolution.height / zoom) / (dual ? 2 : 1);
    ctx.fillStyle = PianoVideo.UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, cfg.resolution.width, cfg.resolution.height); ctx.save(); ctx.scale(zoom, zoom);
    const renderRow = (yStart, rowScroll) => ['white','black'].forEach(type => s.masterKeyboardLayout.forEach(key => { if ((type === 'black') === key.isBlack) { const x = key.x - rowScroll; if (x + key.width > 0 && x < cfg.style.userViewportWidth) PianoVideo.renderKey(ctx, key, x, yStart, active.activeKeys, active.activeKeyEvents, rowH, zoom, deltaTime); } }));
    renderRow(dual ? rowH : 0, s.baseOffset_Bottom + scroll.scrollX); if (dual) renderRow(0, s.baseOffset_Top + (cfg.independentScroll ? scroll.scrollX2 : scroll.scrollX));
    PianoVideo.stepEffects(deltaTime); PianoVideo.drawEffects(ctx); ctx.restore();
};

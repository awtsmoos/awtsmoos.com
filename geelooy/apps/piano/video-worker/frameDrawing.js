/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.drawKeyboardFrame = function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: cfg, ctx } = workerContext;
    const { time, duration: deltaTime } = framePayload;
    const s = PianoVideo.state;
    const scroll = s.eventQueue
        .filter(e => e.type === 'UPDATE_SCROLL' && e.payload.time <= time)
        .map(e => e.payload)
        .pop() || { scrollX: cfg.initialScrollX || 0, scrollX2: cfg.initialScrollX2 || 0 };
    const active = PianoVideo.collectActiveKeys(time, deltaTime);
    const zoom = cfg.resolution.width / cfg.style.userViewportWidth;
    const dual = cfg.alwaysDual || cfg.isVertical;
    const rowH = (cfg.resolution.height / zoom) / (dual ? 2 : 1);
    ctx.fillStyle = PianoVideo.UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, cfg.resolution.width, cfg.resolution.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    const renderRow = (layout, yStart, rowScroll) => ['white', 'black'].forEach(type => {
        layout.forEach(key => {
            if ((type === 'black') !== key.isBlack) return;
            const x = key.x - rowScroll;
            if (x + key.width > 0 && x < cfg.style.userViewportWidth) {
                PianoVideo.renderKey(ctx, key, x, yStart, active.activeKeys, active.activeKeyEvents, rowH, zoom, deltaTime);
            }
        });
    });
    renderRow(s.bottomKeyboardLayout, dual ? rowH : 0, s.baseOffset_Bottom + (scroll.scrollX || 0));
    if (dual) {
        const topScroll = cfg.independentScroll ? (scroll.scrollX2 || 0) : (scroll.scrollX || 0);
        renderRow(s.topKeyboardLayout, 0, s.baseOffset_Top + topScroll);
    }
    PianoVideo.stepEffects(deltaTime);
    PianoVideo.drawEffects(ctx);
    ctx.restore();
};

/* B"H
Key drawing: active keys always render; fantasy effects obey video route.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.collectActiveKeys = function collectActiveKeys(time, deltaTime) {
    const activeKeys = new Set(), activeKeyEvents = [];
    PianoVideo.state.eventQueue.forEach(e => {
        if (e.type === 'KEY_DOWN' && Math.abs(time - e.payload.time) < deltaTime * 1.5) activeKeyEvents.push({ ...e.payload, start: e.payload.time, end: e.payload.time + deltaTime, effectTriggered: e.payload.effectTriggered });
        if (e.type === 'ADD_KEY_EVENT' && time >= e.payload.start && time < e.payload.end) { activeKeys.add(e.payload.note); activeKeyEvents.push(e.payload); }
    });
    return { activeKeys, activeKeyEvents };
};
PianoVideo.renderKey = function renderKey(ctx, key, keyScreenX, yStart, activeKeys, activeKeyEvents, unscaledRowHeight, zoomFactor, deltaTime) {
    const cfg = PianoVideo.state.workerConfig, st = PianoVideo.UI_STYLE, isActive = activeKeys.has(key.note), data = isActive ? activeKeyEvents.find(e => e.note === key.note) : null;
    const target = isActive ? 1 : 0;
    key.pressAnimation += Math.abs(key.pressAnimation - target) > .01 ? (target - key.pressAnimation) * 12 * deltaTime : target - key.pressAnimation;
    const whiteH = unscaledRowHeight * .95, press = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteH);
    if (isActive && data && !data.effectTriggered && cfg.renderMode !== 'none') {
        const ex = keyScreenX + (data.x / zoomFactor), ey = yPos + (data.y / zoomFactor), label = data.note || key.note;
        cfg.renderMode === 'explosion' ? PianoVideo.createRichExplosion(ex, ey, label) : PianoVideo.createTouchEvent(ex, ey);
        PianoVideo.state.shockwaves.push({ x: ex, y: ey, life: 1, size: 0 }); data.effectTriggered = true;
    }
    ctx.drawImage(PianoVideo.state.keyCache[key.isBlack ? 'black_default' : 'white_default'], keyScreenX, yPos + press);
    if (key.pressAnimation > 0) { ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = st.ACTIVE_KEY_OVERLAY_COLOR; ctx.fillRect(keyScreenX, yPos + press, key.width, key.isBlack ? whiteH * .65 : whiteH); ctx.globalAlpha = 1; }
    ctx.font = `bold ${cfg.style.userKeyWidth * .22}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = key.isBlack ? 'middle' : 'bottom'; ctx.fillStyle = key.pressAnimation > .5 ? st.ACTIVE_LABEL_COLOR : (key.isBlack ? st.LABEL_COLOR_BLACK_KEY : st.LABEL_COLOR_WHITE_KEY);
    ctx.fillText(key.isBlack ? key.note.slice(0, -1) : key.note, keyScreenX + key.width / 2, key.isBlack ? yPos + whiteH * .52 + press : yStart + unscaledRowHeight - unscaledRowHeight * .05 + press);
};

/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.cacheKeyRenders = function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const s = PianoVideo.state, st = PianoVideo.UI_STYLE, blackKeyWidth = whiteKeyWidth * .6, blackKeyHeight = whiteKeyHeight * .65;
    const shadowOffset = whiteKeyWidth * .05, keyFrontHeight = whiteKeyWidth * .07;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight + shadowOffset), wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = st.WHITE_KEY_SHADOW; wCtx.fillRect(0, shadowOffset, whiteKeyWidth, whiteKeyHeight);
    const bodyGradient = wCtx.createLinearGradient(0, 0, 0, whiteKeyHeight); bodyGradient.addColorStop(0, st.WHITE_KEY_FILL_TOP); bodyGradient.addColorStop(1, st.WHITE_KEY_FILL_BOTTOM);
    wCtx.fillStyle = bodyGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); wCtx.fillStyle = st.WHITE_KEY_FRONT_FACE; wCtx.fillRect(0, whiteKeyHeight - keyFrontHeight, whiteKeyWidth, keyFrontHeight);
    const innerShadow = wCtx.createLinearGradient(0, 0, 0, 8); innerShadow.addColorStop(0, st.WHITE_KEY_INNER_SHADOW); innerShadow.addColorStop(1, 'transparent'); wCtx.fillStyle = innerShadow; wCtx.fillRect(0, 1, whiteKeyWidth, 7);
    const bevel = wCtx.createLinearGradient(0, 0, 0, 4); bevel.addColorStop(0, st.WHITE_KEY_SHINY_BEVEL_START); bevel.addColorStop(1, st.WHITE_KEY_SHINY_BEVEL_END); wCtx.fillStyle = bevel; wCtx.fillRect(0, 0, whiteKeyWidth, 4); s.keyCache.white_default = wCanvas;
    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight), bCtx = bCanvas.getContext('2d');
    const bGradient = bCtx.createLinearGradient(0, 0, 0, blackKeyHeight); bGradient.addColorStop(0, st.BLACK_KEY_GRADIENT_START); bGradient.addColorStop(1, st.BLACK_KEY_GRADIENT_END);
    bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); bCtx.fillStyle = st.BLACK_KEY_BEVEL_HIGHLIGHT; bCtx.fillRect(0, 0, blackKeyWidth, 2.5); s.keyCache.black_default = bCanvas;
};

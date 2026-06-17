/* B"H
Realtime-friendly fantasy drawing: Hebrew and emoji text with outline, no shadowBlur, no glow pass.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.stepEffects = function stepEffects(deltaTime) {
    const s = PianoVideo.state;
    for (let i = s.shockwaves.length - 1; i >= 0; i--) { const sw = s.shockwaves[i]; sw.life -= deltaTime * 1.6; if (sw.life <= 0) s.shockwaves.splice(i, 1); }
    for (let i = s.touchPoints.length - 1; i >= 0; i--) { const tp = s.touchPoints[i]; tp.life -= deltaTime * 2; if (tp.life <= 0) s.touchPoints.splice(i, 1); }
    s.lightningBolts.length = 0;
    for (let i = s.particles.length - 1; i >= 0; i--) { const p = s.particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 430 * deltaTime; p.life -= deltaTime; p.spin = (p.spin || 0) + deltaTime; if (p.life <= 0) s.particles.splice(i, 1); }
};
PianoVideo.drawEffects = function drawEffects(ctx) {
    const s = PianoVideo.state, st = PianoVideo.UI_STYLE;
    ctx.lineWidth = 3;
    s.shockwaves.forEach(sw => { ctx.globalAlpha = sw.life * .7; ctx.strokeStyle = st.SHOCKWAVE_COLOR; ctx.beginPath(); ctx.arc(sw.x, sw.y, (1 - sw.life) * 170, 0, Math.PI * 2); ctx.stroke(); });
    s.touchPoints.forEach(tp => { ctx.globalAlpha = (tp.life / tp.initialLife) * .55; ctx.fillStyle = st.TOUCH_POINT_COLOR; ctx.beginPath(); ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2); ctx.fill(); });
    s.particles.forEach(p => drawParticle(ctx, p)); ctx.globalAlpha = 1;
};
function drawParticle(ctx, p) {
    if (p.initialLife === -1) p.initialLife = p.life;
    const lifeRatio = Math.max(0, p.life / p.initialLife);
    ctx.save(); ctx.globalAlpha = lifeRatio; ctx.translate(p.x, p.y); ctx.rotate((p.spin || 0) * .08);
    if (!p.content) { ctx.fillStyle = p.type === 'bubble' ? 'rgba(120,230,255,.32)' : 'rgba(255,245,150,.9)'; ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
    const size = Math.max(18, p.radius * (p.type === 'noteEmoji' ? 3.6 : 4));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold ' + size + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", Arial, sans-serif';
    ctx.strokeStyle = 'rgba(0,0,0,' + (lifeRatio * .62) + ')'; ctx.lineWidth = Math.max(2, size * .07); ctx.strokeText(p.content, 0, 0);
    ctx.fillStyle = p.type === 'hebrew' ? 'hsla(' + (p.hue || 180) + ',95%,68%,' + lifeRatio + ')' : 'rgba(255,255,255,' + lifeRatio + ')';
    ctx.fillText(p.content, 0, 0); ctx.restore();
}

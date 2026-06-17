/* B"H
Rendering effects with colored emoji, shadow, and outlined text so mobile MP4s show symbols clearly.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.stepEffects = function stepEffects(deltaTime) {
    const s = PianoVideo.state;
    for (let i = s.shockwaves.length - 1; i >= 0; i--) { const sw = s.shockwaves[i]; sw.life -= deltaTime * 1.5; if (sw.life <= 0) s.shockwaves.splice(i, 1); }
    for (let i = s.touchPoints.length - 1; i >= 0; i--) { const tp = s.touchPoints[i]; tp.life -= deltaTime * 2; if (tp.life <= 0) s.touchPoints.splice(i, 1); }
    for (let i = s.lightningBolts.length - 1; i >= 0; i--) { const l = s.lightningBolts[i]; l.life -= deltaTime; if (l.life <= 0) s.lightningBolts.splice(i, 1); }
    for (let i = s.particles.length - 1; i >= 0; i--) { const p = s.particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 520 * deltaTime; p.life -= deltaTime; p.spin = (p.spin || 0) + deltaTime; if (p.life <= 0) s.particles.splice(i, 1); }
    if (s.particles.length > 2 && Math.random() < .28) { const p1 = s.particles[Math.floor(Math.random() * s.particles.length)], p2 = s.particles[Math.floor(Math.random() * s.particles.length)]; if (p1 !== p2 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < 150) PianoVideo.createLightningBolt(p1, p2); }
};
PianoVideo.drawEffects = function drawEffects(ctx) {
    const s = PianoVideo.state, st = PianoVideo.UI_STYLE;
    ctx.lineWidth = 4; s.shockwaves.forEach(sw => { ctx.globalAlpha = sw.life; ctx.strokeStyle = st.SHOCKWAVE_COLOR; ctx.beginPath(); ctx.arc(sw.x, sw.y, (1 - sw.life) * 200, 0, Math.PI * 2); ctx.stroke(); });
    s.touchPoints.forEach(tp => { ctx.globalAlpha = (tp.life / tp.initialLife) * .7; ctx.fillStyle = st.TOUCH_POINT_COLOR; ctx.beginPath(); ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2); ctx.fill(); });
    s.lightningBolts.forEach(b => { ctx.globalAlpha = (b.life / b.initialLife) * .8; ctx.strokeStyle = st.LIGHTNING_COLOR; ctx.lineWidth = 1 + (b.life / b.initialLife) * 3; ctx.beginPath(); ctx.moveTo(b.segments[0].x, b.segments[0].y); for (let i = 1; i < b.segments.length; i++) ctx.lineTo(b.segments[i].x, b.segments[i].y); ctx.stroke(); });
    s.particles.forEach(p => drawParticle(ctx, p)); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
};
function drawParticle(ctx,p){
    if (p.initialLife === -1) p.initialLife = p.life; const r = Math.max(0, p.life / p.initialLife); ctx.save(); ctx.globalAlpha = r; ctx.translate(p.x, p.y); ctx.rotate((p.spin || 0) * .12);
    if (!p.content) { ctx.fillStyle = p.type === 'spark' ? `rgba(255,255,190,${r})` : `rgba(0,220,255,${r*.35})`; ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
    const size = Math.max(16, p.radius * (p.type === 'noteEmoji' ? 4 : 4.8)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `bold ${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`; ctx.shadowColor = 'rgba(0,255,255,.9)'; ctx.shadowBlur = 10;
    if (p.type === 'hebrew') { ctx.fillStyle = `hsla(${p.hue||180},95%,65%,${r})`; ctx.strokeStyle = `rgba(0,0,0,${r*.75})`; ctx.lineWidth = Math.max(2, size*.08); ctx.strokeText(p.content,0,0); ctx.fillText(p.content,0,0); }
    else { ctx.strokeStyle = `rgba(0,0,0,${r*.65})`; ctx.lineWidth = Math.max(3, size*.09); ctx.strokeText(p.content,0,0); ctx.fillText(p.content,0,0); }
    ctx.restore();
}

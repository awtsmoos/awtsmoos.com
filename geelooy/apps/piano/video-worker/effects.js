/* B"H
Every key impact throws sparks, Hebrew letters, and real emoji glyphs back into the video.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.createRichExplosion = function createRichExplosion(x, y, note = '') {
    const s = PianoVideo.state, density = PianoVideo.PARTICLE_DENSITY;
    if (s.particles.length + density > PianoVideo.MAX_PARTICLES) s.particles.splice(0, s.particles.length + density - PianoVideo.MAX_PARTICLES);
    const noteParticle = { x, y:y-18, vx:0, vy:-80, life:1.8, initialLife:-1, type:'noteEmoji', content:`🎹 ${note || 'BH'} ✨`, radius:13, hue:180 };
    s.particles.push(noteParticle);
    for (let i = 0; i < density; i++) {
        const a = Math.random() * Math.PI * 2, speed = Math.random() * 260 + 80;
        const p = { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: Math.random() * 2.8 + 1.3, initialLife: -1, radius: 0, spin:(Math.random()-.5)*3 };
        const r = Math.random();
        if (r < .28) { p.type = 'hebrew'; p.content = PianoVideo.HEBREW_LETTERS[Math.floor(Math.random() * PianoVideo.HEBREW_LETTERS.length)]; p.hue = Math.random() * 360; p.radius = Math.random() * 5 + 5; }
        else if (r < .68) { p.type = 'emoji'; p.content = PianoVideo.EMOJIS[Math.floor(Math.random() * PianoVideo.EMOJIS.length)]; p.radius = Math.random() * 9 + 8; p.life += .6; }
        else if (r < .86) { p.type = 'spark'; p.life = Math.random() + .55; p.radius = Math.random() * 2 + 1.2; }
        else { p.type = 'bubble'; p.vy = -Math.random() * 70 - 25; p.life = Math.random() * 4 + 2; p.radius = Math.random() * 9 + 5; }
        s.particles.push(p);
    }
};
PianoVideo.createTouchEvent = (x, y) => PianoVideo.state.touchPoints.push({ x, y, life: 1, initialLife: 1, radius: 25 });
PianoVideo.createLightningBolt = function createLightningBolt(p1, p2) {
    const seg = [{ x: p1.x, y: p1.y }], n = 10, life = .4, max = 15;
    for (let i = 1; i < n; i++) { const t = i / n, px = p1.x + t * (p2.x - p1.x), py = p1.y + t * (p2.y - p1.y), off = (Math.random() - .5) * max * (1 - Math.abs(2 * t - 1)); const norm = { x: -(p2.y - p1.y), y: p2.x - p1.x }, len = Math.hypot(norm.x, norm.y) || 1; seg.push({ x: px + norm.x / len * off, y: py + norm.y / len * off }); }
    seg.push({ x: p2.x, y: p2.y }); PianoVideo.state.lightningBolts.push({ segments: seg, life, initialLife: life });
};

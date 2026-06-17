/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.createRichExplosion = function createRichExplosion(x, y) {
    const s = PianoVideo.state, density = PianoVideo.PARTICLE_DENSITY;
    if (s.particles.length + density > PianoVideo.MAX_PARTICLES) s.particles.splice(0, s.particles.length + density - PianoVideo.MAX_PARTICLES);
    for (let i = 0; i < density; i++) { const a = Math.random() * Math.PI * 2, speed = Math.random() * 250 + 75, p = { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: Math.random() * 3 + 1.5, initialLife: -1, radius: 0 }; const r = Math.random();
        if (r < .4) { p.type = 'hebrew'; p.content = PianoVideo.HEBREW_LETTERS[Math.floor(Math.random() * PianoVideo.HEBREW_LETTERS.length)]; p.hue = Math.random() * 360; p.radius = Math.random() * 4 + 3; }
        else if (r < .6) { p.type = 'emoji'; p.content = PianoVideo.EMOJIS[Math.floor(Math.random() * PianoVideo.EMOJIS.length)]; p.radius = Math.random() * 6 + 5; }
        else if (r < .8) { p.type = 'spark'; p.life = Math.random() + .5; p.radius = Math.random() * 1.5 + 1; }
        else { p.type = 'bubble'; p.vy = -Math.random() * 50 - 25; p.life = Math.random() * 4 + 2; p.radius = Math.random() * 8 + 4; }
        s.particles.push(p);
    }
};
PianoVideo.createTouchEvent = (x, y) => PianoVideo.state.touchPoints.push({ x, y, life: 1, initialLife: 1, radius: 25 });
PianoVideo.createLightningBolt = function createLightningBolt(p1, p2) {
    const seg = [{ x: p1.x, y: p1.y }], n = 10, life = .4, max = 15;
    for (let i = 1; i < n; i++) { const t = i / n, px = p1.x + t * (p2.x - p1.x), py = p1.y + t * (p2.y - p1.y), off = (Math.random() - .5) * max * (1 - Math.abs(2 * t - 1)); const norm = { x: -(p2.y - p1.y), y: p2.x - p1.x }, len = Math.hypot(norm.x, norm.y) || 1; seg.push({ x: px + norm.x / len * off, y: py + norm.y / len * off }); }
    seg.push({ x: p2.x, y: p2.y }); PianoVideo.state.lightningBolts.push({ segments: seg, life, initialLife: life });
};

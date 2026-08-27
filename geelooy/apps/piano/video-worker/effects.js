/* B"H
Fantasy bursts restored: Hebrew letters, emoji, sparks, bubbles. No blur/shadow storm.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.createRichExplosion = function createRichExplosion(x, y, note = '') {
    const s = PianoVideo.state, density = PianoVideo.PARTICLE_DENSITY;
    if (s.particles.length + density + 2 > PianoVideo.MAX_PARTICLES) s.particles.splice(0, s.particles.length + density + 2 - PianoVideo.MAX_PARTICLES);
    s.particles.push({ x, y:y-20, vx:0, vy:-78, life:1.45, initialLife:-1, type:'noteEmoji', content:'🎹 ' + (note || 'BH') + ' ✨', radius:13, spin:0, hue:180 });
    for (let i = 0; i < density; i++) {
        const a = Math.random() * Math.PI * 2, speed = Math.random() * 190 + 55, r = Math.random();
        const p = { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: Math.random() * 1.25 + .85, initialLife:-1, radius: Math.random()*5+4, spin:(Math.random()-.5)*2, hue:Math.random()*360 };
        if (r < .34) { p.type = 'hebrew'; p.content = PianoVideo.HEBREW_LETTERS[Math.floor(Math.random()*PianoVideo.HEBREW_LETTERS.length)]; p.life += .35; }
        else if (r < .68) { p.type = 'emoji'; p.content = PianoVideo.EMOJIS[Math.floor(Math.random()*PianoVideo.EMOJIS.length)]; p.radius += 3; p.life += .25; }
        else if (r < .88) { p.type = 'spark'; p.content = ''; p.radius = Math.random()*2+1.2; p.life *= .7; }
        else { p.type = 'bubble'; p.content = ''; p.radius += 4; p.vy = -Math.random()*80-25; p.life += .6; }
        s.particles.push(p);
    }
};
PianoVideo.createTouchEvent = (x, y) => PianoVideo.state.touchPoints.push({ x, y, life: 1, initialLife: 1, radius: 25 });
PianoVideo.createLightningBolt = function createLightningBolt() {};

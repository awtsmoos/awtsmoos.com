/*
ב"ה
B"H
*/

self.einSofRenderer.generateUniverse = function(settings, res, pal) {
    const particles = [];
    const chars = Array.from(settings.particleChars || '•');
    const basePal = [...pal, '#FFF', '#888'];

    // New Feature 6: Dynamic Particle Speed (Warp)
    // We simulate movement by using settings.time to offset Z
    const speed = settings.particleSpeed || 1.0;
    const timeOffset = (settings.time || 0) * 0.0001 * speed;

    for (let i = 0; i < settings.particleDensity; i++) {
        // Z cycles 0-1 based on time
        let z = (Math.random() + timeOffset) % 1;
        
        const x = Math.random() * res.width;
        const y = Math.random() * res.height;
        const color = basePal[Math.floor(Math.random() * basePal.length)];
        
        // Size scales with Z
        const baseSize = settings.minParticleSize + (settings.maxParticleSize - settings.minParticleSize) * (z * z);
        
        particles.push({ x, y, z, size: baseSize, char: chars[Math.floor(Math.random() * chars.length)], color });
    }
    particles.sort((a, b) => a.z - b.z);
    return { particles };
};

self.einSofRenderer.renderParticles = function(ctx, glowCtx, particles) {
    particles.forEach(p => {
        const alpha = 0.2 + p.z * 0.8;
        if (p.z > 0.8) {
            glowCtx.font = `${p.size}px sans-serif`;
            glowCtx.fillStyle = p.color;
            glowCtx.globalAlpha = alpha * 0.8;
            glowCtx.fillText(p.char, p.x, p.y);
        }
        ctx.globalAlpha = alpha;
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, p.x, p.y);
    });
    ctx.globalAlpha = 1.0;
};
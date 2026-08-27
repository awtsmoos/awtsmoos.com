// B"H

const nearestBeat = (beats = [], ms = 0) => beats.reduce((best, beat) => (ms >= beat.at ? beat : best), beats[0] || {});

export class OutdoorSkyPainter {
  static render(ctx, scene, w, h, time = 0) {
    const weather = scene.weather || {};
    const beat = nearestBeat(weather.colorScript, time);
    const top = beat.skyTop || scene.background?.skyColorTop || '#16233f';
    const bottom = beat.skyBottom || scene.background?.skyColorBottom || '#7e8aa3';
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, top);
    gradient.addColorStop(.62, bottom);
    gradient.addColorStop(1, scene.background?.groundColor || '#39484d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    this.clouds(ctx, w, h, time * .001, weather.cloudSpeed || .16);
    this.lightning(ctx, w, h, time, weather.lightningMoments || []);
  }

  static clouds(ctx, w, h, t, speed) {
    ctx.save(); ctx.globalAlpha = .42; ctx.fillStyle = '#0e1831';
    for (let i = 0; i < 7; i++) {
      const x = ((i * w * .27 - t * speed * w) % (w * 1.4)) - w * .2;
      const y = h * (.1 + (i % 3) * .08);
      ctx.beginPath(); ctx.ellipse(x, y, w * .24, h * .07, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  static lightning(ctx, w, h, time, moments) {
    const flash = moments.some(at => Math.abs(time - at) < 130);
    if (!flash) return;
    ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#edf4ff'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath();
    ctx.moveTo(w * .58, 0); ctx.lineTo(w * .51, h * .18); ctx.lineTo(w * .56, h * .2); ctx.lineTo(w * .43, h * .43); ctx.stroke();
    ctx.restore();
  }
}

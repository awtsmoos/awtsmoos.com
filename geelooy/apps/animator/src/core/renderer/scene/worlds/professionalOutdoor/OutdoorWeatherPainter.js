// B"H

export class OutdoorWeatherPainter {
  static render(ctx, scene, w, h, time = 0) {
    const weather = scene.weather || {};
    this.rain(ctx, w, h, time * .001, weather.rainIntensity || .55, weather.windIntensity || .35);
    this.lanternBloom(ctx, scene, w, h, time);
    if (weather.foregroundOcclusion) this.foreground(ctx, w, h, time * .001, weather.windIntensity || .35);
  }

  static rain(ctx, w, h, t, intensity, wind) {
    ctx.save(); ctx.strokeStyle = 'rgba(205,235,255,.48)'; ctx.lineWidth = 1.4;
    const count = Math.floor(90 * intensity);
    for (let i = 0; i < count; i++) {
      const x = (i * 97 + t * 220 * wind) % (w + 180) - 90;
      const y = (i * 53 + t * 520) % h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20 * wind, y + 32); ctx.stroke();
    }
    ctx.restore();
  }

  static lanternBloom(ctx, scene, w, h, time) {
    const weather = scene.weather || {}; const ms = time || 0;
    const on = ms > 11800 ? Math.min(1, (ms - 11800) / 4600) : .12;
    const grd = ctx.createRadialGradient(w * .44, h * .59, 10, w * .44, h * .59, h * .35);
    grd.addColorStop(0, `${weather.lanternBloomColor || '#ffd978'}aa`);
    grd.addColorStop(1, 'rgba(255,217,120,0)');
    ctx.save(); ctx.globalAlpha = on; ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h); ctx.restore();
  }

  static foreground(ctx, w, h, t, wind) {
    ctx.save(); ctx.fillStyle = 'rgba(21,45,35,.42)'; ctx.fillRect(0, h * .86, w, h * .14);
    for (let i = 0; i < 16; i++) {
      const x = i * w / 15, lean = Math.sin(t * 2 + i) * 12 * wind;
      ctx.strokeStyle = '#244332'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + lean, h * .91, x + lean * 1.5, h * .84); ctx.stroke();
    }
    ctx.restore();
  }
}

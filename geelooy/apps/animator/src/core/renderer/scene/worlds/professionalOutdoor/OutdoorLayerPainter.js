// B"H

export class OutdoorLayerPainter {
  static render(ctx, w, h, camera = {}, time = 0) {
    this.valley(ctx, w, h, camera, .14);
    this.roofs(ctx, w, h, camera, .26);
    this.arches(ctx, w, h, camera, .48, time * .001);
    this.plaza(ctx, w, h);
  }

  static move(ctx, camera, depth) { ctx.translate(-(camera.x || 0) * depth, 0); }

  static valley(ctx, w, h, camera, depth) {
    ctx.save(); this.move(ctx, camera, depth); ctx.fillStyle = 'rgba(100,135,160,.42)';
    ctx.beginPath(); ctx.moveTo(-w, h * .49);
    for (let i = -1; i <= 7; i++) ctx.quadraticCurveTo(w * (i + .2), h * .36, w * (i + .58), h * .5);
    ctx.lineTo(w * 3, h); ctx.lineTo(-w, h); ctx.fill(); ctx.restore();
  }

  static roofs(ctx, w, h, camera, depth) {
    ctx.save(); this.move(ctx, camera, depth);
    for (let i = -2; i < 10; i++) {
      const x = i * w * .16, y = h * (.45 + (i % 2) * .025);
      ctx.fillStyle = ['#29354b', '#39445d', '#243044'][Math.abs(i) % 3]; ctx.fillRect(x, y, w * .12, h * .12);
      ctx.fillStyle = '#1b2134'; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + w * .06, y - h * .065); ctx.lineTo(x + w * .13, y); ctx.fill();
    }
    ctx.restore();
  }

  static arches(ctx, w, h, camera, depth, t) {
    ctx.save(); this.move(ctx, camera, depth); ctx.strokeStyle = '#53606b'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = w * (.2 + i * .2); ctx.beginPath(); ctx.moveTo(x - 62, h * .62); ctx.quadraticCurveTo(x, h * .35, x + 62, h * .62); ctx.stroke();
      ctx.fillStyle = i % 2 ? '#315f7f' : '#a8425d'; ctx.fillRect(x - 42, h * (.36 + .01 * Math.sin(t + i)), 84, 16);
    }
    ctx.restore();
  }

  static plaza(ctx, w, h) {
    ctx.fillStyle = '#39484d'; ctx.fillRect(-w, h * .61, w * 3, h);
    ctx.strokeStyle = 'rgba(230,240,250,.12)'; ctx.lineWidth = 2;
    for (let y = h * .64; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + 10); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,180,220,.28)'; ctx.beginPath(); ctx.ellipse(w * .46, h * .75, w * .18, h * .045, 0, 0, Math.PI * 2); ctx.fill();
  }
}

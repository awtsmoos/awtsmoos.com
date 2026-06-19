// B"H

/**
 * Production room backdrop: an authored 2D set that covers every mobile camera
 * move. The Awtsmoos breathes through shelves, frames, lamps, curtains, cups,
 * books, table grain, and the quiet dignity of a room that is no longer empty.
 */
export class FoodKitchenBackdrop {
  static render(ctx, scene = {}, w, h, time = 0) {
    const top = -h * 3;
    const bottom = h * 3;
    this.wall(ctx, w, h, top, bottom);
    this.paneling(ctx, w, h, top, bottom);
    this.window(ctx, w, h, time);
    this.bookcases(ctx, w, h);
    this.wallFrames(ctx, w, h);
    this.table(ctx, w, h);
    this.tableDetails(ctx, w, h, time);
    this.foregroundFloor(ctx, w, h);
  }

  static wall(ctx, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, '#f9dfae');
    g.addColorStop(0.52, '#ffe9bd');
    g.addColorStop(1, '#d9954e');
    ctx.fillStyle = g;
    ctx.fillRect(-w * 2, top, w * 5, bottom - top);
  }

  static paneling(ctx, w, h, top, bottom) {
    ctx.fillStyle = '#9b5d2d';
    ctx.fillRect(-w * 2, h * 0.48, w * 5, 18);
    ctx.fillStyle = '#b86f36';
    ctx.fillRect(-w * 2, h * 0.50, w * 5, h * 0.28);
    ctx.strokeStyle = 'rgba(95,48,18,.28)';
    ctx.lineWidth = 2;
    for (let y = h * 0.56; y < h * 1.45; y += 54) this.line(ctx, -w, y, w * 2, y);
    for (let x = -w; x < w * 2; x += 82) this.line(ctx, x, h * 0.5, x, h * 0.9);
    ctx.strokeStyle = 'rgba(140,75,30,.16)';
    for (let y = top; y < h * 0.48; y += 46) this.line(ctx, -w, y, w * 2, y);
  }

  static window(ctx, w, h, time) {
    const x = w * 0.58, y = -h * 0.12, ww = w * 0.34, hh = h * 0.24;
    ctx.fillStyle = '#83d3ff';
    ctx.fillRect(x, y, ww, hh);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.fillRect(x + 8, y + 8, ww - 16, hh * 0.22);
    ctx.strokeStyle = '#5a3418';
    ctx.lineWidth = 8;
    ctx.strokeRect(x, y, ww, hh);
    ctx.lineWidth = 4;
    this.line(ctx, x + ww / 2, y, x + ww / 2, y + hh);
    this.line(ctx, x, y + hh / 2, x + ww, y + hh / 2);
    ctx.fillStyle = '#ffe773';
    this.circle(ctx, x + ww * 0.78, y + hh * 0.28 + Math.sin(time * 0.001) * 2, 20);
    ctx.fillStyle = '#6c421f';
    ctx.fillRect(x - 18, y - 22, ww + 36, 18);
    ctx.fillStyle = '#a5652d';
    ctx.fillRect(x - 14, y - 16, 22, hh + 46);
    ctx.fillRect(x + ww - 8, y - 16, 22, hh + 46);
  }

  static bookcases(ctx, w, h) {
    this.shelf(ctx, w * 0.05, h * 0.06, w * 0.36, ['#b22222', '#2f9a66', '#f0c34e', '#2f7ed8', '#7348a8']);
    this.shelf(ctx, w * 0.1, -h * 0.18, w * 0.32, ['#2f7ed8', '#d69a2d', '#7d4425', '#4b8f5c']);
    this.shelf(ctx, w * 0.62, h * 0.17, w * 0.26, ['#1f335c', '#814020', '#2f9a66', '#f0c34e']);
    this.plant(ctx, w * 0.48, h * 0.08, 1.1);
    this.plant(ctx, w * 0.88, h * 0.36, 0.85);
  }

  static shelf(ctx, x, y, width, colors) {
    ctx.fillStyle = '#7b421f';
    ctx.fillRect(x, y, width, 9);
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      const bw = 18 + (i % 2) * 5;
      ctx.fillRect(x + 24 + i * 35, y - 42 + (i % 3) * 6, bw, 42 - (i % 2) * 7);
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(x + 28 + i * 35, y - 36 + (i % 3) * 6, 3, 27);
    });
  }

  static wallFrames(ctx, w, h) {
    this.frame(ctx, w * 0.46, -h * 0.2, 82, 62, '#f4e5ba');
    this.frame(ctx, w * 0.08, h * 0.25, 92, 54, '#dbeab8');
    this.frame(ctx, w * 0.77, h * 0.31, 110, 58, '#fff1b8');
    ctx.fillStyle = '#5a3418';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('B"H', w * 0.46 + 28, -h * 0.2 + 34);
  }

  static frame(ctx, x, y, ww, hh, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, ww, hh);
    ctx.strokeStyle = '#6b3a1c';
    ctx.lineWidth = 5;
    ctx.strokeRect(x, y, ww, hh);
  }

  static table(ctx, w, h) {
    const y = h * 0.42;
    ctx.fillStyle = '#6f3b1b';
    ctx.fillRect(-w, y, w * 3, 20);
    ctx.fillStyle = '#a9652f';
    ctx.fillRect(-w, y + 18, w * 3, 86);
    ctx.fillStyle = '#c17b3b';
    ctx.fillRect(-w, y + 25, w * 3, 8);
    ctx.strokeStyle = 'rgba(70,35,14,.28)';
    for (let x = -w; x < w * 2; x += 140) this.line(ctx, x, y + 28, x + 100, y + 28);
  }

  static tableDetails(ctx, w, h, time) {
    const y = h * 0.42;
    this.plate(ctx, w * 0.45, y + 36, 60);
    this.cup(ctx, w * 0.33, y + 20, '#f8f1e5');
    this.book(ctx, w * 0.54, y + 30, '#1c2c4a');
    this.book(ctx, w * 0.61, y + 40, '#704020');
    this.food(ctx, w * 0.41 + Math.sin(time * 0.002) * 2, y + 32);
    this.food(ctx, w * 0.51, y + 28);
    this.lamp(ctx, w * 0.2, y - 6);
  }

  static foregroundFloor(ctx, w, h) {
    ctx.fillStyle = '#d99b54';
    ctx.fillRect(-w, h * 0.78, w * 3, h * 2);
    ctx.fillStyle = 'rgba(90,45,18,.16)';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.92, w * 0.34, h * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  static plant(ctx, x, y, s) {
    ctx.fillStyle = '#6b3a1c';
    ctx.fillRect(x - 12 * s, y + 18 * s, 24 * s, 24 * s);
    ctx.fillStyle = '#2f8a3e';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(x + (i - 3) * 6 * s, y + (i % 2) * 6 * s, 18 * s, 7 * s, (i - 3) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static plate(ctx, x, y, r) { ctx.fillStyle = '#f8fbff'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#8aa'; ctx.lineWidth = 2; ctx.stroke(); }
  static cup(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x - 14, y - 20, 28, 34); ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 3; ctx.strokeRect(x - 14, y - 20, 28, 34); }
  static book(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x - 35, y - 12, 70, 24); ctx.strokeStyle = '#3a210f'; ctx.lineWidth = 3; ctx.strokeRect(x - 35, y - 12, 70, 24); }
  static food(ctx, x, y) { ctx.fillStyle = '#d63d32'; this.circle(ctx, x, y, 13); ctx.fillStyle = '#4a9a45'; ctx.beginPath(); ctx.ellipse(x + 10, y - 11, 9, 4, -0.4, 0, Math.PI * 2); ctx.fill(); }
  static lamp(ctx, x, y) { ctx.fillStyle = '#f7d56a'; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y); ctx.lineTo(x + 12, y - 32); ctx.lineTo(x - 12, y - 32); ctx.fill(); ctx.fillStyle = '#5a3418'; ctx.fillRect(x - 4, y, 8, 42); }
  static circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  static line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
}

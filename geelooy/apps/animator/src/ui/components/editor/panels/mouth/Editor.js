/* B”H */
import { MOUTH_PRESETS } from '../../../../../character/data/mouthPresets.js';

export class MouthPathEditor {
  constructor(state) {
    this.state = state;
    this.points = JSON.parse(JSON.stringify(MOUTH_PRESETS.neutral));
    this.activePoint = null;
    this.activeType = null;
  }

  render() {
    return `
      <div class="mouth-editor" style="padding: 1rem; background: var(--bg-secondary); border: var(--border-thick) solid var(--border-color); border-radius: var(--border-radius); margin-top: 1rem;">
        <h3 style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-primary); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.1em;">MOUTH_ARCHITECT_v3</h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
          ${Object.keys(MOUTH_PRESETS).map(p => `
            <button class="btn btn-sm preset-btn" data-preset="${p}" style="font-size: 0.5rem;">${p.toUpperCase()}</button>
          `).join('')}
        </div>

        <div class="mouth-canvas-container" style="background: #000; border: 1px solid var(--border-color); margin-bottom: 1rem; position: relative; overflow: hidden; height: 150px;">
          <canvas id="mouth-editor-canvas" width="600" height="400" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>
        
        <div class="editor-controls" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="save-mouth-btn" class="btn btn-primary" style="width: 100%; font-size: 0.7rem;">SEAL_GEOMETRY</button>
        </div>
      </div>
    `;
  }

  attach(container) {
    const canvas = container.querySelector('#mouth-editor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Path
      ctx.beginPath();
      this.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.bezierCurveTo(p.cp1x, p.cp1y, p.cp2x, p.cp2y, p.endX, p.endY);
      });
      ctx.strokeStyle = 'var(--accent-primary)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Controls
      this.points.forEach((p, i) => {
        this.drawPoint(ctx, p.x, p.y, i, 'start');
        if (p.cp1x !== undefined) {
          this.drawPoint(ctx, p.cp1x, p.cp1y, i, 'cp1', true);
          this.drawPoint(ctx, p.cp2x, p.cp2y, i, 'cp2', true);
          this.drawPoint(ctx, p.endX, p.endY, i, 'end');
        }
      });
    };

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.points = JSON.parse(JSON.stringify(MOUTH_PRESETS[btn.dataset.preset]));
        draw();
      });
    });

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      
      this.findActivePoint(mx, my);
      draw();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.activePoint === null) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      const p = this.points[this.activePoint];
      if (this.activeType === 'start') { p.x = mx; p.y = my; }
      else if (this.activeType === 'cp1') { p.cp1x = mx; p.cp1y = my; }
      else if (this.activeType === 'cp2') { p.cp2x = mx; p.cp2y = my; }
      else if (this.activeType === 'end') { p.endX = mx; p.endY = my; }
      draw();
    });

    window.addEventListener('mouseup', () => { this.activePoint = null; });

    container.querySelector('#save-mouth-btn').addEventListener('click', () => {
      const char = this.state.get('character');
      char.customMouth = this.points;
      this.state.set('character', char);
    });

    draw();
  }

  drawPoint(ctx, x, y, index, type, isControl = false) {
    ctx.fillStyle = (this.activePoint === index && this.activeType === type) ? '#fff' : (isControl ? '#ef4444' : 'var(--accent-primary)');
    ctx.beginPath();
    ctx.arc(x, y, isControl ? 4 : 6, 0, Math.PI * 2);
    ctx.fill();
  }

  findActivePoint(mx, my) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (Math.hypot(p.x - mx, p.y - my) < 10) { this.activePoint = i; this.activeType = 'start'; return; }
      if (p.cp1x !== undefined) {
        if (Math.hypot(p.cp1x - mx, p.cp1y - my) < 10) { this.activePoint = i; this.activeType = 'cp1'; return; }
        if (Math.hypot(p.cp2x - mx, p.cp2y - my) < 10) { this.activePoint = i; this.activeType = 'cp2'; return; }
        if (Math.hypot(p.endX - mx, p.endY - my) < 10) { this.activePoint = i; this.activeType = 'end'; return; }
      }
    }
  }
}

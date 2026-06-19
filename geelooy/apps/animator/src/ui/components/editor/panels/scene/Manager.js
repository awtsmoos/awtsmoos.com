
/* B”H */
export class SceneManager {
  constructor(state) {
    this.state = state;
  }

  render() {
    return `
      <div class="scene-manager" style="padding: 1rem; background: var(--bg-secondary); border-radius: 20px; border: 1px solid var(--border-color);">
        <h3 style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 1.5rem; text-align: center;">ENVIRONMENT_CONTROL</h3>
        
        <div class="control-group" style="display: flex; flex-direction: column; gap: 1rem;">
          
          <label style="font-size: 0.6rem; color: var(--text-muted); font-weight: bold;">CANVAS_RESOLUTION</label>
          <select id="canvas-resolution-select" class="select-input" style="background: #111; color: #fff; border: 1px solid var(--accent-primary); padding: 0.5rem;">
            <option value="1920x1080">16:9 Widescreen (1920x1080)</option>
            <option value="1080x1920">9:16 TikTok (1080x1920)</option>
            <option value="1080x1080">1:1 Square (1080x1080)</option>
            <option value="2560x1440">21:9 UltraWide (2560x1440)</option>
          </select>

          <label style="font-size: 0.6rem; color: var(--text-muted); font-weight: bold; margin-top: 1rem;">TIME_OF_DAY</label>
          <div class="time-presets" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
            <button class="time-btn btn btn-sm" data-time="0.1">☀️ DAY</button>
            <button class="time-btn btn btn-sm" data-time="0.5">🌅 DUSK</button>
            <button class="time-btn btn btn-sm" data-time="0.8">🌙 NIGHT</button>
          </div>
          
          <button id="add-mountain-btn" class="btn btn-primary" style="font-size: 0.7rem; margin-top: 1rem;">⛰️ ADD_MOUNTAIN</button>
          <button id="add-cloud-btn" class="btn btn-primary" style="font-size: 0.7rem;">☁️ ADD_CLOUD</button>
          <button id="add-tree-btn" class="btn btn-primary" style="font-size: 0.7rem;">🌳 ADD_TREE</button>
        </div>
      </div>
    `;
  }

  attach(container) {
    const resSelect = container.querySelector('#canvas-resolution-select');
    if (resSelect) {
      resSelect.addEventListener('change', (e) => {
        const [w, h] = e.target.value.split('x').map(Number);
        // Dispatch the intention to reshape reality
        this.state.notify('canvas_resolution_changed', { w, h });
      });
    }

    container.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scene = this.state.get('scene');
        scene.timeOfDay = parseFloat(btn.dataset.time);
        this.state.set('scene', scene);
      });
    });

    container.querySelector('#add-mountain-btn').addEventListener('click', () => {
      const scene = this.state.get('scene');
      scene.mountains.push({ x: Math.random() * 800, y: 400, w: 200 + Math.random() * 400, h: 200 + Math.random() * 300, color: '#222' });
      this.state.set('scene', scene);
    });

    container.querySelector('#add-cloud-btn').addEventListener('click', () => {
      const scene = this.state.get('scene');
      scene.clouds.push({ x: Math.random() * 800, y: 50 + Math.random() * 150, s: 30 + Math.random() * 50 });
      this.state.set('scene', scene);
    });

    container.querySelector('#add-tree-btn').addEventListener('click', () => {
      const scene = this.state.get('scene');
      scene.foliage.push({ x: Math.random() * 800, y: 500 + Math.random() * 50, size: 60 + Math.random() * 60 });
      this.state.set('scene', scene);
    });
  }
}

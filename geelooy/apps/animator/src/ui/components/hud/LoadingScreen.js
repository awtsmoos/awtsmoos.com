
/* B”H */

/**
 * @class LoadingScreen
 * @description
 * THE VEIL OF EMANATION (Tzimtzum).
 * An extreme, immersive boot sequence. It simulates the descent of light 
 * through the Four Worlds (Atzilut, Briah, Yetzirah, Assiyah) before 
 * the application manifests in the physical UI.
 * 
 * It binds itself to the body instantly upon conception, ensuring that 
 * even if a downstream error occurs, the user is not left staring into 
 * the unformed Tohu (Chaos) of an empty screen.
 */
export class LoadingScreen {
  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'loading-screen';
    this.element.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; z-index: 9999; color: #00ff88;
      font-family: 'JetBrains Mono', monospace;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      overflow: hidden;
    `;
    
    this.element.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.1) 2px, rgba(0,255,136,0.1) 4px); pointer-events: none;"></div>
      <div style="text-align: center; z-index: 10; max-width: 800px;">
        <h1 style="font-size: 3rem; letter-spacing: 0.5rem; text-shadow: 0 0 20px #00ff88; margin-bottom: 0;">PARK_CREATOR</h1>
        <h2 style="font-size: 1rem; color: #fff; letter-spacing: 0.2em; margin-bottom: 2rem;">SEDER_HISTALSHELUS_INIT</h2>
        
        <div style="width: 400px; height: 2px; background: #222; margin: 0 auto; position: relative; overflow: hidden;">
          <div id="loading-bar" style="width: 0%; height: 100%; background: #00ff88; box-shadow: 0 0 10px #00ff88; transition: width 0.1s linear;"></div>
        </div>
        
        <div id="loading-log" style="margin-top: 1.5rem; font-size: 0.7rem; text-align: left; height: 100px; overflow: hidden; opacity: 0.8; line-height: 1.5;"></div>
      </div>
    `;
    
    this.bar = this.element.querySelector('#loading-bar');
    this.log = this.element.querySelector('#loading-log');
    this.messages = [];
  }

  update(progress, message) {
    if (this.bar) this.bar.style.width = `${progress}%`;
    if (this.log) {
      this.messages.push(`> [${Date.now()}] ${message}`);
      if (this.messages.length > 6) this.messages.shift();
      this.log.innerHTML = this.messages.join('<br>');
    }
  }

  remove() {
    this.element.style.opacity = '0';
    this.element.style.transform = 'scale(1.1)';
    this.element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      if (this.element.parentNode) this.element.remove();
    }, 600);
  }
}

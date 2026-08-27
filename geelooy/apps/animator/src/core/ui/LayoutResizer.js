
/**
 * @file LayoutResizer.js
 * @description
 * THE PILLARS OF GEVURAH (Boundaries).
 * B"H
 * This module is responsible for the physical resizing of the UI container. 
 * It targets the 'h-resizer' and 'v-resizer' elements, allowing the user 
 * to drag them to reshape the universe.
 */

export class LayoutResizer {
  /**
   * Initializes the resizer bindings.
   */
  static init() {
    console.log('B"H - 📐 [LayoutResizer] Empowering the Pillars of Separation.');

    let isResizingH = false;
    const root = document.documentElement;

    const bindH = () => {
      const hResizer = document.getElementById('h-resizer');
      if (!hResizer) return false;

      hResizer.addEventListener('mousedown', (e) => {
        isResizingH = true;
        document.body.style.cursor = 'row-resize';
        
        // Manifest the Shield: Prevents other elements from stealing focus
        let shield = document.getElementById('drag-shield');
        if (!shield) {
          shield = document.createElement('div');
          shield.id = 'drag-shield';
          shield.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;cursor:row-resize;';
          document.body.appendChild(shield);
        }
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingH) return;
        const newHeight = window.innerHeight - e.clientY;
        
        // Tzimtzum Hard Limits
        if (newHeight > 40 && newHeight < window.innerHeight * 0.85) {
          root.style.setProperty('--timeline-h', `${newHeight}px`);
        }
      });

      window.addEventListener('mouseup', () => {
        if (isResizingH) {
          isResizingH = false;
          document.body.style.cursor = 'default';
          const shield = document.getElementById('drag-shield');
          if (shield) shield.remove();
        }
      });

      return true;
    };

    // Periodically check if the DOM elements are manifest
    const attemptBind = () => {
      if (bindH()) {
        console.log('B"H - Resizer successfully bound.');
      } else {
        setTimeout(attemptBind, 500);
      }
    };

    attemptBind();
  }
}

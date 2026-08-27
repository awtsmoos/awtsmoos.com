
// B"H
/**
 * @file AwtsmoosResizer.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 9: THE UNBREAKABLE GRIP (Achiza Lo Nishberet)
 * ============================================================================
 * Previously, the user would attempt to drag the UI resizer, their mouse would 
 * slip 1 pixel off the bar or leave the browser window entirely, and the UI 
 * would permanently freeze to their cursor in a broken state.
 * 
 * We invoke the modern `setPointerCapture` API. This is the absolute grip. 
 * Once the user clicks the resizer, the browser physically binds ALL mouse 
 * events to that element, even if the mouse leaves the application entirely.
 * The resize cannot break. The limits of Gevurah are absolute.
 * ============================================================================
 */

export class AwtsmoosResizer {
  /**
   * @function bindHorizontal
   * @description Locks the vertical boundary (Timeline Height)
   */
  static bindHorizontal(resizerId) {
    const handle = document.getElementById(resizerId);
    if (!handle) return;

    let isResizing = false;

    handle.addEventListener('pointerdown', (e) => {
      isResizing = true;
      // THE IRON GRIP
      handle.setPointerCapture(e.pointerId);
      document.body.style.cursor = 'row-resize';
    });

    handle.addEventListener('pointermove', (e) => {
      if (!isResizing) return;
      // Dvh compatibility: Calculate height reliably
      const newHeight = window.innerHeight - e.clientY;
      
      // Tzimtzum Constraints
      if (newHeight >= 50 && newHeight <= window.innerHeight * 0.8) {
        document.documentElement.style.setProperty('--timeline-h', `${newHeight}px`);
      }
    });

    const stopResize = (e) => {
      if (!isResizing) return;
      isResizing = false;
      handle.releasePointerCapture(e.pointerId);
      document.body.style.cursor = 'default';
    };

    handle.addEventListener('pointerup', stopResize);
    handle.addEventListener('pointercancel', stopResize); // Fires if browser interrupts
  }
}

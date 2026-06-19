
/**
 * @file TimelineResizer.js
 * @description
 * THE PILLAR OF RESTRICTION (Amud HaGevurah).
 * B"H
 * Just as the Awtsmoos established boundaries for the oceans, this module 
 * establishes the flexible boundaries of the Timeline. 
 * It enables the human operator to grasp the edge of time and pull it 
 * into the desired proportion, balancing the tools of creation with the stage of action.
 */

export class TimelineResizer {
  /**
   * Binds the resizing spirit to the physical handle.
   * @param {HTMLElement} handle - The manifest div to be grasped.
   * @param {HTMLElement} container - The root vessel of the timeline.
   */
  static bind(handle, container) {
    if (!handle || !container) return;

    let isResizing = false;

    const onMouseDown = (e) => {
      isResizing = true;
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      
      // The Shield of Protection: Prevents other interactions during the resize
      let shield = document.getElementById('resize-shield');
      if (!shield) {
        shield = document.createElement('div');
        shield.id = 'resize-shield';
        shield.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;cursor:row-resize;';
        document.body.appendChild(shield);
      }
    };

    const onMouseMove = (e) => {
      if (!isResizing) return;
      
      // Calculate height from the bottom of the viewport
      const newHeight = window.innerHeight - e.clientY;
      
      // Tzimtzum Constraints: Ensure the timeline doesn't vanish or swallow the world.
      if (newHeight > 60 && newHeight < window.innerHeight * 0.8) {
        container.style.height = `${newHeight}px`;
        // Sync the global CSS variable so the grid layout respects the change
        document.documentElement.style.setProperty('--timeline-h', `${newHeight}px`);
      }
    };

    const onMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      const shield = document.getElementById('resize-shield');
      if (shield) shield.remove();
    };

    handle.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}


// B"H
export class ScrubManager {
  static bind(viewport, core, state) {
    if (!viewport) return;

    let isScrubbing = false;

    const handleDown = (e) => {
      if (e.target.closest('.nle-clip') || e.target.closest('button')) return;
      isScrubbing = true;
      if (core.director && core.director.isPlaying) {
        core.director.stop();
        state.set('isPlaying', false);
      }
      this.updateTimeFromMouse(e, viewport, core, state);
    };

    viewport.addEventListener('mousedown', handleDown);
    
    const ruler = document.getElementById('nle-ruler-mount');
    if (ruler) ruler.addEventListener('mousedown', handleDown);

    window.addEventListener('mousemove', (e) => {
      if (!isScrubbing) return;
      this.updateTimeFromMouse(e, viewport, core, state);
    });

    window.addEventListener('mouseup', () => { isScrubbing = false; });
    window.addEventListener('mouseleave', () => { isScrubbing = false; });
  }

  static updateTimeFromMouse(e, viewport, core, state) {
    const rect = viewport.getBoundingClientRect();
    const absoluteX = (e.clientX - rect.left) + viewport.scrollLeft - 200;
    
    if (absoluteX < 0) return; 
    
    const timeMs = core.pixelsToTime(absoluteX);
    state.notify('nle_scrubbed', timeMs);
    core.seek(timeMs);
  }
}

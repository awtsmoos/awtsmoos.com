
/**
 * @class ScrubManager
 * @description
 * THE CHURNER OF TIME (Galgal HaZman).
 * B"H
 * Handles the interaction of scrubbing the playhead across the timeline.
 * 
 * RECTIFICATION (The Cacophony of Voices):
 * When scrubbing across Speech nodes, the `VocalSystem` thinks the character 
 * is talking. We now inject `window.AWTSMOOS_IS_SCRUBBING` so the SpeechSynth 
 * engine knows to remain dead silent until time flows naturally again.
 */
export class ScrubManager {
  static bind(viewport, core, state) {
    if (!viewport) return;

    let isScrubbing = false;

    const handleDown = (e) => {
      if (e.target.closest('.nle-clip') || e.target.closest('button')) return;
      isScrubbing = true;
      window.AWTSMOOS_IS_SCRUBBING = true; // B"H - Silence the Heavens
      
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

    const endScrub = () => { 
      isScrubbing = false; 
      window.AWTSMOOS_IS_SCRUBBING = false;
      // Cancel any stuck synthesized voices immediately
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };

    window.addEventListener('mouseup', endScrub);
    window.addEventListener('mouseleave', endScrub);
  }

  static updateTimeFromMouse(e, viewport, core, state) {
    const rect = viewport.getBoundingClientRect();
    
    // The width of the static track headers
    const headerWidth = 200;
    const absoluteX = (e.clientX - rect.left) + viewport.scrollLeft - headerWidth;
    
    if (absoluteX < 0) {
      core.seek(0);
      state.notify('nle_scrubbed', 0);
      return;
    } 
    
    const timeMs = core.pixelsToTime(absoluteX);
    const finalMs = Math.min(timeMs, core.duration);
    
    state.notify('nle_scrubbed', finalMs);
    core.seek(finalMs);
  }
}

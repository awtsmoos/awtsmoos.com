// B"H
import { PersistentReality } from '../../../../../core/state/PersistentReality.js';

/**
 * Absolute reset button for returning the local universe to an empty vessel.
 */
export class TohuButton {
  static render(state, app) {
    return {
      tag: 'button',
      attr: { className: 'btn tohu-button' },
      children: '☢ INITIATE TOHU (WIPE UNIVERSE)',
      events: {
        click: () => {
          const confirmWipe = confirm('B"H\nAre you sure you want to withdraw the letters of creation? All characters, all scenes, and all history will be permanently annihilated.');
          if (!confirmWipe) return;

          if (app && app.director) {
            app.director.stop();
            state.set('isPlaying', false);
          }

          state.set('activeSequence', { duration: 10000, events: [] });
          state.set('characters', {});
          state.set('scene', { timeOfDay: 0.5, mountains: [], buildings: [], foliage: [], props: [] });
          PersistentReality.obliterate();
          if (app && app.timeline) app.timeline.refreshTracks();

          const panel = document.getElementById('prop-panel');
          if (panel) panel.classList.remove('visible');
          alert('B"H\nThe universe has returned to Tohu Va-Vohu. It is as if nothing ever existed.');
        }
      }
    };
  }
}

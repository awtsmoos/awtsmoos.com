/* B"H */
import { InspectorPanel } from '../manifest/inspector/InspectorPanel.js';

/**
 * @class ClipSelector
 * @description
 * THE CHOOSER OF SPARKS (Bocher HaNitzotzot).
 * B"H - Binds click events to the NLE viewport, detecting which clip-spark
 * the user has selected, and opening the Inspector Panel to reveal its
 * inner properties. The soul of the clip is laid bare before the inspector.
 */
export class ClipSelector {
  static bind(viewport, state, app) {
    if (!viewport) return;

    viewport.addEventListener('click', (e) => {
      const panel = document.getElementById('prop-panel');
      const clipEl = e.target.closest('.nle-clip');

      if (!clipEl) {
        viewport.querySelectorAll('.nle-clip.selected').forEach(c => c.classList.remove('selected'));
        if (panel) panel.classList.remove('visible');
        return;
      }

      if (clipEl.classList.contains('selected')) {
        clipEl.classList.remove('selected');
        if (panel) panel.classList.remove('visible');
        return;
      }

      const rawData = clipEl.dataset.eventData;
      if (!rawData) return;

      try {
        const eventData = JSON.parse(decodeURIComponent(rawData));

        viewport.querySelectorAll('.nle-clip.selected').forEach(c => c.classList.remove('selected'));
        clipEl.classList.add('selected');

        if (panel) {
          panel.classList.add('visible');
          const contentArea = panel.querySelector('.prop-content');
          InspectorPanel.show(eventData, contentArea, state, app);
        }
      } catch (err) {
        console.error('B"H - Failed to read the essence of the selected spark.', err);
      }
    });
  }
}
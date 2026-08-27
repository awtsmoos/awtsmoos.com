
/* B”H */
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class TitleGraphBuilder
 * @description
 * THE DECLARATION OF NAMES.
 * Now receives absolute dimensions from the universe, guaranteeing perfect centering.
 */
export class TitleGraphBuilder {
  /**
   * Scans the active sequence for titles occurring at the current Director Time.
   * 
   * @param {Object} sequence - The script of existence.
   * @param {number} currentTime - The exact millisecond of eternity.
   * @param {number} width - The physical width of the canvas.
   * @param {number} height - The physical height of the canvas.
   * @returns {Object} A Group Node containing active titles, or null.
   */
  static buildActiveTitles(sequence, currentTime, width, height) {
    if (!sequence || !sequence.events) return null;

    const activeTitles = sequence.events.filter(e => e.type === 'title' && currentTime >= e.start && currentTime <= e.end);
    if (activeTitles.length === 0) return null;

    const nodes = [];

    activeTitles.forEach(title => {
      const duration = title.end - title.start;
      const localTime = currentTime - title.start;
      const progress = localTime / duration;

      // Cinematic Fade In/Out
      let alpha = 1;
      if (progress < 0.1) alpha = progress / 0.1; 
      else if (progress > 0.9) alpha = (1 - progress) / 0.1;

      // Typographic Intensity
      const scale = 1 + (progress * 0.15);

      // Dark Overlay to obscure the world behind the text (Encompasses entire void)
      nodes.push(G.rect(`title_bg_${title.id}`, 0, 0, width, height, {
        fill: title.bgColor || 'rgba(0,0,0,0.85)',
        alpha: alpha
      }));

      // The Majestic Words (Centered perfectly in the provided width/height)
      nodes.push(G.group(`title_text_grp_${title.id}`, { x: width / 2, y: height / 2, scaleX: scale, scaleY: scale }, [
        G.text(`title_main_${title.id}`, title.text || 'UNTITLED EPOCH', 0, -20, {
          fill: title.color || '#00ffcc',
          font: '900 80px "Space Grotesk", sans-serif',
          textShadow: 'rgba(0,255,204,0.8)',
          alpha: alpha
        }),
        G.text(`title_sub_${title.id}`, title.subtext || '', 0, 40, {
          fill: '#ffffff',
          font: '600 30px "JetBrains Mono", monospace',
          textShadow: 'rgba(255,255,255,0.5)',
          alpha: alpha * 0.7
        })
      ]));
    });

    return G.group('cinematic_titles', null, nodes);
  }
}

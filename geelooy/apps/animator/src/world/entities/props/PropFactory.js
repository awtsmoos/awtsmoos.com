
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { PropRegistry } from './PropRegistry.js';
import { ProceduralNatureForge } from '../../generation/nature/ProceduralNatureForge.js';
import { ProceduralCityForge } from '../../generation/urban/ProceduralCityForge.js';

/**
 * @class PropFactory
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 30: THE MASTER MANIFESTOR (Yotzer HaKhol)
 * ═══════════════════════════════════════════════════════════════
 */
export class PropFactory {
  static build(propData, transform, time = 0, parentChar = null) {
    if (!propData) return null;

    if (propData.nodes && Array.isArray(propData.nodes)) {
      return G.group(propData.id, transform, propData.nodes);
    }

    if (propData.emoji) {
      return G.group(propData.id, transform, [
        G.text('emoji_node', propData.emoji, 0, 0, { 
          font: `${(propData.size || 50)}px sans-serif`, 
          align: 'center', 
          baseline: 'bottom' 
        })
      ]);
    }

    const type = propData.type || propData.propType || 'unknown';

    if (['tree', 'bush', 'plant', 'pine', 'palm', 'oak'].includes(type)) {
       return ProceduralNatureForge.build(propData, transform, time);
    }

    if (['house', 'skyscraper', 'building', 'cyberpunk'].includes(type)) {
       return ProceduralCityForge.build(propData, transform, time);
    }

    const Builder = PropRegistry.get(type);
    if (Builder) {
      return Builder.build(propData, transform, time, parentChar);
    }

    // Fallback colored box
    const label = type.slice(0, 5).toUpperCase();
    const hue = label.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360;
    return G.group(propData.id || `gen_prop_${Date.now()}`, transform, [
      G.rect('base_gen', -30, -30, 60, 60, { fill: propData.color || `hsl(${hue}, 60%, 50%)`, stroke: '#000', lineWidth: 4, radius: 8 }),
      G.text('lbl_gen', label, 0, 0, { fill: '#fff', font: 'bold 12px monospace', align: 'center' })
    ]);
  }
}

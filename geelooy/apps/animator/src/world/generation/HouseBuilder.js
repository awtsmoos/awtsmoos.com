
/* B”H */

/**
 * @class HouseBuilder
 * @description
 * The Architect of Dwellings. Converts a JSON definition of a 'house' into 
 * the exact drawing coordinates and geometric traits required by the renderer.
 * A house is a vessel for life, having walls (boundaries), windows (perception),
 * and a roof (protection from the infinite light).
 */
export class HouseBuilder {
  /**
   * Converts raw JSON properties into a structured house entity.
   * 
   * @param {Object} data - The blueprint properties (width, height, floors).
   * @returns {Object} The complete house entity.
   */
  static build(data) {
    const width = data.width || 150;
    const height = data.height || 120;
    const floors = data.floors || 1;
    const color = data.color || '#5c4033';
    
    // Generate Window data based on width and floors
    const windows =[];
    const windowCols = Math.floor(width / 40);
    
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < windowCols; c++) {
        windows.push({
          x: 10 + (c * 40),
          y: -height + 20 + (f * 50),
          w: 20,
          h: 30,
          lit: Math.random() > 0.3
        });
      }
    }

    return {
      id: data.id || `house_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: 'house',
      x: data.x || 0,
      y: data.y || 0,
      w: width,
      h: height * floors,
      color: color,
      roofType: data.roofType || 'triangle',
      windows: windows,
      door: {
        x: width / 2 - 15,
        y: -40,
        w: 30,
        h: 40
      }
    };
  }
}

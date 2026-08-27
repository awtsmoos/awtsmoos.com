
/* B”H */
import { seededRandom } from '../../utils/random.js';

export class BuildingGenerator {
  static generate(ctx, x, y, w, h, baseColor, timeOfDay = 0) {
    ctx.save();
    ctx.translate(x, y);
    
    // Core concrete boundaries shading! 
    const isNight = timeOfDay > 0.5;
    const structureHue = isNight ? '#0b0c10' : (baseColor || '#445566');
    const outlineColor = isNight ? '#000000' : '#223344';

    ctx.fillStyle = structureHue;
    ctx.fillRect(0, -h, w, h);
    
    // High tier Roof Top structural aesthetics mimicking water-tanks and lips
    ctx.fillStyle = outlineColor;
    ctx.fillRect(-6, -h - 12, w + 12, 12);
    ctx.fillRect(w * 0.2, -h - 30, w * 0.2, 18);
    ctx.fillRect(w * 0.7, -h - 20, 8, 20); // Antenna pole

    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, -h, w, h);
    
    // Window matrices computed strictly via random generator matrix.
    // If it is day time, we map them as deeply black reflecting panes. 
    // At night, vibrant neon yellow glow patterns strike their logic grids.
    const paneCountRows = Math.floor(h / 35);
    const paneCountCols = Math.floor(w / 30);
    
    let seedGrid = x + y;
    
    for (let r = 0; r < paneCountRows - 1; r++) {
      for (let c = 0; c < paneCountCols; c++) {
        seedGrid += 0.245; 
        
        let paneRenderChance = seededRandom(seedGrid);
        
        if (isNight) {
           // Emitting bright electrical neon power!
           if (paneRenderChance > 0.6) {
             ctx.fillStyle = `rgba(255, 230, ${100 + paneRenderChance*100}, ${0.7 + paneRenderChance*0.3})`;
             ctx.shadowColor = ctx.fillStyle;
             ctx.shadowBlur = 8;
             ctx.fillRect(10 + c * 30, -h + 20 + r * 35, 12, 18);
             ctx.shadowBlur = 0;
           } else {
             // Dark dormant glass
             ctx.fillStyle = '#06070a';
             ctx.fillRect(10 + c * 30, -h + 20 + r * 35, 12, 18);
           }
        } else {
           // Daytime generic glass panes reflecting slight teal hues or resting purely.
           ctx.fillStyle = paneRenderChance > 0.2 ? '#223344' : '#111a22';
           ctx.fillRect(10 + c * 30, -h + 20 + r * 35, 12, 18);
        }
      }
    }
    
    ctx.restore();
  }
}

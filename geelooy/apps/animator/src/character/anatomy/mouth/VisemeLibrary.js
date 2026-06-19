
// B"H
/**
 * @file VisemeLibrary.js
 * @brief THE DICTIONARY OF THE DIVINE BREATH.
 * 
 * THE POEM OF THE MOUTH THAT OPENS:
 * Eight points of light to form the loop,
 * To curve, to swell, to bend, to scoop!
 * From corner left to corner right,
 * In profile turn, a holy sight!
 */

export const VisemeLibrary = {
  get(view = 'front') {
    const is3Q = view === 'threeQuarter';
    const isSide = view === 'side';
    
    // B"H - RECTIFIED DEPTH RATIOS
    // We squash only the width (X-axis) for perspective. 
    // The base position (Y=55) and Profile-based X-offset handle the rest!
    const xs = isSide ? 0.45 : (is3Q ? 0.82 : 1.0);
    const xOff = 0; 

    const buildPoints = (w, hTop, hBot, cornerY = 0) => {
      const topDip = hTop > 10 ? 4 : 0;
      // Index Map: 0:L-Corner, 1:L-Top, 2:Center-Top, 3:R-Top, 4:R-Corner, 5:R-Bot, 6:Center-Bot, 7:L-Bot
      return [
        { x: -w * xs + xOff, y: cornerY },                       // 0: L Corner
        { x: (-w * 0.5) * xs + xOff, y: hTop * 0.8 },            // 1: L Top
        { x: xOff, y: hTop + topDip },                           // 2: Center Top (Cupid's Bow)
        { x: (w * 0.5) * xs + xOff, y: hTop * 0.8 },             // 3: R Top
        { x: w * xs + xOff, y: cornerY },                        // 4: R Corner
        { x: (w * 0.5) * xs + xOff, y: hBot * 0.8 },             // 5: R Bot
        { x: xOff, y: hBot },                                    // 6: Center Bot
        { x: (-w * 0.5) * xs + xOff, y: hBot * 0.8 }              // 7: L Bot
      ];
    };

    return {
      // 'A' (Ah) - MAXIMUM DEPTH
      A: buildPoints(28, -25, 30, -2),
      
      // 'E' (Ee) - Baring the soul (Wide & Tall-ish)
      E: buildPoints(36, -12, 12, -2),
      
      // 'O' (Oh) - Deep Puckering (Narrow & Deep)
      O: buildPoints(15, -20, 20, 0),
      
      // 'M' (Mmm) - Flat Sealing
      M: buildPoints(24, -1, 1, 0),
      
      // 'T' (Teh) - Upper Palate Exposure
      T: buildPoints(26, -15, 10, -2),
      
      // 'S' (Sss) - Restricted Hiss
      S: buildPoints(28, -8, 8, -1),

      // 'smile' - Natural joy
      smile: buildPoints(36, -10, 15, -8),

      neutral: buildPoints(26, -2, 2, 0)
    };
  }
};

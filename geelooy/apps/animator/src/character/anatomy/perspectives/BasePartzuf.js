
/* B”H */

/**
 * @class BasePartzuf
 * @description
 * THE INFINITE COMPASS.
 */
export class BasePartzuf {
  get type() { return 'front'; }
  get dir() { return 1; }

  get head() { return { x: 0 }; }
  get body() { return { scaleX: 1 }; }
  
  get eyes() { 
    return { 
      visible: ['left', 'right'], 
      left: { x: -18, scaleX: 1 }, 
      right: { x: 18, scaleX: 1 } 
    }; 
  }
  
  get eyebrows() { 
    return { 
      visible: ['left', 'right'], 
      left: { x: -18, scaleX: 1 }, 
      right: { x: 18, scaleX: 1 } 
    }; 
  }
  
  get mouth() { return { x: 0, scaleX: 1 }; }
  get beard() { return { x: 0, scaleX: 1 }; }
  get nose() { return { x: 0 }; }
  
  get legs() { return { spread: 22 }; }
  get arms() { return { spread: 52, dirLeft: -1, dirRight: 1 }; }
  get feet() { return { angleLeft: -15, angleRight: 15, dirLeft: -1, dirRight: 1 }; }
}

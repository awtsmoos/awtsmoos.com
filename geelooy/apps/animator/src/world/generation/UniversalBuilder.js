
/* B”H */
import { ChairBuilder } from './builders/ChairBuilder.js';

/**
 * @class UniversalBuilder
 * @description
 * The 'Kli Klali' (Universal Vessel). 
 * This engine acts as the gatekeeper for all prop generation. It delegates 
 * to specialized builders to manifest complex groups from simple JSON keys.
 */
export class UniversalBuilder {
  static build(element) {
    const builders = {
      'chair': ChairBuilder
    };
    
    const builder = builders[element.type];
    if (builder) return builder.build(element);
    
    return element; // Fallback to raw data
  }
}

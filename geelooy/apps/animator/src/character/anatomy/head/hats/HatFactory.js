
// B"H
import { BeanieHat } from './types/BeanieHat.js';
import { TopHat } from './types/TopHat.js';
import { BaseballCap } from './types/BaseballCap.js';
import { CapBackward } from './types/CapBackward.js';
import { FedoraHat } from './types/FedoraHat.js';
import { StrawHat } from './types/StrawHat.js';
import { Yarmulke } from './types/Yarmulke.js';
import { ChefHat } from './types/ChefHat.js';
import { CowboyHat } from './types/CowboyHat.js';
import { CrownHat } from './types/CrownHat.js';
import { UshankaHat } from './types/UshankaHat.js';

/**
 * @class HatFactory
 * @description
 * THE FORGE OF THE CROWN (Kursa).
 * B"H
 * 
 * Maps specific UI hat identifiers to their hyper-realistic 
 * sub-module geometry generators. Every hat handles its own 
 * perspective logic (Front, Side, 3/4)!
 */
export class HatFactory {
  static route(type, data, profile, walkBob = 0, sway = 0) {
    const registry = {
      'beanie': BeanieHat,
      'topHat': TopHat,
      'baseball': BaseballCap,
      'baseballBack': CapBackward,
      'fedora': FedoraHat,
      'straw': StrawHat,
      'yarmulke': Yarmulke,
      'chef': ChefHat,
      'cowboy': CowboyHat,
      'crown': CrownHat,
      'ushanka': UshankaHat
    };

    const BuilderClass = registry[type] || null;
    
    if (BuilderClass) {
      return BuilderClass.build(data, profile, walkBob, sway);
    }
    
    console.warn(`B"H - The hat type '${type}' has not yet descended from Atzilut. Formless void returned.`);
    return null;
  }
}

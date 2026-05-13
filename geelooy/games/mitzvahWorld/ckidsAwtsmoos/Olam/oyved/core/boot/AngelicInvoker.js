
/**
 * B"H
 * @module AngelicInvoker
 * @description
 * 🕊️ CHAPTER 2: THE ANGELIC SUMMONS 🕊️
 * 
 * The Angelic Invoker descends into the ethereal file system, gathering the required 
 * Sefirot (modules) so the Worker thread can construct the physical reality. 
 * Using the precisely calculated AngelicPaths, it avoids the deadly 404 traps of the void.
 */
import { ErrorHandler } from './ErrorHandler.js';
import { ANGELIC_PATHS } from './AngelicPaths.js';

export class AngelicInvoker {
     /**
      * @method invoke
      * @description 
      * B"H
      * Draws down the Olam and Utils modules from their respective heavens.
      * @returns {Promise<Object>} The manifested modules, or a handled error state.
      */
     static async invoke() {
         try {
             // B"H: The simultaneous drawing down of the two great lights
             const [olamModule, utilsModule] = await Promise.all([
                 import(ANGELIC_PATHS.OLAM_CORE),
                 import(ANGELIC_PATHS.UNIVERSAL_UTILS)
             ]);
             
             // The angel reports its readiness to the Throne
             self.postMessage({ type: 'vessel_ready' });
             
             return { 
                 OlamClass: olamModule.default, 
                 UtilsClass: utilsModule.default, 
                 isReady: true 
             };
         } catch (err) {
             return ErrorHandler.handle(err);
         }
     }
}

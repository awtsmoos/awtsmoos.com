
/**
 * B"H
 * @module ErrorHandler
 * @description 
 * 💥 CHAPTER 3: THE FALLEN SPARKS 💥
 * 
 * Catches the shattered vessels of failed imports and broadcasts the tragedy 
 * to the main thread for debugging.
 */
export class ErrorHandler {
     static handle(err) {
         console.error('B"H - 🚨 [OYVED]: DYNAMIC IMPORT FATALITY. A Sefirah is missing from the tree!', err);
         self.postMessage({ 
             type: 'ERROR', 
             details: err.stack || err.toString(), 
             isImportError: true,
             message: `A critical framework file threw an exception inside the Worker! Please check the Network tab for any 404 paths: ${err.message}`
         });
         return { isReady: false };
     }
}


/**
 * @file IkarOyvedManager.js
 * @description
 * ⚡ THE MASTER HAND OF TRANSMISSION (METATRON) ⚡
 * 
 * Chapter 2: The Binding of Dimensions.
 * "I stood between the Lord and you at that time..." (Devarim 5:5)
 * 
 * The Manager oversees the Web Worker portal. It uses a DivineDictionary to 
 * map incoming echoes to their specific functions, removing the clutter of 
 * conditional thinking.
 * 
 * THE TIKKUN (THE FIX):
 * Ensure that `watchForSign` is correctly used during Genesis. We enforce 
 * raw, non-escaped character usage (&&) so the engine can be spoken into 
 * existence without SyntaxErrors.
 */

import BittulSoul from '../../core/BittulSoul.js';
import OyvedCommunicationProtocol from '../communications/OyvedCommunicationProtocol.js';

export default class IkarOyvedManager extends BittulSoul {
    /**
     * @constructor
     * @description Forges the bridge to the Worker.
     */
    constructor() {
        super();
        this.surrenderToAwtsmoos('IkarOyvedManager');
        
        this.commLayer = new OyvedCommunicationProtocol();
        
        /**
         * B"H: Secure Handshake Resolver
         * We define the Worker as a Module to support 'import' inside its reality.
         */
        const threadUri = new URL('../scripts/WorkerTzimtzum.js', import.meta.url);
        
        console.log(`B"H - 🌩️ Summoning spiritual labor at: ${threadUri.href}`);
        this.workerPortal = new Worker(threadUri, { type: 'module' });
        
        // Listening for messages and routing them through our protocol
        this.workerPortal.onmessage = (e) => this.commLayer.ingestTransmission(e);
        
        // Standard logging treaty
        this.commLayer.establishTreaty('worker_log', (pack) => {
            if (pack && pack.msg) console.log(pack.msg);
        });
    }

    /**
     * @method watchForSign
     * @description Creates a Promise that resolves when a specific 'type' returns from the worker.
     * @param {string} signature - The Holy Name of the signal.
     * @returns {Promise<any>}
     */
    watchForSign(signature) {
        return new Promise((resolve) => {
            console.log(`B"H - 👁️ Monitoring the void for: [${signature}]`);
            
            this.commLayer.establishTreaty(signature, (response) => {
                console.log(`B"H - ✅ Handshake finalized: [${signature}]`);
                // Once the promise is met, we return the data to the seeker.
                resolve(response);
            });
        });
    }

    /**
     * @method utterTheDivineWord
     * @description Sends a Command of Form into the lower Worker realm.
     * @param {string} actionName - The 'type' property of the message.
     * @param {Object} payload - The body of the data.
     */
    utterTheDivineWord(actionName, payload) {
         if (!this.workerPortal) return;

         console.log(`B"H - ⚡ DISPATCHING DECREE: [${actionName}]`);
         
         // Using standard property names to avoid any property-mismatch errors
         this.workerPortal.postMessage({ 
             type: actionName, 
             payload: payload 
         });
    }

    /**
     * @method closePortal
     * @description Dissolves the worker thread when the world is destroyed.
     */
    closePortal() {
        if (this.workerPortal) {
            this.workerPortal.terminate();
            console.log('B"H - 🕊️ Thread portal has returned to the Infinite.');
        }
    }
}

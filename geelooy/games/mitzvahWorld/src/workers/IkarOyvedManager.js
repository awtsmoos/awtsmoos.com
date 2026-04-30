
import BittleNullification from '../core/BittleNullification.js';

/**
 * B"H
 * @class IkarOyvedManager
 * @description
 * ⚡ THE MANAGER OF WORLDS ⚡
 * Handles the main thread's connection to the separate universe (Web Worker).
 * We were previously experiencing a "race condition", dispatching the payload
 * before the vessel was truly ready. Now, we wait for the Worker to explicitly
 * announce its nullification and readiness before speaking the "First Word".
 */
export default class IkarOyvedManager extends BittleNullification {
    constructor(workerPath) {
        super();
        this.acknowledgeAwtsmoos('IkarOyvedManager');
        console.log('B"H - Olam Worker Manager Started');
        
        this.worker = new Worker(workerPath);
        
        // We create a promise that resolves when the worker sends 'vessel_ready'
        this.vesselReadyPromise = new Promise((resolve) => {
            this.worker.addEventListener('message', (e) => {
                const data = e.data;
                if (data && data.type === 'vessel_ready') {
                    console.log(`B"H - ⚡ INTENSE LOG: Main thread acknowledges: ${data.msg}`);
                    resolve();
                } else if (data && data.type === 'worker_log') {
                    console.log(data.msg);
                }
            });
        });
    }

    /**
     * @method waitForVessel
     * @description Awaits the spiritual readiness of the worker.
     * @returns {Promise<void>}
     */
    async waitForVessel() {
        await this.vesselReadyPromise;
    }

    /**
     * @method dispatchGenesisPayload
     * @description Sends the ultimate payload to start existence.
     * @param {Object} payload 
     */
    dispatchGenesisPayload(payload) {
        console.log('B"H - ⚡ INTENSE LOG: Dispatching Creation Payload to Worker:', payload);
        this.worker.postMessage({
            type: 'pawsawch', // The First Word
            payload: payload
        });
    }
}


/**
 * B"H
 * @file OlamWorkerActionMap.js
 * 
 * A switch statement is rigid, a fixed physical structure. 
 * But a Map, an Object of pure functions, is like the 
 * fluid light of the Sephirot, adapting and routing 
 * the divine will to its correct manifestation.
 * 
 * Here, the actions sent from the Main Thread are routed 
 * to their corresponding heavy processing logic.
 */

export const OlamWorkerActionMap = {
    /**
     * Handles the initial spark of configuration.
     * @param {Object} payload 
     */
    'INIT_CONFIG': (payload) => {
        console.log(`B"H - 👷‍♂️ Worker received INIT_CONFIG. Organizing vessels...`, payload);
        self.postMessage({ type: 'PROGRESS', percent: 10, message: 'Configuration Crown Received.' });
    },

    /**
     * Handles the heavy world data.
     * @param {Object} payload 
     */
    'LOAD_WORLD_DATA': (payload) => {
        console.log(`B"H - 👷‍♂️ Worker received LOAD_WORLD_DATA. Expanding dimensions...`);
        self.postMessage({ type: 'PROGRESS', percent: 30, message: 'Processing the deep Even (Rock) structures...' });
        
        // Simulating heavy data processing via data mapping
        let totalKeys = Object.keys(payload || {}).length;
        let processedKeys = 0;

        if (totalKeys === 0) {
            self.postMessage({ type: 'PROGRESS', percent: 100, message: 'World Data Empty but Formed.' });
            self.postMessage({ type: 'READY' });
            return;
        }

        // Pure Data processing simulation
        const processedWorld = {};
        Object.entries(payload).forEach(([key, value]) => {
            processedKeys++;
            processedWorld[key] = { ...value, infusedWithAwtsmoos: true };
            
            // Periodically report progress back up the chain
            if (processedKeys % 10 === 0 || processedKeys === totalKeys) {
                const percent = Math.floor((processedKeys / totalKeys) * 100);
                self.postMessage({ type: 'PROGRESS', percent: percent, message: `Infusing realm: ${key}` });
            }
        });

        self.postMessage({ type: 'PROGRESS', percent: 100, message: 'All realms infused and stabilized.' });
        self.postMessage({ type: 'READY' });
    }
};
